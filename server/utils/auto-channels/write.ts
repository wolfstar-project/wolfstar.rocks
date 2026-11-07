import type { Snowflake } from "discord-api-types/v10";
import { db, type Database } from "#server/database/prisma";
import {
	fetchAutoDeletes,
	fetchAutoPurges,
	removeAutoDelete,
	removeAutoPurge,
	upsertAutoDelete,
	upsertAutoPurge,
} from "#server/database/settings/cleanup/storage";
import {
	fetchAutoMessages,
	removeAutoMessage,
	upsertAutoMessage,
} from "#server/database/settings/messages/storage";
import { notifyGuildSettingsUpdate } from "#server/database/settings/notify";
import { createKeyedLock } from "#server/utils/keyed-lock";
import {
	MAXIMUM_AUTO_DELETES,
	MAXIMUM_AUTO_MESSAGES,
	MAXIMUM_AUTO_PURGES,
	type AutoDelete,
	type AutoDeleteData,
	type AutoMessage,
	type AutoMessageData,
	type AutoPurge,
	type AutoPurgeData,
} from "#shared/utils/auto-channels";
import { ChannelType } from "discord-api-types/v10";

/**
 * The tables of the channels the bot works in on its own, each with the
 * namespace of the advisory lock its writes run under. The namespaces are
 * arbitrary; they only differ from each other and from the rules' one.
 */
export const AutoChannelKinds = {
	autoDelete: { lockNamespace: 1_635_086_446, maximum: MAXIMUM_AUTO_DELETES },
	autoMessage: { lockNamespace: 1_635_086_448, maximum: MAXIMUM_AUTO_MESSAGES },
	autoPurge: { lockNamespace: 1_635_086_447, maximum: MAXIMUM_AUTO_PURGES },
} as const;

export type AutoChannelKind = keyof typeof AutoChannelKinds;

/**
 * What goes wrong when a channel is set or cleared: the server has as many as
 * it can have, the channel has none to clear, or it is no text channel of the
 * server.
 */
export type AutoChannelErrorCode = "channel" | "limit" | "unknown";

export class AutoChannelError extends Error {
	public constructor(public readonly code: AutoChannelErrorCode) {
		super(`Automatic channel error: ${code}`);
	}
}

/** What a write changed: the row as it was, `null` for a new one, and as it is, `null` once cleared. */
export interface AutoChannelChange<T> {
	before: T | null;
	after: T | null;
}

type Orm = Database["orm"];

const LOCK_KEY_RANGE = 2_147_483_647n;
const withKeyLock = createKeyedLock();

/**
 * Runs the writes of one table for a guild one after the other, as the rules
 * are written: the queue orders those of this process, the transaction-scoped
 * advisory lock those of the other instances of the dashboard. The bot counts
 * its rows under its own Redis lock, which this one does not take; the unique
 * index on the channel is what holds against it.
 */
async function writeAutoChannels<T>(
	kind: AutoChannelKind,
	guildId: Snowflake,
	callback: (orm: Orm) => Promise<T>,
): Promise<T> {
	return withKeyLock(`${kind}:${guildId}`, () => {
		const guildKey = Number(BigInt(guildId) % LOCK_KEY_RANGE);
		return db.transaction(async (tx) => {
			await tx.execute(
				db.raw
					.sql`SELECT pg_advisory_xact_lock(${AutoChannelKinds[kind].lockNamespace}, ${guildKey})`
					.affectedCount()
					.build(),
			);
			const result = await callback(tx.orm);
			// The bot caches these channels: it reloads them on this, once committed.
			await notifyGuildSettingsUpdate(tx, guildId, [kind]);
			return result;
		});
	});
}

// The bot works in text and announcement channels only (`/autodelete enable`
// and the others offer no other kind).
const TEXT_CHANNEL_TYPES: ReadonlySet<ChannelType> = new Set([
	ChannelType.GuildText,
	ChannelType.GuildAnnouncement,
]);

/**
 * Checks that a channel is a text channel of the guild. The channel is unique
 * in each table, whatever the guild, so without it a guild could hold the
 * channel of another.
 *
 * @throws {@linkcode AutoChannelError} `channel` otherwise.
 */
export async function assertGuildTextChannel(guildId: Snowflake, channelId: string): Promise<void> {
	const channels = await getGuildChannels(guildId);
	const channel = channels.find((candidate) => candidate.id === channelId);
	if (!channel || !TEXT_CHANNEL_TYPES.has(channel.type)) throw new AutoChannelError("channel");
}

