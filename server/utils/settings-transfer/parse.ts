import { getDefaultGuildSettings } from "#server/database/settings/constants";
import { parseSettingsChanges } from "#server/database/settings/validation";
import { parseAutoModerationRulePatch } from "#server/utils/automod/validation";
import {
	BotOnlySettings,
	findTransferableSetting,
	RemovedSettings,
	toConfigurationRule,
	ConfigurationRuleFields,
	type ConfigurationRule,
	type TransferableSettingKey,
} from "#server/utils/settings-transfer/format";
import {
	convertLegacySettings,
	getLegacyFilterPrefix,
	isLegacySetting,
	type LegacyConversion,
} from "#server/utils/settings-transfer/legacy";
import {
	AutoModerationRuleTypes,
	getDefaultAutoModerationRule,
	getDefaultAutoModerationRuleOptions,
	isAutoModerationRuleType,
	MaximumAutoModerationRuleNameLength,
	MaximumAutoModerationRules,
	normalizeAutoModerationRuleOptions,
	type AutoModerationRule,
	type AutoModerationRuleType,
	AutoModerationSoftActionBits,
} from "#shared/utils/automod-rules";
import {
	ReadableConfigurationFileVersions,
	type ConfigurationIssue,
	type ConfigurationNotice,
} from "#shared/utils/settings-transfer";
import { isObject } from "@sapphire/utilities";

/** What a file holds once every value of it was validated. */
export interface ParsedConfiguration {
	/** The settings of the file this dashboard manages, by their name, validated. */
	settings: { name: string; key: TransferableSettingKey; value: unknown }[];
	/** The settings of the file this dashboard does not manage, by their name. */
	unsupported: string[];
	/** The rules of the file, `null` when it has no `automod` section: the rules of the guild are left alone. */
	rules: ConfigurationRule[] | null;
	/**
	 * The rules the filters of the bot before V7 became when the file has no
	 * `automod` section: they are added to the rules the guild has when the
	 * import is written (one with the name of a rule of the guild takes its
	 * place), see `getImportedRules`. Empty when the file has an `automod`
	 * section, which holds them.
	 */
	addedRules: ConfigurationRule[];
	/** What a file of the bot before V7 has that could not be imported, and how to set it by hand. */
	notices: ConfigurationNotice[];
}

export type ParseConfigurationResult =
	| { ok: true; value: ParsedConfiguration }
	| { ok: false; issues: ConfigurationIssue[] };

const FileFields = new Set(["version", "exportedAt", "settings", "automod"]);

/**
 * Reads a file from text that is not trusted.
 *
 * Nothing is written, and nothing is dropped silently: the file is accepted
 * whole or refused with everything that is wrong in it. A setting that is not
 * one of the file is refused when the bot has no such setting either way, and
 * left out, and reported, when this dashboard does not manage it. A file of
 * version 1 can be one of the bot before V7, whose settings are converted
 * (see `convertLegacySettings`): what of them cannot be is not a reason to
 * refuse the file, which is all the admin has of that bot, and is told in the
 * `notices` instead.
 *
 * @param text The content of the file.
 * @param rules The rules of the guild the file is imported in: a list of a rule can be as long as the one the rule of
 * the same name and type has there.
 */
export function parseConfigurationFile(
	text: string,
	rules: readonly AutoModerationRule[],
): ParseConfigurationResult {
	let data: unknown;
	try {
		data = JSON.parse(text);
	} catch {
		return failure([{ path: "", message: "The file is not valid JSON." }]);
	}

	if (!isObject(data)) return failure([{ path: "", message: "The file is not an object." }]);

	const record = data as Record<string, unknown>;
	const { version } = record;
	if (typeof version !== "number" || !Number.isInteger(version)) {
		return failure([{ path: "version", message: "The file has no version." }]);
	}
	if (!ReadableConfigurationFileVersions.includes(version)) {
		return failure([
			{
				path: "version",
				message: `Version ${version} is not supported: expected ${ReadableConfigurationFileVersions.join(" or ")}.`,
			},
		]);
	}

	const issues: ConfigurationIssue[] = [];
	for (const field of Object.keys(record)) {
		if (!FileFields.has(field))
			issues.push({ path: field, message: `Unknown field "${field}".` });
	}

	const { settings, unsupported, legacy } = parseSettings(record.settings, version, issues);
	const parsedRules = parseRules(record.automod, rules, issues);
	const notices: ConfigurationNotice[] = [];
	const addedRules =
		legacy === null ? [] : importLegacy(legacy, settings, parsedRules, rules, notices);

	return issues.length === 0
		? { ok: true, value: { settings, unsupported, rules: parsedRules, addedRules, notices } }
		: failure(issues);
}

