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
 * Netlify Blobs unstorage driver with:
 * 1. Body-buffering fetch + short retries for transient TCP resets (socket hang up)
 * 2. Fail-open `getKeys` so bootstrap cache clears never crash cold starts
 *    or get reported as unhandled by Sentry's storage instrumentation
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
	};
});
