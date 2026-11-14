/**
 * The warning thresholds of a server: what WolfStar does to a member who
 * reaches a number of active warnings, one row of `GuildWarnThreshold` per
 * number. `/warn-thresholds` sets them in Discord.
 *
 * Ported from the bot's `projects/database/src/settings/warnings/storage.ts`
 * and `/warn-thresholds add`, whose limits it keeps. The bot works in
 * milliseconds; the table, and this dashboard's API, keep whole seconds.
 */

/** The most thresholds a server has (`MaximumWarnThresholds`). */
export const MAXIMUM_WARN_THRESHOLDS = 10;

/** The numbers of warnings a threshold can be set at, as `/warn-thresholds add count:` takes them. */
export const WARN_THRESHOLD_COUNT = { maximum: 50, minimum: 1 } as const;

/**
 * What a threshold does: every hard action but a warning, which would count
 * towards itself (`WarnThresholdActions`), in the bot's order. A `Timeout` is
 * no longer one: it is a `Mute`, which times the member out when the server
 * has `moderationMuteTimeout` and the duration fits (`shared/utils/mute.ts`).
 */
export const WARN_THRESHOLD_ACTIONS = ["Mute", "Kick", "Softban", "Ban", "VoiceKick"] as const;
export type WarnThresholdAction = (typeof WARN_THRESHOLD_ACTIONS)[number];

/** The actions that last: the others are over the moment they are taken. */
const TIMED_WARN_THRESHOLD_ACTIONS = [
	"Mute",
	"Ban",
] as const satisfies readonly WarnThresholdAction[];

/** The longest period, and the longest action, in seconds: a year, as the command takes them. */
export const MAXIMUM_WARN_THRESHOLD_SECONDS = 365 * 24 * 60 * 60;

/** What happens to a member who reaches a number of active warnings. */
export interface WarnThreshold {
	/** The number of active warnings that triggers it. */
	count: number;
	/** The seconds the warnings are counted in; `0` counts every active warning. */
	period: number;
	action: WarnThresholdAction;
	/** The seconds the action lasts; `null` for a permanent one, or one that does not last. */
	duration: number | null;
}

/** What a write sets: the number of warnings is the one of the path. */
export type WarnThresholdData = Omit<WarnThreshold, "count">;

export function isWarnThresholdAction(value: unknown): value is WarnThresholdAction {
	return (WARN_THRESHOLD_ACTIONS as readonly unknown[]).includes(value);
}

/**
 * Reads the action of a stored threshold: a `Timeout` saved before it was
 * merged into `Mute` is a `Mute`, and an action this version does not know is
 * `null`.
 */
export function readStoredWarnThresholdAction(value: unknown): WarnThresholdAction | null {
	const action = value === "Timeout" ? "Mute" : value;
	return isWarnThresholdAction(action) ? action : null;
}

export function isTimedWarnThresholdAction(action: WarnThresholdAction): boolean {
	return (TIMED_WARN_THRESHOLD_ACTIONS as readonly string[]).includes(action);
}

/**
 * The thresholds a server starts with, while it has none of its own and
 * `moderation.default-warn-thresholds` is on (`getDefaultWarnThresholds`): a
 * mute of half an hour at the third warning, a kick at the fifth and a ban at
 * the seventh. Half an hour fits a Discord timeout, so the mute is one when the
 * server has `moderationMuteTimeout` on or no muted role.
 */
export function getDefaultWarnThresholds(): WarnThreshold[] {
	return [
		{ action: "Mute", count: 3, duration: 30 * 60, period: 0 },
		{ action: "Kick", count: 5, duration: null, period: 0 },
		{ action: "Ban", count: 7, duration: null, period: 0 },
	];
}

/** Reads the number of warnings of a path, `null` when it is not one a threshold can be set at. */
export function parseWarnThresholdCount(value: unknown): number | null {
	const count = typeof value === "string" && /^\d+$/u.test(value) ? Number(value) : Number.NaN;
	return Number.isInteger(count) &&
		count >= WARN_THRESHOLD_COUNT.minimum &&
		count <= WARN_THRESHOLD_COUNT.maximum
		? count
		: null;
}

/** Why a body was refused, one sentence per field, for the API to answer with. */
export type WarnThresholdParseResult =
	| { data: WarnThresholdData; errors?: never }
	| { data?: never; errors: string[] };

function wholeNumberIn(value: unknown, minimum: number, maximum: number): value is number {
	return Number.isInteger(value) && (value as number) >= minimum && (value as number) <= maximum;
}

/**
 * Reads the body of a write: `action`, `duration` (seconds or `null`) and
 * `period` (seconds, `0` for every active warning). An action that does not
 * last drops the duration it was sent with. A `Timeout` is refused as a new
 * value: it was merged into `Mute`.
 */
export function parseWarnThresholdData(body: unknown): WarnThresholdParseResult {
	const { action, duration, period } =
		typeof body === "object" && body !== null && !Array.isArray(body)
			? (body as Record<string, unknown>)
			: {};
	const errors: string[] = [];

	if (!wholeNumberIn(period, 0, MAXIMUM_WARN_THRESHOLD_SECONDS)) {
		errors.push(
			`period: Expected a whole number of seconds from 0 to ${MAXIMUM_WARN_THRESHOLD_SECONDS}.`,
		);
	}
	if (!isWarnThresholdAction(action)) {
		errors.push(`action: Expected one of ${WARN_THRESHOLD_ACTIONS.join(", ")}.`);
		return { errors };
	}

	const maximum = MAXIMUM_WARN_THRESHOLD_SECONDS;
	if (duration !== null && duration !== undefined && !wholeNumberIn(duration, 1, maximum)) {
		errors.push(`duration: Expected a whole number of seconds from 1 to ${maximum}, or null.`);
	}

	if (errors.length > 0) return { errors };
	return {
		data: {
			action,
			duration: isTimedWarnThresholdAction(action)
				? ((duration as number | null) ?? null)
				: null,
			period: period as number,
		},
	};
}
