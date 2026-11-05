import {
	AutoModerationRuleLimits,
	AutoModerationSoftActionBits,
	getDefaultAutoModerationRuleOptions,
	normalizeAutoModerationRuleOptions,
	type AutoModerationRuleType,
} from "#shared/utils/automod-rules";

// Ported from `projects/database/src/legacy/automod.ts` and `legacy/types.ts` in
// the bot (wolfstar-project/wolfstar, V7), which this app does not depend on:
// keep the two in step, so a filter of the bot before V7 becomes the same rule
// whether the bot migrates it or an import reads it. What only the migration
// of a database has (the guild, `selfmod.ignored-channels`) is left out: a file
// does not carry it.

/** The settings of the bot before V7, by their name (`selfmod.links.enabled`). */
export type LegacyRow = Record<string, unknown>;

/** Thrown when a value of the bot before V7 cannot be converted. */
export class LegacyValueError extends Error {
	public override readonly name = "LegacyValueError";

	public constructor(column: string, value: unknown) {
		super(`The column "${column}" holds a value that is not valid: ${JSON.stringify(value)}.`);
	}
}

/** A rule a filter becomes, with the fields a rule of a file has. */
export interface LegacyAutomodRule {
	name: string;
	type: AutoModerationRuleType;
	enabled: boolean;
	softAction: number;
	hardAction: string;
	hardActionDuration: number | null;
	thresholdMaximum: number;
	thresholdDuration: number;
	options: Record<string, unknown>;
}

const Snowflake = /^\d{1,20}$/u;

function readSnowflakes(row: LegacyRow, column: string): string[] {
	const value = row[column];
	if (value === null || value === undefined) return [];
	if (
		!Array.isArray(value) ||
		!value.every((entry) => typeof entry === "string" && Snowflake.test(entry))
	) {
		throw new LegacyValueError(column, value);
	}
	return value as string[];
}

function readTexts(row: LegacyRow, column: string): string[] {
	const value = row[column];
	return Array.isArray(value)
		? value.filter((entry): entry is string => typeof entry === "string")
		: [];
}

/** The hard actions of the bot before V7, by the number its `selfmod.*.hard-action` settings hold. */
const HardActions = ["None", "Warning", "Kick", "Mute", "Softban", "Ban", "Timeout"];

const DefaultThreshold = { maximum: 10, duration: 60_000 };

interface LegacyRuleSource {
	/** The name of its group of settings, `selfmod.<key>.*`. */
	key: string;
	name: string;
	type: AutoModerationRuleType;
	options: (row: LegacyRow, key: string) => Record<string, unknown>;
}

const LegacyRules: LegacyRuleSource[] = [
	{ key: "attachments", name: "Attachments", type: "Attachments", options: () => ({}) },
	{
		key: "capitals",
		name: "Capitals",
		type: "Capitals",
		options: (row, key) => ({
			minimum: row[`selfmod.${key}.minimum`],
			maximum: row[`selfmod.${key}.maximum`],
		}),
	},
	{
		key: "links",
		name: "Links",
		type: "Links",
		options: (row, key) => ({ allowed: readTexts(row, `selfmod.${key}.allowed`) }),
	},
	{
		key: "invites",
		name: "Invites",
		type: "Invites",
		options: (row, key) => ({
			allowedCodes: readTexts(row, `selfmod.${key}.ignored-codes`),
			allowedGuilds: readSnowflakes(row, `selfmod.${key}.ignored-guilds`),
		}),
	},
	{
		key: "newlines",
		name: "New lines",
		type: "Newlines",
		options: (row, key) => ({ maximum: row[`selfmod.${key}.maximum`] }),
	},
	{
		key: "filter",
		name: "Words",
		type: "Words",
		options: (row, key) => ({ words: readTexts(row, `selfmod.${key}.raw`) }),
	},
	{
		key: "messages",
		name: "Identical messages",
		type: "MessageDuplicates",
		options: (row, key) => ({
			maximum: row[`selfmod.${key}.maximum`],
			queueSize: row[`selfmod.${key}.queue-size`],
		}),
	},
];

function clamp(value: number, { minimum, maximum }: { minimum: number; maximum: number }) {
	return Math.min(maximum, Math.max(minimum, value));
}

/** Tells the numbers of the options the limits of V7 changed, which are a stricter or a looser rule than the server had. */
function warnChangedOptions(
	name: string,
	given: Record<string, unknown>,
	options: object,
	warnings: string[],
) {
	for (const [key, value] of Object.entries(options)) {
		if (typeof value !== "number" || given[key] === value) continue;
		warnings.push(
			`The option "${key}" of the rule "${name}" was changed from ${String(given[key])} to ${value}.`,
		);
	}
}

