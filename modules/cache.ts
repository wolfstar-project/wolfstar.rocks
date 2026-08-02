import { createResolver, defineNuxtModule, useRuntimeConfig } from "nuxt/kit";
import { provider } from "std-env";

// Storage key for fetch cache - must match shared/utils/fetch-cache-config.ts
const FETCH_CACHE_STORAGE_BASE = "fetch-cache";
const SKEW_PROTECTION_STORAGE_BASE = "skew-protection";

const { resolve } = createResolver(import.meta.url);
const resilientNetlifyBlobsDriver = resolve(
	"../server/utils/storage/netlify-blobs-resilient",
);

function netlifyBlobsMount(name: string) {
	return {
		driver: resilientNetlifyBlobsDriver,
		name,
	};
}

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

			// Main cache storage (for defineCachedFunction, i18n handler cache, etc.)
			// Uses a resilient Blobs driver so cold-start `getKeys("nitro:handlers:i18n")`
			// survives mid-body TCP resets from edge.netlifyblobs.com.
			nitroConfig.storage.cache = {
				...nitroConfig.storage.cache,
				...netlifyBlobsMount("cache"),
			};

			// Fetch cache storage (for SWR fetch caching)
			nitroConfig.storage[FETCH_CACHE_STORAGE_BASE] = {
				...nitroConfig.storage[FETCH_CACHE_STORAGE_BASE],
				...netlifyBlobsMount(FETCH_CACHE_STORAGE_BASE),
			};

			nitroConfig.storage[SKEW_PROTECTION_STORAGE_BASE] = {
				...nitroConfig.storage[SKEW_PROTECTION_STORAGE_BASE],
				...netlifyBlobsMount(SKEW_PROTECTION_STORAGE_BASE),
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