function parseSettings(section: unknown, version: number, issues: ConfigurationIssue[]) {
	const settings: ParsedConfiguration["settings"] = [];
	const unsupported: string[] = [];
	if (section === undefined) return { settings, unsupported, legacy: null };

	if (!isObject(section)) {
		issues.push({ path: "settings", message: "Expected an object." });
		return { settings, unsupported, legacy: null };
	}

	// The settings of the bot before V7, which only a file of version 1 has, are converted after the others:
	const legacy: Record<string, unknown> = {};
	for (const [name, value] of Object.entries(section as Record<string, unknown>)) {
		if (RemovedSettings.has(name)) continue;

		const path = `settings.${name}`;
		const key = findTransferableSetting(name);
		if (key === null) {
			if (BotOnlySettings.has(name)) unsupported.push(name);
			else if (version === 1 && isLegacySetting(name)) legacy[name] = value;
			// A file of version 2 is the bot's, which gains settings this dashboard
			// learns of later: one it does not know is left out and named, rather
			// than refusing every export of a newer bot. A setting of the bot before
			// V7 is not one of those, and still refuses the file.
			else if (version >= 2 && !isLegacySetting(name)) unsupported.push(name);
			else {
				issues.push({
					path,
					message: `"${name}" is not a setting a file carries: it does not exist, or it depends on the server.`,
				});
			}
			continue;
		}

		const result = validateSetting(key, value);
		if (result.ok) settings.push({ name, key, value: result.value });
		else issues.push({ path, message: result.message });
	}

	return {
		settings,
		unsupported,
		legacy: Object.keys(legacy).length === 0 ? null : convertLegacySettings(legacy),
	};
}

type ValueResult = { ok: true; value: unknown } | { ok: false; message: string };

/** Validates the value of a setting as a settings request is, with what a file means by `null`. */
function validateSetting(key: TransferableSettingKey, value: unknown): ValueResult {
	// `null` resets a setting to its default in a settings request; a file
	// says what a setting is, which is `null` only for a setting that can be
	// nothing, as a command response that is the bot's own line:
	if (value === null) {
		return getDefaultGuildSettings()[key] === null
			? { ok: true, value: null }
			: { ok: false, message: "Expected a value." };
	}

	const parsed = parseSettingsChanges([[key, value]]);
	if (parsed.errors) {
		return {
			ok: false,
			message: parsed.errors.map((error) => error.replace(/^[^:]+: /u, "")).join(" "),
		};
	}
	return { ok: true, value: (parsed.data as Record<string, unknown>)[key] };
}

/**
 * Imports what the settings of the bot before V7 became, see
 * `convertLegacySettings`. What cannot be imported is told, with how to set it
 * by hand, instead of refusing the file.
 *
 * @param fileRules - The rules of the file, which the rules the filters became are added to; `null` when it has no
 * `automod` section.
 * @param current - The rules of the guild, which the names and the limit are checked against without an `automod`
 * section. The ones it has when the import is written are used again then.
 * @returns The rules the filters became, to add to the ones of the guild, when the file has no `automod` section:
 * the bot before V7 had no rule to replace the others with.
 */
function importLegacy(
	legacy: LegacyConversion,
	settings: ParsedConfiguration["settings"],
	fileRules: ConfigurationRule[] | null,
	current: readonly AutoModerationRule[],
	notices: ConfigurationNotice[],
): ConfigurationRule[] {
	notices.push(...legacy.notices);
	for (const conversion of legacy.settings) importLegacySetting(conversion, settings, notices);

	const added: ConfigurationRule[] = [];
	const rules = fileRules ?? current.map((rule) => toConfigurationRule(rule));
	// The rules added that take no place of a rule of the guild:
	let created = 0;
	for (const entry of legacy.rules) {
		const name = String(entry.name);
		const path = `settings.${getLegacyFilterPrefix(name).slice(0, -1)}`;
		const failed = (reason: string) =>
			notices.push({ kind: "ruleFailed", path, rule: name, reason });

		const ruleIssues: ConfigurationIssue[] = [];
		const rule = parseRule(entry, path, current, ruleIssues);
		if (rule === null || ruleIssues.length > 0) {
			failed(ruleIssues.map((issue) => issue.message).join(" "));
			continue;
		}

		const lower = rule.name.toLowerCase();
		const exists = rules.some((other) => other.name.toLowerCase() === lower);
		if (fileRules !== null && exists) {
			failed(`Two rules are named "${rule.name}".`);
		} else if (!exists && rules.length + created >= MaximumAutoModerationRules) {
			failed(
				`The server already has ${MaximumAutoModerationRules} rules, which is the most it can have.`,
			);
		} else if (fileRules !== null) {
			fileRules.push(rule);
		} else {
			added.push(rule);
			if (!exists) created += 1;
		}
	}

	return added;
}

