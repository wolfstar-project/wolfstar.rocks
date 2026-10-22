import type { Database, Models } from "#server/database/prisma";
import type { Snowflake } from "discord-api-types/v10";
import { asTimestampString, timestampStringToUtcIso } from "#server/utils/timestamp-string";
import {
	AUTO_DELETE_ALLOW_KINDS,
	AUTO_PURGE_FILTERS,
	type AutoDelete,
	type AutoDeleteAllowKind,
	type AutoDeleteData,
	type AutoPurge,
	type AutoPurgeData,
	type AutoPurgeFilter,
} from "#shared/utils/auto-channels";

/*
 * Mirrors `projects/database/src/settings/cleanup/storage.ts` in the bot. The
 * delays and the intervals are whole seconds here as in the columns, where the
 * bot converts them to milliseconds.
 */

type Orm = Database["orm"];
type PurgeRow = Omit<Models.public_GuildAutoPurge, "guild">;
type DeleteRow = Omit<Models.public_GuildAutoDelete, "guild">;

function isFilter(value: string): value is AutoPurgeFilter {
	return (AUTO_PURGE_FILTERS as readonly string[]).includes(value);
}

function isAllowKind(value: string): value is AutoDeleteAllowKind {
	return (AUTO_DELETE_ALLOW_KINDS as readonly string[]).includes(value);
}

function toAutoPurge(row: PurgeRow): AutoPurge {
	const known = isFilter(row.filter);
	return {
		channelId: String(row.channelId),
		// A filter this version does not know deletes nothing, rather than
		// everything, as the bot reads it.
		filter: known ? (row.filter as AutoPurgeFilter) : "user",
		id: String(row.id),
		interval: row.interval,
		nextRunAt: timestampStringToUtcIso(row.nextRunAt),
		value: known ? row.value : "",
	};
}

function toAutoDelete(row: DeleteRow): AutoDelete {
	return {
		allow: row.allow.filter((kind) => isAllowKind(kind)),
		bots: row.bots,
		channelId: String(row.channelId),
		delay: row.delay,
		id: String(row.id),
	};
}

function byId<T extends { id: string }>(a: T, b: T): number {
	return BigInt(a.id) < BigInt(b.id) ? -1 : 1;
}

/** Reads the channels of a guild that are purged, oldest first. */
export async function fetchAutoPurges(orm: Orm, guildId: Snowflake): Promise<AutoPurge[]> {
	const rows = await orm.public.GuildAutoPurge.where({ guildId: BigInt(guildId) }).all();
	return rows.map((row) => toAutoPurge(row)).toSorted(byId);
}

/**
 * Sets the purge of a channel, and creates the `Guild` row it references when
 * the guild has none yet. The writes belong together, so `orm` is a
 * transaction's `tx.orm`.
 *
 * @param nextRunAt When it runs next, in milliseconds.
 * @param language The language a `Guild` row is created with.
 */
export async function upsertAutoPurge(
	orm: Orm,
	guildId: Snowflake,
	channelId: Snowflake,
	data: AutoPurgeData,
	nextRunAt: number,
	language = "en-US",
): Promise<AutoPurge> {
	const id = BigInt(guildId);
	const channel = BigInt(channelId);
	const columns = {
		filter: data.filter,
		interval: data.interval,
		nextRunAt: asTimestampString(new Date(nextRunAt).toISOString()),
		value: data.value,
	};

	await orm.public.Guild.upsert({ create: { id, language }, update: { id } });
	const purges = orm.public.GuildAutoPurge;
	const count = await purges.where({ channelId: channel, guildId: id }).updateAndCount(columns);
	if (Number(count) === 0) await purges.create({ channelId: channel, guildId: id, ...columns });

	const row = await purges.first({ channelId: channel, guildId: id });
	if (!row) throw new Error(`The purge of channel ${channelId} was not written`);
	return toAutoPurge(row);
}

/**
 * Stops purging a channel.
 * @returns Whether the channel was purged.
 */
export async function removeAutoPurge(
	orm: Orm,
	guildId: Snowflake,
	channelId: Snowflake,
): Promise<boolean> {
	const count = await orm.public.GuildAutoPurge.where({
		channelId: BigInt(channelId),
		guildId: BigInt(guildId),
	}).deleteAndCount();
	return Number(count) > 0;
}

/** Reads the channels of a guild whose messages are deleted, oldest first. */
export async function fetchAutoDeletes(orm: Orm, guildId: Snowflake): Promise<AutoDelete[]> {
	const rows = await orm.public.GuildAutoDelete.where({ guildId: BigInt(guildId) }).all();
	return rows.map((row) => toAutoDelete(row)).toSorted(byId);
}

/**
 * Sets the automatic deletion of a channel, and creates the `Guild` row it
 * references when the guild has none yet. `orm` is a transaction's `tx.orm`.
 *
 * @param language The language a `Guild` row is created with.
 */
export async function upsertAutoDelete(
	orm: Orm,
	guildId: Snowflake,
	channelId: Snowflake,
	data: AutoDeleteData,
	language = "en-US",
): Promise<AutoDelete> {
	const id = BigInt(guildId);
	const channel = BigInt(channelId);
	const columns = { allow: [...data.allow], bots: data.bots, delay: data.delay };

	await orm.public.Guild.upsert({ create: { id, language }, update: { id } });
	const deletes = orm.public.GuildAutoDelete;
	const count = await deletes.where({ channelId: channel, guildId: id }).updateAndCount(columns);
	if (Number(count) === 0) await deletes.create({ channelId: channel, guildId: id, ...columns });

	const row = await deletes.first({ channelId: channel, guildId: id });
	if (!row) throw new Error(`The deletion of channel ${channelId} was not written`);
	return toAutoDelete(row);
}

/**
 * Stops deleting the messages of a channel.
 * @returns Whether the channel had its messages deleted.
 */
export async function removeAutoDelete(
	orm: Orm,
	guildId: Snowflake,
	channelId: Snowflake,
): Promise<boolean> {
	const count = await orm.public.GuildAutoDelete.where({
		channelId: BigInt(channelId),
		guildId: BigInt(guildId),
	}).deleteAndCount();
	return Number(count) > 0;
}
