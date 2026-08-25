/**
 * Delays (ms) applied before each retry after the initial session fetch on the
 * OAuth callback page comes back without a session. Sessions live in better-auth's
 * secondary storage (Cloudflare KV over HTTP in production), which is eventually
 * consistent, so a read racing the callback's own write can miss and needs a
 * short grace period rather than an immediate "session not found".
 */
const DEFAULT_RETRY_DELAYS: readonly number[] = [500, 1500, 3000];

export interface FetchSessionWithRetryOptions {
	/** Fetches the session and updates auth state (e.g. `useUserSession().fetchSession`). */
	fetchSession: () => Promise<unknown>;
	/** Reads whether auth state now holds a signed-in session. */
	hasSession: () => boolean;
	/** Waits between attempts; injectable for tests. */
	wait?: (ms: number) => Promise<void>;
	/** Delays (ms) before each retry; one retry per entry. */
	delays?: readonly number[];
}

/**
 * `setTimeout` promisified with the global timer, not `node:timers/promises`:
 * this module ships in the OAuth callback page's client bundle, and Nitro's
 * client-side polyfill of `timers/promises` resolves immediately without
 * actually waiting, silently turning the retry backoff into a tight loop.
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Yields 0 for the initial attempt, then each retry delay in order. */
function* attemptDelays(delays: readonly number[]): Generator<number> {
	yield 0;
	yield* delays;
}

/**
 * Fetches the session until it appears or the retry budget is exhausted.
 * Returns `true` as soon as a signed-in session is observed.
 *
 * A rejected fetch counts as a miss instead of aborting: transient network
 * errors during callback recovery should consume a retry, not fail the flow.
 */
export async function fetchSessionWithRetry(
	options: FetchSessionWithRetryOptions,
): Promise<boolean> {
	const { fetchSession, hasSession, wait = sleep, delays = DEFAULT_RETRY_DELAYS } = options;

	for (const delay of attemptDelays(delays)) {
		if (delay > 0) {
			await wait(delay);
		}
		try {
			await fetchSession();
		} catch {
			continue;
		}
		if (hasSession()) {
			return true;
		}
	}
	return false;
}
