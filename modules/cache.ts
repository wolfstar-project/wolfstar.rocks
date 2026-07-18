import { defineNuxtModule, useRuntimeConfig } from "nuxt/kit";
import { provider } from "std-env";
// Storage key for fetch cache - must match shared/utils/fetch-cache-config.ts
const FETCH_CACHE_STORAGE_BASE = "fetch-cache";
// Storage key for payload cache - must match server/plugins/payload-cache.ts
const PAYLOAD_CACHE_STORAGE_KEY = "payload-cache";

export default defineNuxtModule({
	meta: {
		name: "netlify-cache",
	},
	async setup(_, nuxt) {
		if (nuxt.options.test) return;

		const config = useRuntimeConfig();
		if (provider !== "netlify") {
			return;
		}

		nuxt.hook("nitro:config", (nitroConfig) => {
			nitroConfig.storage = nitroConfig.storage || {};

			// Main cache storage (for defineCachedFunction, etc.)
			nitroConfig.storage.cache = {
				...nitroConfig.storage.cache,
				driver: "netlifyBlobs",
				name: "cache",
			};

			// Fetch cache storage (for SWR fetch caching)
			nitroConfig.storage[FETCH_CACHE_STORAGE_BASE] = {
				...nitroConfig.storage[FETCH_CACHE_STORAGE_BASE],
				driver: "netlifyBlobs",
				name: FETCH_CACHE_STORAGE_BASE,
			};

			// Runtime _payload.json cache (avoids a second SSR for ISR/cache routes)
			nitroConfig.storage[PAYLOAD_CACHE_STORAGE_KEY] = {
				...nitroConfig.storage[PAYLOAD_CACHE_STORAGE_KEY],
				driver: "netlifyBlobs",
				name: PAYLOAD_CACHE_STORAGE_KEY,
			};

			nitroConfig.storage["wolfstar:ratelimiter"] = {
				accountId: config.cloudflare.accountId,
				apiToken: config.cloudflare.apiToken,
				driver: "cloudflareKVHttp",
				namespaceId: config.cloudflare.namespaceId,
			};

			// Shares the same KV namespace/credentials as the app rate limiter
			// above; `base` keeps its keys segregated within that namespace.
			nitroConfig.storage["wolfstar:auth-ratelimiter"] = {
				accountId: config.cloudflare.accountId,
				apiToken: config.cloudflare.apiToken,
				base: "wolfstar-auth-ratelimiter",
				driver: "cloudflareKVHttp",
				namespaceId: config.cloudflare.namespaceId,
			};
		});
	},
});
