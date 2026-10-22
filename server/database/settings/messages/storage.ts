import type { Database, Models } from "#server/database/prisma";
import type { AutoMessage, AutoMessageData } from "#shared/utils/auto-channels";
import type { Snowflake } from "discord-api-types/v10";
import { asTimestampString, timestampStringToUtcIso } from "#server/utils/timestamp-string";

/*
 * Mirrors `projects/database/src/settings/messages/storage.ts` in the bot.
 * The intervals are whole seconds here as in the column. `last_message_id` is
 * the bot's own: it remembers the message it sent last, so it is never written
 * from here.
 */

type Orm = Database["orm"];
type Row = Omit<Models.public_GuildAutoMessage, "guild">;

function toAutoMessage(row: Row): AutoMessage {
	return {
		channelId: String(row.channelId),
		content: row.content,
		id: String(row.id),
		interval: row.interval,
		mentions: row.mentions,
		nextRunAt: timestampStringToUtcIso(row.nextRunAt),
	};
}

/** Reads the automatic messages of a guild, oldest first. */
export async function fetchAutoMessages(orm: Orm, guildId: Snowflake): Promise<AutoMessage[]> {
	const rows = await orm.public.GuildAutoMessage.where({ guildId: BigInt(guildId) }).all();
	return rows
		.map((row) => toAutoMessage(row))
		.toSorted((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1));
}

/**
 * Sets the automatic message of a channel, and creates the `Guild` row it
 * references when the guild has none yet. `orm` is a transaction's `tx.orm`.
 *
 * @param nextRunAt When it is sent next, in milliseconds.
 * @param language The language a `Guild` row is created with.
 */
export async function upsertAutoMessage(
	orm: Orm,
	guildId: Snowflake,
	channelId: Snowflake,
	data: AutoMessageData,
	nextRunAt: number,
	language = "en-US",
): Promise<AutoMessage> {
	const id = BigInt(guildId);
	const channel = BigInt(channelId);
	const columns = {
		content: data.content,
		interval: data.interval,
		mentions: data.mentions,
		nextRunAt: asTimestampString(new Date(nextRunAt).toISOString()),
	};

	await orm.public.Guild.upsert({ create: { id, language }, update: { id } });
	const messages = orm.public.GuildAutoMessage;
	const count = await messages.where({ channelId: channel, guildId: id }).updateAndCount(columns);
	if (Number(count) === 0) await messages.create({ channelId: channel, guildId: id, ...columns });

	const row = await messages.first({ channelId: channel, guildId: id });
	if (!row) throw new Error(`The message of channel ${channelId} was not written`);
	return toAutoMessage(row);
}

/**
 * Stops sending the automatic message of a channel.
 * @returns Whether the channel had one.
 */
export async function removeAutoMessage(
	orm: Orm,
	guildId: Snowflake,
	channelId: Snowflake,
): Promise<boolean> {
	const count = await orm.public.GuildAutoMessage.where({
		channelId: BigInt(channelId),
		guildId: BigInt(guildId),
	}).deleteAndCount();
	return Number(count) > 0;
}
