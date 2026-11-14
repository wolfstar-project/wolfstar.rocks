import type { JoinGuardRequestError, JoinGuardRequestState } from "#shared/utils/join-guard";

/**
 * What became of a request the website wrote for the bot: done, refused with
 * the bot's reason, still not done when the page stopped asking, or not
 * readable at all.
 */
export type JoinGuardRequestOutcome =
	| { state: "done" }
	| { state: "failed"; error: JoinGuardRequestError }
	| { state: "timeout" }
	| { state: "unreachable" };

/**
 * How long the page waits before each look at a request, in milliseconds: a
 * second at first, as the bot answers in about that, then less and less often,
 * about half a minute in all.
 */
export const JOIN_GUARD_POLL_DELAYS: readonly number[] = [
	1000, 1000, 1500, 2000, 3000, 4000, 5000, 5000, 5000,
];

/** Looks in a row that fail before the page gives up on the status route. */
const MAXIMUM_READ_FAILURES = 2;

export interface JoinGuardPolling {
	delays?: readonly number[];
	wait?: (milliseconds: number) => Promise<void>;
}

function sleep(milliseconds: number) {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, milliseconds);
	});
}

/**
 * Asks for a request until the bot has processed it, backing off between the
 * looks, and says how it ended. A look that fails is tried again once.
 */
export async function settleJoinGuardRequest(
	read: () => Promise<JoinGuardRequestState>,
	{ delays = JOIN_GUARD_POLL_DELAYS, wait = sleep }: JoinGuardPolling = {},
): Promise<JoinGuardRequestOutcome> {
	let failures = 0;
	for (const delay of delays) {
		await wait(delay);
		let state: JoinGuardRequestState;
		try {
			state = await read();
		} catch {
			failures += 1;
			if (failures >= MAXIMUM_READ_FAILURES) return { state: "unreachable" };
			continue;
		}
		failures = 0;
		if (state.processed) {
			return state.error ? { error: state.error, state: "failed" } : { state: "done" };
		}
	}
	return { state: "timeout" };
}

/**
 * The code a route put in the error it threw (`data.code`, which ofetch hands
 * on as the `data.data` of its `FetchError`), or `null`.
 */
export function readJoinGuardRouteCode(error: unknown): string | null {
	const data = (error as { data?: { data?: { code?: unknown } } } | null)?.data?.data;
	return typeof data?.code === "string" ? data.code : null;
}

/** The HTTP status of a failed `$fetch`, or `null`. */
export function readJoinGuardRouteStatus(error: unknown): number | null {
	const status = (error as { statusCode?: unknown; status?: unknown } | null)?.statusCode;
	return typeof status === "number" ? status : null;
}
