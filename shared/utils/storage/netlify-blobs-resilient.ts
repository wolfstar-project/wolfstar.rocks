import { defineDriver } from "unstorage";
import netlifyBlobsDriver from "unstorage/drivers/netlify-blobs";
import { createResilientNetlifyBlobsFetch } from "./resilient-fetch.ts";
import { isTransientBlobsTokenError, isTransientNetworkError } from "./transient-network-error.ts";

type ResilientNetlifyBlobsOptions = {
	/** Present when Nitro JSON-serializes the mount config into the driver factory. */
	driver?: string;
	/** Blob store name (required for site-scoped stores). */
	name?: string;
};

function isFailOpenError(error: unknown): boolean {
	return isTransientNetworkError(error) || isTransientBlobsTokenError(error);
}

// Mirrors resilient-fetch's 3-attempt/short-backoff shape so a token-expiry
// blip has a couple of chances to land before the mutation is dropped.
const RETRY_DELAYS_MS = [50, 100];

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries a cache mutation (`setItem`/`removeItem`) through fail-open-eligible
 * errors before giving up. A dropped `removeItem` leaves stale data behind
 * until the cache entry's TTL expires, and a dropped `setItem` leaves a stale
 * value in place — retrying first makes that far less likely without turning
 * a transient Blobs error into a failed request.
 */
async function withFailOpenRetry(operation: () => Promise<void>): Promise<void> {
	for (let attempt = 0; ; attempt++) {
		try {
			await operation();
			return;
		} catch (error) {
			if (!isFailOpenError(error)) {
				throw error;
			}
			const delay = RETRY_DELAYS_MS[attempt];
			if (delay === undefined) {
				return;
			}
			await sleep(delay);
		}
	}
}

/**
 * Netlify Blobs unstorage driver with:
 * 1. Body-buffering fetch + short retries for transient TCP resets (socket hang up)
 * 2. Fail-open `getKeys`/`getItem`/`setItem`/`removeItem` so transient Blobs failures
 *    (dropped connections, the short-lived edge token expiring mid-request) never crash
 *    a request or cold start, or get reported as unhandled by Sentry's storage
 *    instrumentation — see WOLFSTAR-ROCKS-4Q and WOLFSTAR-ROCKS-4M
 */
export default defineDriver((options: ResilientNetlifyBlobsOptions = {}) => {
	// Omit Nitro's serialized `driver` path key before forwarding store options.
	const name = options.name ?? "cache";
	const base = netlifyBlobsDriver({
		name,
		deployScoped: false,
		fetch: createResilientNetlifyBlobsFetch(),
	});

	const getKeys = base.getKeys?.bind(base);
	const getItem = base.getItem?.bind(base);
	const setItem = base.setItem?.bind(base);
	const removeItem = base.removeItem?.bind(base);

	return {
		...base,
		name: "netlify-blobs-resilient",
		async getKeys(baseKey, tops) {
			try {
				return (await getKeys?.(baseKey, tops)) ?? [];
			} catch (error) {
				// i18n clears `nitro:handlers:i18n` on every serverless bootstrap via
				// useStorage("cache").getKeys(...). Transient Blobs failures must not
				// abort startup; Sentry instruments drivers and would otherwise report
				// the throw as unhandled before the plugin's empty catch runs.
				if (isFailOpenError(error)) {
					return [];
				}
				throw error;
			}
		},
		async getItem(key, opts) {
			try {
				return (await getItem?.(key, opts)) ?? null;
			} catch (error) {
				if (isFailOpenError(error)) {
					return null;
				}
				throw error;
			}
		},
		async setItem(key, value, opts) {
			await withFailOpenRetry(async () => {
				await setItem?.(key, value, opts);
			});
		},
		async removeItem(key, opts) {
			await withFailOpenRetry(async () => {
				await removeItem?.(key, opts);
			});
		},
	};
});
