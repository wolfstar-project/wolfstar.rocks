import { defineNuxtModule, useRuntimeConfig } from "nuxt/kit";
import { provider } from "std-env";
// Storage key for fetch cache - must match shared/utils/fetch-cache-config.ts
const FETCH_CACHE_STORAGE_BASE = "fetch-cache";

export default defineNuxtModule({
  meta: {
    name: "vercel-cache",
  },
  async setup(_, nuxt) {
    const config = useRuntimeConfig();
    if (provider !== "netlify") {
      return;
    }

    nuxt.hook("nitro:config", nitroConfig => {
      nitroConfig.storage = nitroConfig.storage || {};

      // Main cache storage (for defineCachedFunction, etc.)
      nitroConfig.storage.cache = {
        ...nitroConfig.storage.cache,
        driver: "netlifyBlobs",
      };

      // Fetch cache storage (for SWR fetch caching)
      nitroConfig.storage[FETCH_CACHE_STORAGE_BASE] = {
        ...nitroConfig.storage[FETCH_CACHE_STORAGE_BASE],
        driver: "netlifyBlobs",

      };

      nitroConfig.storage["wolfstar:ratelimiter"] = {
        driver: "cloudflareKVHttp",
        accountId: config.cloudflare.accountId,
        namespaceId: config.cloudflare.namespaceId,
        apiToken: config.cloudflare.apiToken,
      };
    });
  },
});
