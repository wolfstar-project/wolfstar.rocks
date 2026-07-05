import process from "node:process";
import { defineNuxtModule } from "nuxt/kit";
import { provider } from "std-env";

// Storage key for fetch cache - must match shared/utils/fetch-cache-config.ts
const FETCH_CACHE_STORAGE_BASE = "fetch-cache";
// Rate limiter buckets - must match server/utils/wrappedEventHandler.ts
const RATELIMITER_STORAGE_KEY = "wolfstar:ratelimiter";

export default defineNuxtModule({
	meta: {
		name: "vercel-cache",
	},
	setup(_, nuxt) {
		if (provider !== "vercel") {
			return;
		}

		nuxt.hook("nitro:config", (nitroConfig) => {
			nitroConfig.storage = nitroConfig.storage || {};

			// Vercel's filesystem is ephemeral/read-only, so the fsLite defaults from
			// nuxt.config lose state between invocations and make rate limiting
			// per-instance. When RUNTIME_CACHE is enabled, back the persistent storages
			// with Vercel's Runtime Cache so they are shared across all functions.
			if (process.env.RUNTIME_CACHE) {
				// Main cache storage (for defineCachedFunction, etc.)
				nitroConfig.storage.cache = {
					...nitroConfig.storage.cache,
					driver: "vercel-runtime-cache",
				};

				// Fetch cache storage (for SWR fetch caching)
				nitroConfig.storage[FETCH_CACHE_STORAGE_BASE] = {
					...nitroConfig.storage[FETCH_CACHE_STORAGE_BASE],
					driver: "vercel-runtime-cache",
				};

				// Rate limiter buckets - shared across all serverless instances.
				nitroConfig.storage[RATELIMITER_STORAGE_KEY] = {
					...nitroConfig.storage[RATELIMITER_STORAGE_KEY],
					driver: "vercel-runtime-cache",
				};
			}
		});
	},
});
