import type { GuildData } from "#server/database";

/**
 * The settings whose value is one word of a fixed set, with that set in the
 * order the dashboard offers it. The words are the bot's enums
 * (`HoneypotAction` and `MessageUpdateStyle` in its contract), so the server
 * checks a write against the very list the form shows.
 */
export const SETTING_CHOICES = {
	// The mildest first.
	honeypotAction: ["Kick", "Softban", "Ban"],
	logsMessageUpdateStyle: ["Difference", "Separate"],
} as const satisfies { [Key in keyof GuildData]?: readonly GuildData[Key][] };

/** A setting that holds one word of {@link SETTING_CHOICES}. */
export type ChoiceSettingKey = keyof typeof SETTING_CHOICES;

/**
 * The settings that hold a whole number, with the range the bot accepts for
 * each. `moderationConfirmRecentMinutes` is the bot's `moderation.confirm-recent`,
 * in minutes, where 0 never asks.
 */
export const SETTING_NUMBER_RANGES = {
	moderationConfirmRecentMinutes: { maximum: 60, minimum: 0 },
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

/** How many questions of `appealsQuestions` the bot asks: the first five (its `MaximumAppealQuestions`). */
export const MAXIMUM_ASKED_APPEAL_QUESTIONS = 5;
