import { defineDriver } from "unstorage";
import netlifyBlobsDriver from "unstorage/drivers/netlify-blobs";
import { createResilientNetlifyBlobsFetch } from "./resilient-fetch.ts";
import { isTransientNetworkError } from "./transient-network-error.ts";

type ResilientNetlifyBlobsOptions = {
	/** Present when Nitro JSON-serializes the mount config into the driver factory. */
	driver?: string;
	/** Blob store name (required for site-scoped stores). */
	name?: string;
};

/**
 * Returns true when the error is a Netlify Blobs authentication failure caused
 * by the short-lived JWT that Netlify injects into each Lambda container at
 * cold start. The token has a ~15-minute TTL; warm containers that outlive it
 * receive a 401 from edge.netlifyblobs.com which the SDK surfaces as a
 * BlobsInternalError with "Token expired" in its message.
 */
function isBlobsTokenExpiredError(error: unknown): boolean {
	if (!error || typeof error !== "object") return false;
	const name = "name" in error ? (error as { name: unknown }).name : undefined;
	const message = "message" in error ? (error as { message: unknown }).message : undefined;
	return (
		name === "BlobsInternalError" &&
		typeof message === "string" &&
		message.toLowerCase().includes("token expired")
	);
}

/**
 * Netlify Blobs unstorage driver with:
 * 1. Body-buffering fetch + short retries for transient TCP resets (socket hang up)
 * 2. Fail-open `getKeys` so `@nuxtjs/i18n` bootstrap cache clears never crash cold starts
 *    or get reported as unhandled by Sentry's storage instrumentation
 * 3. Fail-open `getItem` / `setItem` / `removeItem` on token-expiry errors so that
 *    warm Lambda containers that outlive the injected JWT degrade gracefully to a
 *    cache miss instead of throwing an unhandled BlobsInternalError.
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
				if (isTransientNetworkError(error)) {
					return [];
				}
				throw error;
			}
		},
		async getItem(key, opts) {
			try {
				return (await getItem?.(key, opts)) ?? null;
			} catch (error) {
				// Warm Lambda containers that outlive the ~15-minute injected JWT will
				// receive a 401 from Netlify Blobs. Treat this as a cache miss so the
				// request falls through to the real handler instead of crashing.
				if (isBlobsTokenExpiredError(error)) {
					return null;
				}
				throw error;
			}
		},
		async setItem(key, value, opts) {
			try {
				await setItem?.(key, value, opts);
			} catch (error) {
				// Silently skip cache writes when the token is expired; the next cold
				// start will have a fresh token and can re-populate the cache.
				if (isBlobsTokenExpiredError(error)) {
					return;
				}
				throw error;
			}
		},
		async removeItem(key, opts) {
			try {
				await removeItem?.(key, opts);
			} catch (error) {
				if (isBlobsTokenExpiredError(error)) {
					return;
				}
				throw error;
			}
		},
	};
});
