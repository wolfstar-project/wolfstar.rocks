import { isTransientNetworkError } from "./transient-network-error.ts";

export interface ResilientFetchOptions {
	/** Total attempts including the first try. Defaults to 3. */
	maxAttempts?: number;
	/** Base delay in ms before the first retry; doubles each attempt. Defaults to 50. */
	baseDelayMs?: number;
	/** Underlying fetch implementation. Defaults to globalThis.fetch. */
	fetch?: typeof globalThis.fetch;
	/** Injectable sleep for tests. */
	sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Fetch wrapper for Netlify Blobs that fully buffers the response body and
 * retries transient network failures (including TCP resets mid-body).
 *
 * Buffering is required because `@netlify/blobs` only retries when `fetch()`
 * itself throws — a 200 with a truncated body fails later in `res.json()` /
 * `res.arrayBuffer()` and would otherwise escape its retry loop.
 */
export function createResilientNetlifyBlobsFetch(
	options: ResilientFetchOptions = {},
): typeof globalThis.fetch {
	const maxAttempts = options.maxAttempts ?? 3;
	const baseDelayMs = options.baseDelayMs ?? 50;
	const baseFetch = options.fetch ?? globalThis.fetch.bind(globalThis);
	const sleep = options.sleep ?? defaultSleep;

	return async (input, init) => {
		let lastError: unknown;

		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			try {
				const response = await baseFetch(input, init);
				// Materialize the body so incomplete transfers throw here (retryable)
				// instead of later inside @netlify/blobs after fetchAndRetry returned.
				const body = await response.arrayBuffer();
				return new Response(body, {
					status: response.status,
					statusText: response.statusText,
					headers: response.headers,
				});
			} catch (error) {
				lastError = error;
				const canRetry = attempt < maxAttempts - 1 && isTransientNetworkError(error);
				if (!canRetry) {
					throw error;
				}
				await sleep(baseDelayMs * 2 ** attempt);
			}
		}

		throw lastError;
	};
}