function convertRule(
	row: LegacyRow,
	source: LegacyRuleSource,
	warnings: string[],
): LegacyAutomodRule | null {
	const { key, name, type } = source;
	const prefix = `selfmod.${key}`;

	const enabled = row[`${prefix}.enabled`] === true;
	const softAction = Number(row[`${prefix}.soft-action`] ?? 0);
	const hardAction = Number(row[`${prefix}.hard-action`] ?? 0);
	const duration = Number(row[`${prefix}.hard-action-duration`] ?? 0);
	const thresholdMaximum = Number(row[`${prefix}.threshold-maximum`] ?? DefaultThreshold.maximum);
	const thresholdDuration = Number(
		row[`${prefix}.threshold-duration`] ?? DefaultThreshold.duration,
	);
	// The exempt roles and channels name something of the server, so a rule of a file
	// has none; they are read for what they tell of a filter that was changed:
	const ignoredRoles = readSnowflakes(row, `${prefix}.ignored-roles`);
	const ignoredChannels = readSnowflakes(row, `${prefix}.ignored-channels`);
	const given = source.options(row, key);
	const options = normalizeAutoModerationRuleOptions(type, given);

	const customised =
		enabled ||
		softAction !== 0 ||
		hardAction !== 0 ||
		duration !== 0 ||
		thresholdMaximum !== DefaultThreshold.maximum ||
		thresholdDuration !== DefaultThreshold.duration ||
		ignoredRoles.length > 0 ||
		ignoredChannels.length > 0 ||
		JSON.stringify(options) !== JSON.stringify(getDefaultAutoModerationRuleOptions(type));
	if (!customised) return null;

	const { maximum } = AutoModerationRuleLimits.hardActionDuration;
	if (duration > maximum) {
		warnings.push(`The punishment of the rule "${name}" was cut to ${maximum} milliseconds.`);
	}
	warnChangedOptions(name, given, options, warnings);

	const threshold = clamp(thresholdMaximum, AutoModerationRuleLimits.thresholdMaximum);
	if (threshold !== thresholdMaximum) {
		warnings.push(
			`The threshold of the rule "${name}" was changed from ${thresholdMaximum} to ${threshold}.`,
		);
	}

	return {
		name,
		type,
		enabled,
		softAction,
		hardAction: HardActions[hardAction] ?? "None",
		hardActionDuration: duration === 0 ? null : Math.min(duration, maximum),
		thresholdMaximum: threshold,
		thresholdDuration: clamp(thresholdDuration, AutoModerationRuleLimits.thresholdDuration),
		options,
	};
}

/** The mention spam filter, as the bot's `20261029T1302_merge_mention_spam_rules` rewrote the rules that came from it. */
function convertMentionSpam(row: LegacyRow, warnings: string[]): LegacyAutomodRule | null {
	const enabled = row["no-mention-spam.enabled"] === true;
	const alerts = row["no-mention-spam.alerts"] === true;
	const options = {
		maximum: row["no-mention-spam.mentions-allowed"],
		timePeriod: row["no-mention-spam.time-period"],
		weighted: true,
	};
	if (!enabled && !alerts && options.maximum === 20 && options.timePeriod === 8) return null;

	const normalized = normalizeAutoModerationRuleOptions("MentionsCooldown", options);
	warnChangedOptions("Mention spam", options, normalized, warnings);

	return {
		name: "Mention spam",
		type: "MentionsCooldown",
		enabled,
		softAction: AutoModerationSoftActionBits.Alert,
		hardAction: "Ban",
		hardActionDuration: null,
		thresholdMaximum: 0,
		thresholdDuration: DefaultThreshold.duration,
		options: normalized,
	};
}

/**
 * Converts the filters of the bot before V7 into rules: one for each filter
 * that is enabled or was changed.
 *
 * @param row - The settings of the bot before V7, by their name.
 * @throws {@linkcode LegacyValueError} When a value cannot be converted.
 */
export function convertLegacyAutomodRules(row: LegacyRow): {
	rules: LegacyAutomodRule[];
	warnings: string[];
} {
	const warnings: string[] = [];
	const candidates = [
		...LegacyRules.map((source) => convertRule(row, source, warnings)),
		convertMentionSpam(row, warnings),
	];

	return { rules: candidates.filter((rule) => rule !== null), warnings };
}
