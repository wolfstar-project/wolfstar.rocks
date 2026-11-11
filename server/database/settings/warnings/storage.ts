import type { Database } from "#server/database/prisma";
import type { Snowflake } from "discord-api-types/v10";
import {
	isWarnThresholdAction,
	type WarnThreshold,
	type WarnThresholdData,
} from "#shared/utils/warn-thresholds";

/*
 * Mirrors `projects/database/src/settings/warnings/storage.ts` in the bot. The
 * period and the duration are whole seconds here as in the columns, where the
 * bot converts them to milliseconds.
 */

type Orm = Database["orm"];

/** Reads the warning thresholds of a guild, by their number of warnings. */
export async function fetchWarnThresholds(orm: Orm, guildId: Snowflake): Promise<WarnThreshold[]> {
	const rows = await orm.public.GuildWarnThreshold.where({ guildId: BigInt(guildId) }).all();
	return (
		rows
			// An action this version does not know is skipped, as the bot skips it.
			.filter((row) => isWarnThresholdAction(row.action))
			.map((row) => ({
				action: row.action as WarnThreshold["action"],
				count: row.count,
				duration: row.duration,
				period: row.period,
			}))
			.toSorted((a, b) => a.count - b.count)
	);
}

/**
 * Sets the threshold of a number of warnings, replacing the one the guild had
 * for it, and creates the `Guild` row it references when the guild has none
 * yet. The writes belong together, so `orm` is a transaction's `tx.orm`.
 *
 * @param language The language a `Guild` row is created with.
 */
export async function upsertWarnThreshold(
	orm: Orm,
	guildId: Snowflake,
	count: number,
	data: WarnThresholdData,
	language = "en-US",
): Promise<WarnThreshold> {
	const id = BigInt(guildId);
	const columns = { action: data.action, duration: data.duration, period: data.period };

	await orm.public.Guild.upsert({ create: { id, language }, update: { id } });
	const thresholds = orm.public.GuildWarnThreshold;
	const updated = await thresholds.where({ count, guildId: id }).updateAndCount(columns);
	if (Number(updated) === 0) await thresholds.create({ count, guildId: id, ...columns });

	return { count, ...columns };
}

/**
 * Removes the threshold of a number of warnings.
 * @returns Whether the guild had it.
 */
export async function removeWarnThreshold(
	orm: Orm,
	guildId: Snowflake,
	count: number,
): Promise<boolean> {
	const deleted = await orm.public.GuildWarnThreshold.where({
		count,
		guildId: BigInt(guildId),
	}).deleteAndCount();
	return Number(deleted) > 0;
}
