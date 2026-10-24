import type { GuildData, ReadonlyGuildData } from "#server/database/settings";
import type { AutoModerationRulePlan } from "#server/database/settings/automod/storage";
import type { ParsedConfiguration } from "#server/utils/settings-transfer/parse";
import type { ConfigurationPreview } from "#shared/utils/settings-transfer";
import { isDeepStrictEqual } from "node:util";
import {
	toConfigurationRule,
	type ConfigurationRule,
	type TransferableSettingKey,
} from "#server/utils/settings-transfer/format";
import {
	getDefaultAutoModerationRule,
	MaximumAutoModerationRuleListLength,
	type AutoModerationRule,
	type AutoModerationRuleType,
} from "#shared/utils/automod-rules";

export interface PlannedSettingChange {
	name: string;
	key: TransferableSettingKey;
	before: unknown;
	after: unknown;
}

interface PlannedRuleUpdate {
	rule: AutoModerationRule;
	fields: (keyof ConfigurationRule)[];
	data: ConfigurationRule;
}

export interface PlannedRuleCreate {
	data: ConfigurationRule;
	/**
	 * The rule of the guild this one takes the place of, `null` for a rule the
	 * guild does not have. It is deleted and made again, with the exempt roles
	 * and channels it had, so it is where the file says.
	 */
	replaces: AutoModerationRule | null;
}

/** What an import does to the guild it is run in. */
export interface ConfigurationPlan {
	settings: PlannedSettingChange[];
	rules: {
		/** In the order of the file, which is the order they are created in. */
		create: PlannedRuleCreate[];
		/** The rules of the guild that have a rule of the file with their name and type, and differ from it. */
		update: PlannedRuleUpdate[];
		/** The rules of the guild the file does not have, or has with another type. */
		remove: AutoModerationRule[];
		/** How many rules the file and the guild agree on. */
		unchanged: number;
	};
	/** Whether the guild already is as the file says. */
	isEmpty: boolean;
}

/**
 * Works out what an import changes.
 *
 * - A setting is only written when its value differs, and the settings the
 *   file does not have are left as they are.
 * - The rules of the guild become the ones of the file. A rule is the same
 *   rule when it has the same name (whatever the case) and the same type:
 *   it is edited in place and keeps its ID and its exempt roles and channels.
 *   One of another type is deleted and made again, since the options of a rule
 *   depend on its type. The rules are left alone when the file has no
 *   `automod` section.
 * - A message is held to the first enabled rule of a type it infringes, so
 *   the order of the rules of a type decides which punishment a member gets.
 *   A rule has no position of its own, it is read by its ID, and one that is
 *   created gets an ID after every other. So the rules of a type that stay
 *   are the first ones of the file, as long as the guild has them in that
 *   order; from the first one that is new or out of place on, the rules of
 *   that type are made again, in the order of the file.
 *
 * Mirrors `planConfigurationImport()` in the bot.
 *
 * @param settings The settings of the guild, as the database has them.
 * @param rules The rules of the guild, as the database has them, oldest first.
 * @param parsed What the file holds, see `parseConfigurationFile`.
 */
export function planConfigurationImport(
	settings: ReadonlyGuildData,
	rules: readonly AutoModerationRule[],
	parsed: ParsedConfiguration,
): ConfigurationPlan {
	const changes: PlannedSettingChange[] = [];
	for (const { name, key, value } of parsed.settings) {
		const before = settings[key];
		if (!isDeepStrictEqual(before, value)) changes.push({ name, key, before, after: value });
	}

	const plan: ConfigurationPlan = {
		settings: changes,
		rules: { create: [], update: [], remove: [], unchanged: 0 },
		isEmpty: false,
	};

	if (parsed.rules !== null) {
		const unmatched = new Map(rules.map((rule) => [rule.name.toLowerCase(), rule]));
		// The ID of the last rule of each type that stays, `null` once a rule of the type is made: every rule of the
		// type the file has after it has to be made after it.
		const last = new Map<AutoModerationRuleType, bigint | null>();

		for (const data of parsed.rules) {
			const lower = data.name.toLowerCase();
			const rule = unmatched.get(lower);

			if (rule === undefined) {
				plan.rules.create.push({ data, replaces: null });
				last.set(data.type, null);
				continue;
			}

			unmatched.delete(lower);
			if (rule.type !== data.type) {
				plan.rules.remove.push(rule);
				plan.rules.create.push({ data, replaces: null });
				last.set(data.type, null);
				continue;
			}

			const id = BigInt(rule.id);
			const previous = last.get(data.type);
			if (previous === null || (previous !== undefined && id < previous)) {
				plan.rules.create.push({ data, replaces: rule });
				last.set(data.type, null);
				continue;
			}

			last.set(data.type, id);
			const existing = toConfigurationRule(rule);
			const fields = (Object.keys(data) as (keyof ConfigurationRule)[]).filter(
				(field) => !isDeepStrictEqual(existing[field], data[field]),
			);
			if (fields.length === 0) plan.rules.unchanged += 1;
			else plan.rules.update.push({ rule, fields, data });
		}

		plan.rules.remove.push(...unmatched.values());
	}

	plan.isEmpty =
		changes.length === 0 &&
		plan.rules.create.length === 0 &&
		plan.rules.update.length === 0 &&
		plan.rules.remove.length === 0;
	return plan;
}

