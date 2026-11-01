import { createResolver, defineNuxtModule } from "nuxt/kit";
import { CLOUDFLARE_BINDINGS, isCloudflareBuild } from "../config/cloudflare.ts";

// Storage key for fetch cache - must match shared/utils/fetch-cache-config.ts
const FETCH_CACHE_STORAGE_BASE = "fetch-cache";

const { resolve } = createResolver(import.meta.url);
// Nitro `import()`s custom driver paths verbatim while building its build-time storage,
// so the mount needs an explicit `.ts` extension (and the driver chain needs extensioned
// relative imports) for plain Node ESM resolution + type stripping to load it.
const cloudflareKVFallbackDriver = resolve("../shared/utils/storage/cloudflare-kv-fallback.ts");

function cloudflareKVMount(binding: string, base?: string) {
	return {
		binding,
		driver: cloudflareKVFallbackDriver,
		...(base ? { base } : {}),
	};
}

export default defineNuxtModule({
	meta: {
		name: "cloudflare-cache",
	},
	async setup(_, nuxt) {
		if (nuxt.options.test) return;

		if (!isCloudflareBuild) return;

		nuxt.hook("nitro:config", (nitroConfig) => {
			// A Worker has no file system to keep the `fsLite` mounts on, so each one
			// moves to Workers KV, whole: the cache next to the fetch cache, and the
			// rate limiters in a namespace of their own. Skew protection mounts its
			// own from `skewProtection.storage` (nuxt.config.ts).
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
	},
});
