import { defineNuxtModule, useRuntimeConfig } from "nuxt/kit";
import { provider } from "std-env";

// Storage key for fetch cache - must match shared/utils/fetch-cache-config.ts
const FETCH_CACHE_STORAGE_BASE = "fetch-cache";
const RATELIMITER_STORAGE_BASE = "wolfstar:ratelimiter";

/**
 * On Vercel the filesystem is ephemeral and read-only outside of /tmp, so the
 * default fsLite drivers for the fetch cache, the SWR/defineCachedFunction cache,
 * and the rate limiter would silently lose state between invocations (and make
 * rate limiting per-instance rather than global). Point them at the shared Redis
 * instance instead. Locally and in tests we keep the fsLite defaults from
 * nuxt.config so no external service is required for development.
 */
export default defineNuxtModule({
	meta: {
		name: "vercel-cache",
	},
	async setup(_, nuxt) {
		if (nuxt.options.test) return;

		if (provider !== "vercel") {
			return;
		}

		const config = useRuntimeConfig();
		const url = config.redis.url;
		if (!url) {
			// eslint-disable-next-line no-console -- build-time deploy hint; no logger available in module setup
			console.warn(
				"[vercel-cache] Running on Vercel without REDIS_URL set; cache and rate limiter fall back to ephemeral per-instance storage. Set REDIS_URL to enable shared Redis-backed storage.",
			);
			return;
		}

		nuxt.hook("nitro:config", (nitroConfig) => {
			nitroConfig.storage = nitroConfig.storage || {};

			// Main cache storage (for defineCachedFunction / defineCachedEventHandler).
			nitroConfig.storage.cache = {
				...nitroConfig.storage.cache,
				base: "cache",
				driver: "redis",
				url,
			};

			// Stale-while-revalidate fetch cache.
			nitroConfig.storage[FETCH_CACHE_STORAGE_BASE] = {
				...nitroConfig.storage[FETCH_CACHE_STORAGE_BASE],
				base: FETCH_CACHE_STORAGE_BASE,
				driver: "redis",
				url,
			};

			// Rate limiter buckets — must be shared across all serverless instances.
			nitroConfig.storage[RATELIMITER_STORAGE_BASE] = {
				...nitroConfig.storage[RATELIMITER_STORAGE_BASE],
				base: RATELIMITER_STORAGE_BASE,
				driver: "redis",
				url,
			};
		});
	},
});