/**
 * Finds the lists of the rules of a file that are longer than
 * `MaximumAutoModerationRuleListLength` and than the list the rule of the
 * guild with the same name and type has.
 *
 * `parseConfigurationFile` refuses them against the rules the guild had when
 * the file was read; this is the same check against the rules it has when the
 * import is written, which may be later.
 */
export function findOversizedRuleLists(
	rules: readonly AutoModerationRule[],
	parsed: ParsedConfiguration,
): { rule: string; option: string }[] {
	const oversized: { rule: string; option: string }[] = [];
	for (const data of parsed.rules ?? []) {
		const lower = data.name.toLowerCase();
		const current = rules.find(
			(rule) => rule.type === data.type && rule.name.toLowerCase() === lower,
		);
		const currentOptions = (current?.options ?? {}) as Record<string, unknown>;

		for (const [option, value] of Object.entries(data.options)) {
			if (!Array.isArray(value) || value.length <= MaximumAutoModerationRuleListLength) {
				continue;
			}

			const previous = currentOptions[option];
			if (!Array.isArray(previous) || value.length > previous.length) {
				oversized.push({ rule: data.name, option });
			}
		}
	}

	return oversized;
}

/** The changes of a plan to the settings, as `writeSettingsTransaction` takes them. */
export function getPlannedSettings(plan: ConfigurationPlan): Partial<GuildData> {
	const data: Record<string, unknown> = {};
	for (const { key, after } of plan.settings) data[key] = after;
	return data as Partial<GuildData>;
}

/**
 * The writes of a plan to the rules. A rule is edited with the fields that
 * differ and nothing else, so its exempt roles and channels are the ones the
 * guild has; a rule that is created starts from the defaults of its type,
 * which have none, and one that is made again to change place takes the ones
 * of the rule it replaces, which is deleted.
 */
export function getPlannedRules(plan: ConfigurationPlan): AutoModerationRulePlan {
	const replaced = plan.rules.create.flatMap(({ replaces }) =>
		replaces === null ? [] : [replaces.id],
	);
	return {
		remove: [...plan.rules.remove.map((rule) => rule.id), ...replaced],
		update: plan.rules.update.map(({ rule, fields, data }) => ({
			id: rule.id,
			data: Object.fromEntries(fields.map((field) => [field, data[field]])),
		})),
		create: plan.rules.create.map(({ data, replaces }) => ({
			...getDefaultAutoModerationRule(data.type),
			...data,
			...(replaces === null
				? {}
				: {
						ignoredRoles: replaces.ignoredRoles,
						ignoredChannels: replaces.ignoredChannels,
					}),
		})),
	};
}

/** What an import would do, for who has to confirm it. */
export function summarizeConfigurationPlan(
	plan: ConfigurationPlan,
	parsed: ParsedConfiguration,
): ConfigurationPreview {
	const moved = plan.rules.create.filter(({ replaces }) => replaces !== null);
	return {
		settings: plan.settings.map(({ name, before, after }) => ({ name, before, after })),
		rules:
			parsed.rules === null
				? null
				: {
						created: plan.rules.create
							.filter(({ replaces }) => replaces === null)
							.map(({ data }) => data.name),
						updated: plan.rules.update.map(({ rule, fields }) => ({
							name: rule.name,
							fields: fields.map(String),
						})),
						moved: moved.map(({ data }) => data.name),
						removed: plan.rules.remove.map((rule) => rule.name),
						unchanged: plan.rules.unchanged,
					},
		unsupported: parsed.unsupported,
		isEmpty: plan.isEmpty,
	};
}
