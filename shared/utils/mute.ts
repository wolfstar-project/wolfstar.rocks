/**
 * How a mute is applied: with a Discord timeout or with the muted role.
 *
 * Ported from the bot's `projects/bot/src/lib/moderation/actions/mute.ts`
 * (`fitsTimeout`, `isMuteTimeout`), so the dashboard says what the bot does.
 */

/** The durations Discord takes for a timeout, in milliseconds: 5 seconds to 28 days. */
export const MUTE_TIMEOUT_DURATION = {
	maximum: 28 * 24 * 60 * 60 * 1000,
	minimum: 5000,
} as const;

/** The settings of a guild that decide how a mute is applied. */
export interface MuteSettings {
	/** `moderation.mute-timeout`: a mute is a timeout whenever Discord takes its duration. */
	moderationMuteTimeout: boolean;
	/** The muted role of the guild, `null` when it has none. */
	rolesMuted: string | null;
}

/**
 * Whether Discord takes a timeout of this duration.
 *
 * @param duration - Milliseconds; `null` or `0` for a permanent mute.
 */
export function fitsTimeout(duration: number | null | undefined): duration is number {
	return (
		typeof duration === "number" &&
		duration >= MUTE_TIMEOUT_DURATION.minimum &&
		duration <= MUTE_TIMEOUT_DURATION.maximum
	);
}

/**
 * Whether a mute is a Discord timeout instead of the muted role. It is one
 * when Discord takes its duration and the guild either has
 * `moderationMuteTimeout` on or has no muted role, which the mute would need.
 * A permanent mute, or one longer than 28 days, is always the role.
 *
 * @param duration - Milliseconds; `null` or `0` for a permanent mute.
 */
export function isMuteTimeout(
	settings: MuteSettings,
	duration: number | null | undefined,
): boolean {
	return (
		fitsTimeout(duration) && (settings.moderationMuteTimeout || settings.rolesMuted === null)
	);
}
