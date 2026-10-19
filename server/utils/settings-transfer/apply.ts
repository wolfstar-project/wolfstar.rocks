import type { ParsedConfiguration } from "#server/utils/settings-transfer/parse";
import type { AutoModerationRule } from "#shared/utils/automod-rules";
import type { Snowflake } from "discord-api-types/v10";
import { serializeSettings, writeSettingsTransaction } from "#server/database";
import { writeAutoModerationRulePlan } from "#server/database/settings/automod/storage";
import { writeAutoModerationRules } from "#server/utils/automod/rules";
import {
	findOversizedRuleLists,
	getPlannedRules,
	getPlannedSettings,
	planConfigurationImport,
	type ConfigurationPlan,
} from "#server/utils/settings-transfer/plan";

/**
 * What an import throws when the guild changed since the file was read in a
 * way that makes it a file the import would have refused: nothing was written,
 * and the file has to be read again.
 */
export class ConfigurationImportStaleError extends Error {
	public constructor() {
		super("The server changed since the file of the import was read.");
	}
}

export interface AppliedConfiguration {
	plan: ConfigurationPlan;
	/** The settings of the guild as they are now, serialized as the settings route answers them. */
	settings: Record<string, unknown>;
	/** The rules of the guild as they are now, oldest first. */
	rules: AutoModerationRule[];
	/** What the audit log records: the values before and after, by the key they are filed under. */
	audit: { before: Record<string, unknown>; after: Record<string, unknown> };
}

/**
 * Writes what a file holds to a guild, in one database transaction: the
 * settings and the rules are all written or none is.
 *
 * What is written is worked out again from what the database has under the
 * locks of the settings and of the rules, not from what the admin was shown,
 * since the guild may have changed while they decided. A plan that finds
 * nothing to do writes nothing.
 *
 * Mirrors `applyConfigurationImport()` in the bot, which takes the locks in the
 * same order, the settings and then the rules.
 *
 * @throws {@linkcode ConfigurationImportStaleError} When a list of a rule of
 * the file is longer than the limit and than the one the rule of the guild has
 * by now.
 */
export async function applyConfigurationImport(
	guildId: Snowflake,
	parsed: ParsedConfiguration,
): Promise<AppliedConfiguration> {
	using transaction = await writeSettingsTransaction(guildId);

	// Awaited here: the lock of the settings is released when this function
	// returns, which a promise that is only returned would do before it settles.
	return await writeAutoModerationRules(guildId, async (rules) => {
		if (findOversizedRuleLists(rules, parsed).length > 0) {
			throw new ConfigurationImportStaleError();
		}

		const plan = planConfigurationImport(transaction.settings, rules, parsed);
		const rulePlan = getPlannedRules(plan);
		const rulesChanged =
			rulePlan.create.length + rulePlan.update.length + rulePlan.remove.length > 0;

		const audit = buildAudit(plan);
		if (plan.isEmpty) {
			return { plan, settings: toSettings(transaction.settings), rules: [...rules], audit };
		}

		let created: AutoModerationRule[] = [];
		if (plan.settings.length > 0) transaction.write(getPlannedSettings(plan));
		await transaction.submit(
			rulesChanged
				? async (tx) => {
						created = await writeAutoModerationRulePlan(
							tx.orm,
							guildId,
							rulePlan,
							transaction.settings.language,
						);
					}
				: undefined,
		);

		return {
			plan,
			settings: toSettings(transaction.settings),
			rules: rulesAfter(plan, rules, created),
			audit: buildAudit(plan, created),
		};
	});
}

function toSettings(settings: Parameters<typeof serializeSettings>[0]) {
	return JSON.parse(serializeSettings(settings)) as Record<string, unknown>;
}

/**
 * The rules of the guild once the plan is written, in the order they are read
 * in from then on: the rules that stay keep their place, the ones that are
 * created have the last IDs.
 */
function rulesAfter(
	plan: ConfigurationPlan,
	rules: readonly AutoModerationRule[],
	created: readonly AutoModerationRule[],
): AutoModerationRule[] {
	const gone = new Set([
		...plan.rules.remove.map((rule) => rule.id),
		...plan.rules.create.flatMap(({ replaces }) => (replaces === null ? [] : [replaces.id])),
	]);
	const updated = new Map(plan.rules.update.map(({ rule, data }) => [rule.id, data]));
	const kept: AutoModerationRule[] = [];
	for (const rule of rules) {
		if (!gone.has(rule.id)) {
			kept.push(Object.assign({}, rule, updated.get(rule.id)) as AutoModerationRule);
		}
	}
	return [...kept, ...created];
}

/**
 * The audit diff of an import: a setting is filed under its key, as every
 * change of the settings is, and a rule under `automodRule.<name>` as the rule
 * routes file it. The `/` of a name would split the key of the diff, `∕`
 * reads the same.
 */
function buildAudit(plan: ConfigurationPlan, created: readonly AutoModerationRule[] = []) {
	const before: Record<string, unknown> = {};
	const after: Record<string, unknown> = {};
	for (const change of plan.settings) {
		before[change.key] = change.before;
		after[change.key] = change.after;
	}

	const ruleKey = (name: string) => `automodRule.${name.replaceAll("/", "∕")}`;
	for (const rule of plan.rules.remove) before[ruleKey(rule.name)] = rule;
	for (const { rule, data } of plan.rules.update) {
		before[ruleKey(rule.name)] = rule;
		after[ruleKey(data.name)] = { ...rule, ...data };
	}
	for (const [index, { data, replaces }] of plan.rules.create.entries()) {
		if (replaces !== null) before[ruleKey(replaces.name)] = replaces;
		const rule = created[index];
		if (rule) after[ruleKey(data.name)] = rule;
	}

	return { before, after };
}