/**
 * When a schedule runs next: an interval from now when its interval changes,
 * else `null`, which keeps the time in the row. Writing back the time read
 * here would undo the bot's move after a run that happened meanwhile, and the
 * schedule would run again at once.
 */
function nextRun(before: { interval: number } | null, interval: number): number | null {
	if (before && before.interval === interval) return null;
	return Date.now() + interval * 1000;
}

function readAll(kind: AutoChannelKind, guildId: Snowflake) {
	return (orm: Orm) => {
		switch (kind) {
			case "autoDelete":
				return fetchAutoDeletes(orm, guildId);
			case "autoPurge":
				return fetchAutoPurges(orm, guildId);
			case "autoMessage":
				return fetchAutoMessages(orm, guildId);
		}
	};
}

/** Reads the rows of one table for a guild, oldest first. */
export function readAutoDeletes(guildId: Snowflake): Promise<AutoDelete[]> {
	return fetchAutoDeletes(db.orm, guildId);
}

export function readAutoPurges(guildId: Snowflake): Promise<AutoPurge[]> {
	return fetchAutoPurges(db.orm, guildId);
}

export function readAutoMessages(guildId: Snowflake): Promise<AutoMessage[]> {
	return fetchAutoMessages(db.orm, guildId);
}

/**
 * Finds the row of a channel, and refuses a new one past the most the guild
 * can have.
 */
async function rowFor<T extends { channelId: string }>(
	kind: AutoChannelKind,
	rows: readonly T[],
	channelId: string,
): Promise<T | null> {
	const before = rows.find((row) => row.channelId === channelId) ?? null;
	if (!before && rows.length >= AutoChannelKinds[kind].maximum) {
		throw new AutoChannelError("limit");
	}
	return before;
}

/** Sets the automatic deletion of a channel, a new one or the one it has. */
export function setAutoDelete(
	guildId: Snowflake,
	channelId: string,
	data: AutoDeleteData,
): Promise<AutoChannelChange<AutoDelete>> {
	return writeAutoChannels("autoDelete", guildId, async (orm) => {
		const before = await rowFor("autoDelete", await fetchAutoDeletes(orm, guildId), channelId);
		const after = await upsertAutoDelete(orm, guildId, channelId, data);
		return { after, before };
	});
}

/** Sets the purge of a channel; its next run moves only when its interval does. */
export function setAutoPurge(
	guildId: Snowflake,
	channelId: string,
	data: AutoPurgeData,
): Promise<AutoChannelChange<AutoPurge>> {
	return writeAutoChannels("autoPurge", guildId, async (orm) => {
		const before = await rowFor("autoPurge", await fetchAutoPurges(orm, guildId), channelId);
		const after = await upsertAutoPurge(
			orm,
			guildId,
			channelId,
			data,
			nextRun(before, data.interval),
		);
		return { after, before };
	});
}

/** Sets the automatic message of a channel; its next run moves only when its interval does. */
export function setAutoMessage(
	guildId: Snowflake,
	channelId: string,
	data: AutoMessageData,
): Promise<AutoChannelChange<AutoMessage>> {
	return writeAutoChannels("autoMessage", guildId, async (orm) => {
		const before = await rowFor(
			"autoMessage",
			await fetchAutoMessages(orm, guildId),
			channelId,
		);
		const after = await upsertAutoMessage(
			orm,
			guildId,
			channelId,
			data,
			nextRun(before, data.interval),
		);
		return { after, before };
	});
}

const REMOVERS = {
	autoDelete: removeAutoDelete,
	autoMessage: removeAutoMessage,
	autoPurge: removeAutoPurge,
} as const satisfies Record<
	AutoChannelKind,
	(orm: Orm, guildId: Snowflake, channelId: Snowflake) => Promise<boolean>
>;

/**
 * Clears the row of a channel in one table.
 *
 * @returns The row that was cleared.
 * @throws {@linkcode AutoChannelError} `unknown` when the channel has none.
 */
export function clearAutoChannel(
	kind: AutoChannelKind,
	guildId: Snowflake,
	channelId: string,
): Promise<AutoDelete | AutoPurge | AutoMessage> {
	return writeAutoChannels(kind, guildId, async (orm) => {
		const rows: readonly (AutoDelete | AutoPurge | AutoMessage)[] = await readAll(
			kind,
			guildId,
		)(orm);
		const before = rows.find((row) => row.channelId === channelId);
		if (!before || !(await REMOVERS[kind](orm, guildId, channelId))) {
			throw new AutoChannelError("unknown");
		}
		return before;
	});
}
