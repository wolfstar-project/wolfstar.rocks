import type { GuildData } from "#server/database";

/**
 * The settings whose value is one word of a fixed set, with that set in the
 * order the dashboard offers it. The words are the bot's enums
 * (`HoneypotAction` and `MessageUpdateStyle` in its contract) and, for the
 * thread of an appeal, the words its `AppealThreadModes` lists in a text
 * column, so the server checks a write against the very list the form shows.
 */
export const SETTING_CHOICES = {
	// The mildest first.
	honeypotAction: ["Kick", "Softban", "Ban"],
	logsMessageUpdateStyle: ["Difference", "Separate"],
	appealsThread: ["none", "public", "private"],
} as const satisfies { [Key in keyof GuildData]?: readonly GuildData[Key][] };

/** A setting that holds one word of {@link SETTING_CHOICES}. */
export type ChoiceSettingKey = keyof typeof SETTING_CHOICES;

/**
 * The settings that hold a whole number, with the range the bot accepts for
 * each. `moderationConfirmRecentMinutes` is the bot's `moderation.confirm-recent`,
 * in minutes, where 0 never asks. `appealsCooldownDays` is its
 * `appeals.cooldown-days`, where 0 is no wait, and `appealsMaxActive` its
 * `appeals.max-active`.
 */
export const SETTING_NUMBER_RANGES = {
	moderationConfirmRecentMinutes: { maximum: 60, minimum: 0 },
	appealsCooldownDays: { maximum: 365, minimum: 0 },
	appealsMaxActive: { maximum: 10, minimum: 1 },
	// In seconds, which the page edits in hours: 0 never kicks, otherwise one
	// hour to a week (the bot's `JoinGuardCheckpointTimeoutLimits`).
	joinGuardCheckpointTimeout: { maximum: 604_800, minimum: 0 },
	joinGuardMinimumTrust: { maximum: 3, minimum: 1 },
} as const satisfies {
	[Key in keyof GuildData]?: GuildData[Key] extends number
		? { maximum: number; minimum: number }
		: never;
};

/** A setting that holds a whole number of {@link SETTING_NUMBER_RANGES}. */
export type NumberSettingKey = keyof typeof SETTING_NUMBER_RANGES;

/**
 * `value` as the whole number of the range of `key` it is closest to. A value
 * that is not a number reads as the smallest of the range.
 */
export function clampSettingNumber(
	key: NumberSettingKey,
	value: number | null | undefined,
): number {
	const { maximum, minimum } = SETTING_NUMBER_RANGES[key];
	if (typeof value !== "number" || !Number.isFinite(value)) {
		return minimum;
	}
	return Math.min(maximum, Math.max(minimum, Math.round(value)));
}

/**
 * The list settings that hold fewer entries than the
 * `MAXIMUM_SETTING_LIST_LENGTH` every list has, with how many. The bot's
 * `moderation.lockdown-channels` takes 25: `/lockdown` changes them one by one.
 */
export const SETTING_LIST_LIMITS = {
	moderationLockdownChannels: 25,
} as const satisfies {
	[Key in keyof GuildData]?: GuildData[Key] extends string[] ? number : never;
};

/**
 * The settings that hold a text the server writes, or nothing, with the most
 * characters the bot takes for each: the custom responses of the moderation
 * commands (its `MaximumModerationResponseLength`).
 */
export const SETTING_TEXT_LIMITS = {
	messagesResponseBan: 200,
	messagesResponseUnban: 200,
	messagesResponseSoftban: 200,
	messagesResponseKick: 200,
	messagesResponseMute: 200,
	messagesResponseUnmute: 200,
	// What the join guard's direct message says; empty, the bot writes its own.
	joinGuardDirectMessageContent: 500,
} as const satisfies {
	[Key in keyof GuildData]?: GuildData[Key] extends string | null ? number : never;
};

/** A setting that holds a text of {@link SETTING_TEXT_LIMITS}. */
export type TextSettingKey = keyof typeof SETTING_TEXT_LIMITS;

/**
 * What a custom response of a moderation command can name, written between
 * curly brackets: the bot replaces them whatever their case.
 */
export const MODERATION_RESPONSE_PLACEHOLDERS = [
	"user",
	"reason",
	"case",
	"moderator",
	"duration",
] as const;
