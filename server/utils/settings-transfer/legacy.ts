import type { TransferableSettingName } from "#server/utils/settings-transfer/format";
import type { ConfigurationNotice } from "#shared/utils/settings-transfer";
import {
	convertLegacyAutomodRules,
	LegacyValueError,
	type LegacyRow,
} from "#server/utils/settings-transfer/legacy-automod";

// Ported from `projects/bot/src/lib/database/settings/transfer/legacy.ts` in the
// bot (wolfstar-project/wolfstar, V7): a file of version 1 the bot before V7
// exported imports here as it imports there.

/**
 * The settings of the bot before V7 that V7 has under another name, by their
 * old name. `events.ban-add` and `events.ban-remove` are one setting in V7,
 * on when either was, as the migration of the database does.
 */
const RenamedSettings: Readonly<Record<string, TransferableSettingName>> = {
	"disabled-commands": "commands.disabled",
	"events.ban-add": "moderation.track-bans",
	"events.ban-remove": "moderation.track-bans",
	"events.timeout": "moderation.track-timeouts",
	"events.twemoji-reactions": "logs.reaction-emoji-include-twemoji",
	"messages.moderation-dm": "moderation.direct-message",
	"messages.moderation-reason-display": "moderation.display-reason",
	"messages.moderation-message-display": "moderation.display-message",
	"messages.moderator-name-display": "moderation.display-moderator",
};

/**
 * The settings of the bot before V7 that V7 has nothing for, with the value
 * that bot gave them: one that still has it was never changed, so there is
 * nothing to tell about it.
 */
const SettingsWithoutEquivalent: Readonly<Record<string, unknown>> = {
	"prefix": "w!",
	"disable-natural-prefix": false,
	"events.include-bots": false,
	"events.unknown-messages": false,
	"messages.moderation-auto-delete": false,
	"messages.auto-delete.ignored-all": false,
	"messages.auto-delete.ignored-commands": [],
};

/** The reaction filter of the bot before V7, which V7 has no rule for, with the value that bot gave each of its settings. */
const ReactionFilterDefaults: Readonly<Record<string, unknown>> = {
	"selfmod.reactions.enabled": false,
	"selfmod.reactions.maximum": 10,
	"selfmod.reactions.soft-action": 0,
	"selfmod.reactions.hard-action": 0,
	"selfmod.reactions.hard-action-duration": null,
	"selfmod.reactions.threshold-maximum": 10,
	"selfmod.reactions.threshold-duration": 60_000,
};

/** The filters of the bot before V7 that are rules in V7, by the prefix of their settings, with the name the rule takes. */
const ConvertedFilters: Readonly<Record<string, string>> = {
	"selfmod.attachments.": "Attachments",
	"selfmod.capitals.": "Capitals",
	"selfmod.links.": "Links",
	"selfmod.invites.": "Invites",
	"selfmod.newlines.": "New lines",
	"selfmod.filter.": "Words",
	"selfmod.messages.": "Identical messages",
	"no-mention-spam.": "Mention spam",
};

/**
 * Every setting of the filters of {@linkcode ConvertedFilters}, as the bot
 * before V7 wrote them: a name is checked whole, so a mistyped one refuses the
 * file instead of being left out with nothing said.
 */
