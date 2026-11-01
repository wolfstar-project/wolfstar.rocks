import type { Database, Models } from "#server/database/prisma";
import type { Snowflake } from "discord-api-types/v10";
import { isRowId } from "#server/database/settings/ids";
import {
	normalizeAutoModerationRuleEscalation,
	normalizeAutoModerationRuleOptions,
	type AutoModerationRule,
	type AutoModerationRuleData,
} from "#shared/utils/automod-rules";

type Orm = Database["orm"];
type Row = Models.public_GuildAutoModerationRule;

function toRule(row: Pick<Row, keyof AutoModerationRuleData | "id" | "guildId">) {
	return {
		id: String(row.id),
		guildId: String(row.guildId),
		name: row.name,
		type: row.type,
		enabled: row.enabled,
		softAction: row.softAction,
		hardAction: row.hardAction,
		hardActionDuration: row.hardActionDuration,
		thresholdMaximum: row.thresholdMaximum,
		thresholdDuration: row.thresholdDuration,
		ignoredRoles: row.ignoredRoles.map(String),
		ignoredChannels: row.ignoredChannels.map(String),
		options: normalizeAutoModerationRuleOptions(row.type, row.options),
		escalation: normalizeAutoModerationRuleEscalation(row.escalation),
		escalationDuration: row.escalationDuration,
	} satisfies AutoModerationRule;
}

function toColumns(data: Partial<AutoModerationRuleData>) {
	const { ignoredRoles, ignoredChannels, ...rest } = data;
	return {
		...rest,
		...(ignoredRoles === undefined
			? {}
			: { ignoredRoles: ignoredRoles.map((id) => BigInt(id)) }),
		...(ignoredChannels === undefined
			? {}
			: { ignoredChannels: ignoredChannels.map((id) => BigInt(id)) }),
	};
}

/**
 * Reads the auto-moderation rules of a guild, oldest first.
 *
 * Mirrors `projects/database/src/settings/automod/storage.ts` in the bot.
 *
 * @param orm The ORM surface to read through, `db.orm` or a transaction's `tx.orm`.
 * @param guildId The guild's ID.
 */
export async function fetchAutoModerationRules(
	orm: Orm,
	guildId: Snowflake,
): Promise<AutoModerationRule[]> {
	const rows = await orm.public.GuildAutoModerationRule.where({ guildId: BigInt(guildId) }).all();
	return rows
		.map((row) => toRule(row))
		.toSorted((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1));
}

/**
 * Creates a rule, and the `Guild` row it references when the guild has none yet.
 *
 * The two writes belong together, so `orm` is a transaction's `tx.orm`: the
 * caller opens it, since it also holds the lock its writes run under.
 *
 * @param orm The transaction to write through.
 * @param guildId The guild's ID.
 * @param data The rule to create.
 * @param language The language a `Guild` row is created with.
 */
export async function insertAutoModerationRule(
	orm: Orm,
	guildId: Snowflake,
	data: AutoModerationRuleData,
	language = "en-US",
): Promise<AutoModerationRule> {
	const id = BigInt(guildId);
	await orm.public.Guild.upsert({ create: { id, language }, update: { id } });
	const row = await orm.public.GuildAutoModerationRule.create({
		...data,
		guildId: id,
		ignoredRoles: data.ignoredRoles.map((role) => BigInt(role)),
		ignoredChannels: data.ignoredChannels.map((channel) => BigInt(channel)),
	});
	return toRule(row);
}

/**
 * Edits a rule of a guild.
 * @param orm The ORM surface to write through, `db.orm` or a transaction's `tx.orm`.
 * @param guildId The guild's ID, so a rule of another guild is never edited.
 * @param ruleId The rule's ID.
 * @param data What changes.
 * @returns Whether the rule existed: `false` as well for an ID that is not one.
 */
export async function patchAutoModerationRule(
	orm: Orm,
	guildId: Snowflake,
	ruleId: string,
	data: Partial<AutoModerationRuleData>,
): Promise<boolean> {
	if (!isRowId(ruleId)) return false;

	const count = await orm.public.GuildAutoModerationRule.where({
		id: BigInt(ruleId),
		guildId: BigInt(guildId),
	}).updateAndCount(toColumns(data));
	return Number(count) > 0;
}

/**
 * Deletes a rule of a guild.
 * @returns Whether the rule existed.
 */
export async function removeAutoModerationRule(
	orm: Orm,
	guildId: Snowflake,
	ruleId: string,
): Promise<boolean> {
	if (!isRowId(ruleId)) return false;

	const count = await orm.public.GuildAutoModerationRule.where({
		id: BigInt(ruleId),
		guildId: BigInt(guildId),
	}).deleteAndCount();
	return Number(count) > 0;
}

/** What an import changes in the rules of a guild, by the ID of the rule. */
export interface AutoModerationRulePlan {
	remove: string[];
	update: { id: string; data: Partial<AutoModerationRuleData> }[];
	create: AutoModerationRuleData[];
}

/**
 * Writes a plan to the rules of a guild: the rules are deleted first, so a
 * rule that is made again can take the name of the one it replaces, then edited,
 * then created in order, which gives them the IDs the order is read by.
 *
 * The writes belong together, so `orm` is a transaction's `tx.orm`.
 *
 * @param language The language a `Guild` row is created with.
 * @returns The rules that were created.
 */
export async function writeAutoModerationRulePlan(
	orm: Orm,
	guildId: Snowflake,
	plan: AutoModerationRulePlan,
	language = "en-US",
): Promise<AutoModerationRule[]> {
	for (const id of plan.remove) await removeAutoModerationRule(orm, guildId, id);
	for (const { id, data } of plan.update) await patchAutoModerationRule(orm, guildId, id, data);

	const created: AutoModerationRule[] = [];
	for (const data of plan.create) {
		created.push(await insertAutoModerationRule(orm, guildId, data, language));
	}
	return created;
}