/**
 * Imports a renamed setting of the bot before V7 as the setting of V7 it
 * became. The entries of a list that V7 refuses are left out one by one, and
 * the others are imported.
 */
function importLegacySetting(
	{ name, value, from }: LegacyConversion["settings"][number],
	settings: ParsedConfiguration["settings"],
	notices: ConfigurationNotice[],
) {
	const key = findTransferableSetting(name);
	// The file has the setting under its name in V7 too, which is the one it was exported with last:
	if (key === null || settings.some((setting) => setting.key === key)) return;

	const path = `settings.${from[0] ?? name}`;
	const failed = (shown: string, reason: string) =>
		notices.push({ kind: "settingFailed", path, name: shown, target: name, reason });

	if (!Array.isArray(getDefaultGuildSettings()[key])) {
		const result = validateSetting(key, value);
		if (result.ok) settings.push({ name, key, value: result.value });
		else failed(from.join(", "), result.message);
		return;
	}

	const kept: unknown[] = [];
	for (const entry of Array.isArray(value) ? value : [value]) {
		const result = validateSetting(key, [entry]);
		if (result.ok) kept.push(entry);
		else failed(typeof entry === "string" ? entry : JSON.stringify(entry), result.message);
	}

	// The entries that are left are held to the length of the list as a whole:
	const result = validateSetting(key, kept);
	if (result.ok) settings.push({ name, key, value: result.value });
	else failed(from[0] ?? name, result.message);
}

function parseRules(
	section: unknown,
	current: readonly AutoModerationRule[],
	issues: ConfigurationIssue[],
): ConfigurationRule[] | null {
	if (section === undefined) return null;

	if (!isObject(section)) {
		issues.push({ path: "automod", message: "Expected an object." });
		return null;
	}

	const record = section as Record<string, unknown>;
	for (const field of Object.keys(record)) {
		if (field !== "rules") {
			issues.push({ path: `automod.${field}`, message: `Unknown field "automod.${field}".` });
		}
	}

	const list = record.rules;
	if (!Array.isArray(list)) {
		issues.push({ path: "automod.rules", message: "Expected a list of rules." });
		return null;
	}
	if (list.length > MaximumAutoModerationRules) {
		issues.push({
			path: "automod.rules",
			message: `A guild has at most ${MaximumAutoModerationRules} rules.`,
		});
		return null;
	}

	const rules: ConfigurationRule[] = [];
	const names = new Set<string>();
	for (const [index, entry] of list.entries()) {
		const path = `automod.rules[${index}]`;
		const before = issues.length;
		const rule = parseRule(entry, path, current, issues);
		if (rule === null) continue;

		const lower = rule.name.toLowerCase();
		if (names.has(lower)) {
			issues.push({ path, message: `Two rules are named "${rule.name}".` });
		}
		names.add(lower);

		if (issues.length === before) rules.push(rule);
	}

	return rules;
}

/**
 * A rule of a type the bot no longer has, read as the migration that removed
 * the type rewrote the ones of the database: the bot's `upgradeRemovedRuleType`.
 * A `NoMentionSpam` rule banned by itself: it is a `MentionsCooldown` rule that
 * weighs the mentions, bans at the first infraction and tells it in the
 * channel. What it has of the wrong type is left as it is, for the checks.
 */
function upgradeRemovedRuleType(entry: Record<string, unknown>): Record<string, unknown> {
	if (entry.type !== "NoMentionSpam") return entry;

	const { options = {}, softAction = 0 } = entry;
	return {
		...entry,
		type: "MentionsCooldown",
		options: isObject(options)
			? {
					maximum: (options as Record<string, unknown>).mentionsAllowed ?? 20,
					timePeriod: (options as Record<string, unknown>).timePeriod ?? 8,
					weighted: true,
				}
			: options,
		softAction:
			typeof softAction === "number"
				? softAction | AutoModerationSoftActionBits.Alert
				: softAction,
		hardAction: "Ban",
		hardActionDuration: null,
		thresholdMaximum: 0,
		escalation: [],
	};
}

