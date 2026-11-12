import type { Database, Models } from "#server/database/prisma";
import type { JoinGuardRule, JoinGuardRuleInput } from "#shared/utils/join-guard";
import type { Snowflake } from "discord-api-types/v10";
import { isRowId } from "#server/database/settings/ids";
import { timestampStringToDate } from "#server/utils/timestamp-string";

type Orm = Database["orm"];
type RuleRow = Omit<Models.public_GuildJoinGuardRule, "guild">;

function toSnowflake(value: bigint | null): Snowflake | null {
	return value === null ? null : String(value);
}

function toBigInt(value: Snowflake | null): bigint | null {
	return value === null ? null : BigInt(value);
}

/** A rule as the dashboard reads it, from its row. */
function toJoinGuardRule(row: RuleRow): JoinGuardRule {
	return {
		id: String(row.id),
		name: row.name,
		enabled: row.enabled,
		accountAgeMax: row.accountAgeMax,
		defaultAvatar: row.defaultAvatar,
		generatedName: row.generatedName,
		nameContains: row.nameContains,
		unverifiedBot: row.unverifiedBot,
		sendToCheckpoint: row.sendToCheckpoint,
		roleId: toSnowflake(row.roleId),
		directMessage: row.directMessage,
		alertChannelId: toSnowflake(row.alertChannelId),
		hardAction: row.hardAction,
		createdAt: timestampStringToDate(row.createdAt).getTime(),
	};
}

/** The columns of the fields of a rule that are given, the IDs as `bigint`. */
function toColumns(data: Partial<JoinGuardRuleInput>) {
	const { roleId, alertChannelId, ...rest } = data;
	return {
		...rest,
		...(roleId === undefined ? {} : { roleId: toBigInt(roleId) }),
		...(alertChannelId === undefined ? {} : { alertChannelId: toBigInt(alertChannelId) }),
	};
}

/**
 * Reads the rules of the join guard of a guild, oldest first.
 *
 * Mirrors `fetchJoinGuardRules()` of `projects/database/src/settings/joinguard/storage.ts`
 * in the bot.
 *
 * @param orm The ORM surface to read through, `db.orm` or a transaction's `tx.orm`.
 * @param guildId The guild's ID.
 */
export async function fetchJoinGuardRuleRows(
	orm: Orm,
	guildId: Snowflake,
): Promise<JoinGuardRule[]> {
	const rows = await orm.public.GuildJoinGuardRule.where({ guildId: BigInt(guildId) }).all();
	return rows
		.map((row) => toJoinGuardRule(row))
		.toSorted((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1));
}

/**
 * Reads a rule of a guild by its ID.
 * @returns The rule, `null` when the guild has none with that ID, or the ID is not one.
 */
export async function fetchJoinGuardRuleRow(
	orm: Orm,
	guildId: Snowflake,
	ruleId: string,
): Promise<JoinGuardRule | null> {
	if (!isRowId(ruleId)) return null;

	const row = await orm.public.GuildJoinGuardRule.first({
		id: BigInt(ruleId),
		guildId: BigInt(guildId),
	});
	return row === null ? null : toJoinGuardRule(row);
}

/**
 * Creates a rule, and the `Guild` row it references when the guild has none
 * yet. The two writes belong together, so `orm` is a transaction's `tx.orm`.
 *
 * @param orm The transaction to write through.
 * @param guildId The guild's ID.
 * @param data The rule.
 * @param language The language a `Guild` row is created with.
 */
export async function insertJoinGuardRule(
	orm: Orm,
	guildId: Snowflake,
	data: JoinGuardRuleInput,
	language = "en-US",
): Promise<JoinGuardRule> {
	const id = BigInt(guildId);
	await orm.public.Guild.upsert({ create: { id, language }, update: { id } });
	const row = await orm.public.GuildJoinGuardRule.create({
		guildId: id,
		name: data.name,
		enabled: data.enabled,
		accountAgeMax: data.accountAgeMax,
		defaultAvatar: data.defaultAvatar,
		generatedName: data.generatedName,
		nameContains: data.nameContains,
		unverifiedBot: data.unverifiedBot,
		sendToCheckpoint: data.sendToCheckpoint,
		roleId: toBigInt(data.roleId),
		directMessage: data.directMessage,
		alertChannelId: toBigInt(data.alertChannelId),
		hardAction: data.hardAction,
	});
	return toJoinGuardRule(row);
}

/**
 * Edits a rule of a guild.
 * @param orm The ORM surface to write through.
 * @param guildId The guild's ID, so a rule of another guild is never edited.
 * @param ruleId The rule's ID.
 * @param data What changes.
 * @returns Whether the rule existed: `false` as well for an ID that is not one.
 */
export async function patchJoinGuardRule(
	orm: Orm,
	guildId: Snowflake,
	ruleId: string,
	data: Partial<JoinGuardRuleInput>,
): Promise<boolean> {
	if (!isRowId(ruleId)) return false;

	const count = await orm.public.GuildJoinGuardRule.where({
		id: BigInt(ruleId),
		guildId: BigInt(guildId),
	}).updateAndCount(toColumns(data));
	return Number(count) > 0;
}

/**
 * Deletes a rule of a guild. The rows of the queue it stopped keep its name,
 * and lose the rule (`ON DELETE SET NULL`).
 * @returns Whether the rule existed.
 */
export async function removeJoinGuardRule(
	orm: Orm,
	guildId: Snowflake,
	ruleId: string,
): Promise<boolean> {
	if (!isRowId(ruleId)) return false;

	const count = await orm.public.GuildJoinGuardRule.where({
		id: BigInt(ruleId),
		guildId: BigInt(guildId),
	}).deleteAndCount();
	return Number(count) > 0;
}
