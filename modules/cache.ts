import { createResolver, defineNuxtModule, useRuntimeConfig } from "nuxt/kit";
import { provider } from "std-env";
import { CLOUDFLARE_BINDINGS, isCloudflareBuild } from "../config/cloudflare.ts";

// Storage key for fetch cache - must match shared/utils/fetch-cache-config.ts
const FETCH_CACHE_STORAGE_BASE = "fetch-cache";
const SKEW_PROTECTION_STORAGE_BASE = "skew-protection";

const { resolve } = createResolver(import.meta.url);
// Nitro `import()`s custom driver paths verbatim while building its build-time storage,
// so the mount needs an explicit `.ts` extension (and the driver chain needs extensioned
// relative imports) for plain Node ESM resolution + type stripping to load it.
const resilientNetlifyBlobsDriver = resolve("../shared/utils/storage/netlify-blobs-resilient.ts");
const cloudflareKVFallbackDriver = resolve("../shared/utils/storage/cloudflare-kv-fallback.ts");

function netlifyBlobsMount(name: string) {
	return {
		driver: resilientNetlifyBlobsDriver,
		name,
	};
}

function cloudflareKVMount(binding: string, base?: string) {
	return {
		binding,
		driver: cloudflareKVFallbackDriver,
		...(base ? { base } : {}),
	};
}

export default defineNuxtModule({
	meta: {
		name: "netlify-cache",
	},
	async setup(_, nuxt) {
		if (nuxt.options.test) return;

		const config = useRuntimeConfig();
		if (isCloudflareBuild) {
			// A Worker has no file system to keep the `fsLite` mounts on, so each one
			// moves to Workers KV, whole: the cache next to the fetch cache, the rate
			// limiters with their keys as on Netlify. Skew protection mounts its own
			// namespace from `skewProtection.storage` (nuxt.config.ts).
			nuxt.hook("nitro:config", (nitroConfig) => {
				nitroConfig.storage = {
					...nitroConfig.storage,
					"cache": cloudflareKVMount(CLOUDFLARE_BINDINGS.cache, "cache"),
					[FETCH_CACHE_STORAGE_BASE]: cloudflareKVMount(
						CLOUDFLARE_BINDINGS.cache,
						FETCH_CACHE_STORAGE_BASE,
					),
					"wolfstar:ratelimiter": cloudflareKVMount(CLOUDFLARE_BINDINGS.rateLimit),
					"wolfstar:auth-ratelimiter": cloudflareKVMount(
						CLOUDFLARE_BINDINGS.rateLimit,
						"wolfstar-auth-ratelimiter",
					),
				};
			});
			return;
		}
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