function parseRule(
	entry: unknown,
	path: string,
	current: readonly AutoModerationRule[],
	issues: ConfigurationIssue[],
): ConfigurationRule | null {
	if (!isObject(entry)) {
		issues.push({ path, message: "Expected a rule." });
		return null;
	}

	const record = upgradeRemovedRuleType(entry as Record<string, unknown>);
	const before = issues.length;
	const known = new Set<string>(ConfigurationRuleFields);
	for (const field of Object.keys(record)) {
		if (!known.has(field)) {
			issues.push({ path: `${path}.${field}`, message: `Unknown field "${path}.${field}".` });
		}
	}

	const { type, name } = record;
	if (!isAutoModerationRuleType(type)) {
		issues.push({
			path: `${path}.type`,
			message: `Expected one of ${AutoModerationRuleTypes.join(", ")}.`,
		});
		return null;
	}

	// A name made of digits could be taken for the ID of another rule:
	const trimmed = typeof name === "string" ? name.trim() : "";
	if (
		trimmed.length === 0 ||
		trimmed.length > MaximumAutoModerationRuleNameLength ||
		/^\d+$/u.test(trimmed)
	) {
		issues.push({
			path: `${path}.name`,
			message: `Expected a name of 1 to ${MaximumAutoModerationRuleNameLength} characters that is not only digits.`,
		});
		return null;
	}

	const report = (errors: readonly string[]) => {
		for (const error of errors) {
			issues.push({ path: `${path}.${error.split(":")[0]}`, message: error });
		}
	};

	// The patch repairs the options it reads (a wrong type takes its default,
	// a number is clamped), which would let a broken file change a rule into
	// something it did not say: the options are checked as they are written.
	if (isObject(record.options)) {
		report(checkRuleOptions(type, record.options as Record<string, unknown>));
	}

	const fields: Record<string, unknown> = { ...record };
	delete fields.type;
	// A file is saved data: a `Timeout` written before it was merged into
	// `Mute` is read as a `Mute`, as the storage reads a saved rule.
	if (fields.hardAction === "Timeout") fields.hardAction = "Mute";
	if (Array.isArray(fields.escalation)) {
		fields.escalation = fields.escalation.map((step: unknown) =>
			isObject(step) && (step as { action?: unknown }).action === "Timeout"
				? { ...step, action: "Mute" }
				: step,
		);
	}

	const lower = trimmed.toLowerCase();
	const existing = current.find(
		(rule) => rule.type === type && rule.name.toLowerCase() === lower,
	);
	// An option the file leaves out takes its default, not the one of the rule of the guild:
	if (isObject(record.options)) {
		fields.options = {
			...getDefaultAutoModerationRuleOptions(type),
			...(record.options as Record<string, unknown>),
		};
	}

	// The file replaces the rule with the defaults and what it gives, so only
	// the options are read against the rule of the guild:
	const parsed = parseAutoModerationRulePatch(type, fields, { options: existing?.options });
	if (parsed.errors) {
		report(parsed.errors);
		return null;
	}
	if (issues.length !== before) return null;

	// What the file leaves out takes the default of the type, as it does when a rule is created:
	return toConfigurationRule({
		...getDefaultAutoModerationRule(type),
		...parsed.data,
		name: trimmed,
		type,
	});
}

/**
 * What is wrong with the options of a rule as a file gives them: an option the
 * type does not have, or a value of another type or out of its limits.
 * Lists are only checked to be lists of text; their entries are normalized.
 */
function checkRuleOptions(type: AutoModerationRuleType, options: Record<string, unknown>) {
	const defaults = getDefaultAutoModerationRuleOptions(type) as Record<string, unknown>;
	const normalized = normalizeAutoModerationRuleOptions(type, options) as Record<string, unknown>;
	const errors: string[] = [];

	for (const [key, value] of Object.entries(options)) {
		const fallback = defaults[key];
		if (fallback === undefined) {
			errors.push(`options.${key}: This option does not exist for a ${type} rule.`);
		} else if (typeof fallback === "boolean") {
			if (typeof value !== "boolean") errors.push(`options.${key}: Expected a boolean.`);
		} else if (typeof fallback === "number") {
			if (typeof value !== "number" || normalized[key] !== value) {
				errors.push(`options.${key}: Expected a whole number within the limits.`);
			}
		} else if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
			errors.push(`options.${key}: Expected a list of text.`);
		}
	}

	return errors;
}

function failure(issues: ConfigurationIssue[]): ParseConfigurationResult {
	return { ok: false, issues };
}