const ConvertedFilterSettings: ReadonlySet<string> = new Set([
	"selfmod.attachments.enabled",
	"selfmod.attachments.soft-action",
	"selfmod.attachments.hard-action",
	"selfmod.attachments.hard-action-duration",
	"selfmod.attachments.threshold-maximum",
	"selfmod.attachments.threshold-duration",
	"selfmod.capitals.enabled",
	"selfmod.capitals.minimum",
	"selfmod.capitals.maximum",
	"selfmod.capitals.soft-action",
	"selfmod.capitals.hard-action",
	"selfmod.capitals.hard-action-duration",
	"selfmod.capitals.threshold-maximum",
	"selfmod.capitals.threshold-duration",
	"selfmod.links.enabled",
	"selfmod.links.allowed",
	"selfmod.links.soft-action",
	"selfmod.links.hard-action",
	"selfmod.links.hard-action-duration",
	"selfmod.links.threshold-maximum",
	"selfmod.links.threshold-duration",
	"selfmod.invites.enabled",
	"selfmod.invites.ignored-codes",
	"selfmod.invites.ignored-guilds",
	"selfmod.invites.soft-action",
	"selfmod.invites.hard-action",
	"selfmod.invites.hard-action-duration",
	"selfmod.invites.threshold-maximum",
	"selfmod.invites.threshold-duration",
	"selfmod.newlines.enabled",
	"selfmod.newlines.maximum",
	"selfmod.newlines.soft-action",
	"selfmod.newlines.hard-action",
	"selfmod.newlines.hard-action-duration",
	"selfmod.newlines.threshold-maximum",
	"selfmod.newlines.threshold-duration",
	"selfmod.filter.enabled",
	"selfmod.filter.raw",
	"selfmod.filter.soft-action",
	"selfmod.filter.hard-action",
	"selfmod.filter.hard-action-duration",
	"selfmod.filter.threshold-maximum",
	"selfmod.filter.threshold-duration",
	"selfmod.messages.enabled",
	"selfmod.messages.maximum",
	"selfmod.messages.queue-size",
	"selfmod.messages.soft-action",
	"selfmod.messages.hard-action",
	"selfmod.messages.hard-action-duration",
	"selfmod.messages.threshold-maximum",
	"selfmod.messages.threshold-duration",
	"no-mention-spam.enabled",
	"no-mention-spam.alerts",
	"no-mention-spam.mentions-allowed",
	"no-mention-spam.time-period",
]);

/** Whether a setting is one of the bot before V7 that an import converts or tells about, instead of refusing it. */
export function isLegacySetting(name: string): boolean {
	return (
		Object.hasOwn(RenamedSettings, name) ||
		Object.hasOwn(SettingsWithoutEquivalent, name) ||
		Object.hasOwn(ReactionFilterDefaults, name) ||
		ConvertedFilterSettings.has(name)
	);
}

/** A setting of the bot before V7, under the name it has in V7. */
interface LegacySettingConversion {
	name: TransferableSettingName;
	value: unknown;
	/** The names it had, which what is wrong with it is told under. */
	from: string[];
}

/** What the settings of the bot before V7 become. */
export interface LegacyConversion {
	settings: LegacySettingConversion[];
	/** The rules the filters become, as a rule of a file holds them, to be validated as one. */
	rules: Record<string, unknown>[];
	notices: ConfigurationNotice[];
}

/**
 * Converts the settings of a file of the bot before V7 to the ones of V7.
 *
 * - A setting that was renamed takes its new name, and is validated as a
 *   setting of V7 afterwards.
 * - The filters (`selfmod.*`, `no-mention-spam.*`) become rules, as
 *   `convertLegacyAutomodRules` makes them when the bot migrates its database:
 *   one for each filter that was turned on or changed. What that conversion
 *   adjusts to the limits of V7 is told.
 * - A setting V7 has nothing for is told when it does not have the value of
 *   the bot before V7, so a change the admin made is not lost without them
 *   knowing.
 *
 * @param section - The settings of the file that are of the bot before V7, by their name.
 */
export function convertLegacySettings(
	section: Readonly<Record<string, unknown>>,
): LegacyConversion {
	const conversion: LegacyConversion = { settings: [], rules: [], notices: [] };
	const row: LegacyRow = {};

	for (const [name, value] of Object.entries(section)) {
		if (Object.hasOwn(RenamedSettings, name)) continue;

		if (Object.hasOwn(SettingsWithoutEquivalent, name)) {
			if (!isSameValue(value, SettingsWithoutEquivalent[name])) {
				conversion.notices.push({ kind: "noEquivalent", path: `settings.${name}`, name });
			}
		} else if (Object.hasOwn(ReactionFilterDefaults, name)) {
			// The filter is told once, whatever of it was changed:
			const told = conversion.notices.some((notice) => notice.kind === "reactionFilter");
			if (!told && !isSameValue(value, ReactionFilterDefaults[name])) {
				conversion.notices.push({ kind: "reactionFilter", path: `settings.${name}`, name });
			}
		} else {
			row[name] = value;
		}
	}

	convertRenamedSettings(section, conversion);
	convertFilters(row, conversion);
	return conversion;
}

