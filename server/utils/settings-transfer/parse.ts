import { parseSettingsChanges } from "#server/database/settings/validation";
import { parseAutoModerationRulePatch } from "#server/utils/automod/validation";
import {
	findTransferableSetting,
	RemovedSettings,
	toConfigurationRule,
	ConfigurationRuleFields,
	type ConfigurationRule,
	type TransferableSettingKey,
} from "#server/utils/settings-transfer/format";
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
} from "#shared/utils/automod-rules";
import { ConfigurationFileVersion, type ConfigurationIssue } from "#shared/utils/settings-transfer";
import { isObject } from "@sapphire/utilities";

/** What a file holds once every value of it was validated. */
export interface ParsedConfiguration {
	/** The settings of the file this dashboard manages, by their name, validated. */
	settings: { name: string; key: TransferableSettingKey; value: unknown }[];
	/** The settings of the file this dashboard does not manage, by their name. */
	unsupported: string[];
	/** The rules of the file, `null` when it has no `automod` section: the rules of the guild are left alone. */
	rules: ConfigurationRule[] | null;
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
 * left out, and reported, when this dashboard does not manage it.
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
	if (version !== ConfigurationFileVersion) {
		return failure([
			{
				path: "version",
				message: `Version ${version} is not supported: expected ${ConfigurationFileVersion}.`,
			},
		]);
	}

	const issues: ConfigurationIssue[] = [];
	for (const field of Object.keys(record)) {
		if (!FileFields.has(field))
			issues.push({ path: field, message: `Unknown field "${field}".` });
	}

	const { settings, unsupported } = parseSettings(record.settings, issues);
	const parsedRules = parseRules(record.automod, rules, issues);
	return issues.length === 0
		? { ok: true, value: { settings, unsupported, rules: parsedRules } }
		: failure(issues);
}

function parseSettings(section: unknown, issues: ConfigurationIssue[]) {
	const settings: ParsedConfiguration["settings"] = [];
	const unsupported: string[] = [];
	if (section === undefined) return { settings, unsupported };

	if (!isObject(section)) {
		issues.push({ path: "settings", message: "Expected an object." });
		return { settings, unsupported };
	}

	for (const [name, value] of Object.entries(section as Record<string, unknown>)) {
		if (RemovedSettings.has(name)) continue;

		const key = findTransferableSetting(name);
		if (key === null) {
			unsupported.push(name);
			continue;
		}

		const path = `settings.${name}`;
		// `null` resets a setting to its default in a settings request; a file says what a setting is:
		if (value === null) {
			issues.push({ path, message: "Expected a value." });
			continue;
		}

		const parsed = parseSettingsChanges([[key, value]]);
		if (parsed.errors) {
			for (const error of parsed.errors) {
				issues.push({ path, message: error.replace(/^[^:]+: /u, "") });
			}
			continue;
		}
		settings.push({ name, key, value: (parsed.data as Record<string, unknown>)[key] });
	}

	return { settings, unsupported };
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

	const record = entry as Record<string, unknown>;
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

	const parsed = parseAutoModerationRulePatch(type, fields, existing?.options);
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