function convertRenamedSettings(
	section: Readonly<Record<string, unknown>>,
	conversion: LegacyConversion,
) {
	const byName = new Map<TransferableSettingName, LegacySettingConversion>();
	for (const [from, name] of Object.entries(RenamedSettings)) {
		if (!Object.hasOwn(section, from)) continue;

		const value = section[from];
		const converted = byName.get(name);
		if (converted === undefined) {
			byName.set(name, { name, value, from: [from] });
			continue;
		}

		// The two settings of the bans are one in V7, on when either was:
		converted.from.push(from);
		converted.value =
			typeof converted.value === "boolean" && typeof value === "boolean"
				? converted.value || value
				: value;
	}

	conversion.settings.push(...byName.values());
}

/**
 * What the converter reads of the mention spam filter when the file has
 * nothing of it: the values the bot before V7 gave it, which the converter
 * takes for a filter nobody changed. Without them it makes a rule that is off
 * out of nothing.
 */
const MentionSpamDefaults: LegacyRow = {
	"no-mention-spam.mentions-allowed": 20,
	"no-mention-spam.time-period": 8,
};

/**
 * Converts the filters the file has, each one by itself: one that cannot be
 * converted does not keep the others from being imported, and a filter the
 * file does not have is not converted at all, so a file that only has a few
 * settings leaves the rules of the server alone.
 */
function convertFilters(row: LegacyRow, conversion: LegacyConversion) {
	for (const [prefix, rule] of Object.entries(ConvertedFilters)) {
		const filter = Object.fromEntries(
			Object.entries(row).filter(([name]) => name.startsWith(prefix)),
		);
		if (Object.keys(filter).length > 0) convertFilter(prefix, rule, filter, conversion);
	}
}

function convertFilter(
	prefix: string,
	rule: string,
	filter: LegacyRow,
	conversion: LegacyConversion,
) {
	let converted: ReturnType<typeof convertLegacyAutomodRules>;
	try {
		converted = convertLegacyAutomodRules({ ...MentionSpamDefaults, ...filter });
	} catch (error) {
		// A value the bot before V7 could not hold, which this file was edited to have:
		if (!(error instanceof LegacyValueError)) throw error;

		const from =
			Object.keys(filter).find((name) => error.message.includes(`"${name}"`)) ??
			prefix.slice(0, -1);
		conversion.notices.push({
			kind: "ruleFailed",
			path: `settings.${from}`,
			rule,
			reason: error.message,
		});
		return;
	}

	conversion.rules.push(...converted.rules.map((made) => ({ ...made })));

	for (const warning of converted.warnings) {
		// The rule is the last name in quotes: a warning about an option names the option before it:
		const name = [...warning.matchAll(/"([^"]+)"/gu)].at(-1)?.[1] ?? rule;
		conversion.notices.push({
			kind: "ruleAdjusted",
			path: `settings.${getLegacyFilterPrefix(name).slice(0, -1)}`,
			rule: name,
			detail: warning,
		});
	}
}

/**
 * The prefix of the settings of the bot before V7 a filter is made of, so a
 * rule that cannot be converted tells what to look at.
 *
 * @param rule - The name of the rule the filter becomes.
 */
export function getLegacyFilterPrefix(rule: string): string {
	return Object.entries(ConvertedFilters).find(([, name]) => name === rule)?.[0] ?? "";
}

function isSameValue(value: unknown, expected: unknown) {
	// A punishment of no duration was saved as `0` as well as `null`:
	if (value === 0 && expected === null) return true;
	return JSON.stringify(value ?? null) === JSON.stringify(expected);
}
