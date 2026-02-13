import type { CachedFetchEntry, CachedFetchResult } from "#shared/utils/fetch-cache-config";
import type { H3Event } from "h3";
import {
	FETCH_CACHE_DEFAULT_TTL,
	FETCH_CACHE_STORAGE_BASE,
	FETCH_CACHE_VERSION,
	isAllowedDomain,
	isCacheEntryStale,
} from "#shared/utils/fetch-cache-config";
import { $fetch } from "ofetch";

/**
 * Simple hash function for cache keys.
 */
function simpleHash(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash &= hash;
	}
	return Math.abs(hash).toString(36);
}

/**
 * Generate a cache key for a fetch request.
 */
function generateFetchCacheKey(url: string | URL, method = "GET", body?: unknown): string {
	const urlObj = typeof url === "string" ? new URL(url) : url;
	const bodyHash = body ? simpleHash(JSON.stringify(body)) : "";
	const searchHash = urlObj.search ? simpleHash(urlObj.search) : "";

	const parts = [FETCH_CACHE_VERSION, urlObj.host, method.toUpperCase(), urlObj.pathname, searchHash, bodyHash].filter(Boolean);

	return parts.join(":");
}

/**
 * Server plugin that attaches a cachedFetch function to the event context.
 * This allows app composables to access the cached fetch via useRequestEvent().
 *
 * The cachedFetch function implements stale-while-revalidate (SWR) semantics:
 * - Fresh cache hit: Return cached data immediately
 * - Stale cache hit: Return stale data immediately + revalidate in background via waitUntil
 * - Cache miss: Fetch data, return immediately, cache in background via waitUntil
 */
export default defineNitroPlugin((nitroApp) => {
	const storage = useStorage(FETCH_CACHE_STORAGE_BASE);

	/**
	 * Factory that creates a cachedFetch function bound to a specific request event.
	 * This allows using event.waitUntil() for background revalidation.
	 */
	function createCachedFetch(event: H3Event): CachedFetchFunction {
		return async <T = unknown>(
			url: string,
			options: Parameters<typeof $fetch>[1] = {},
			ttl: number = FETCH_CACHE_DEFAULT_TTL,
		): Promise<CachedFetchResult<T>> => {
			// Check if this URL should be cached
			if (!isAllowedDomain(url)) {
				const data = (await $fetch(url, options)) as T;
				return { cachedAt: null, data, isStale: false };
			}

			const method = options.method || "GET";
			const cacheKey = generateFetchCacheKey(url, method, options.body);

			// Try to get cached response (with error handling for storage failures)
			let cached: CachedFetchEntry<T> | null = null;
			try {
				cached = await storage.getItem<CachedFetchEntry<T>>(cacheKey);
			} catch (error) {
				// Storage read failed (e.g., ENOENT on misconfigured storage)
				// Log and continue without cache
				import.meta.dev && logger.warn(`[fetch-cache] Storage read failed for ${url}:`, error);
			}

			if (cached) {
				const isStale = isCacheEntryStale(cached);

				if (!isStale) {
					// Cache hit, data is fresh
					import.meta.dev && logger.info(`[fetch-cache] HIT (fresh): ${url}`);
					return { cachedAt: cached.cachedAt, data: cached.data, isStale: false };
				}

				// Cache hit but stale - return stale data and revalidate in background

				import.meta.dev && logger.info(`[fetch-cache] HIT (stale, revalidating): ${url}`);

				// Background revalidation using event.waitUntil()
				// This ensures the revalidation completes even in serverless environments
				event.waitUntil(
					(async () => {
						try {
							const freshData = (await $fetch(url, options as Parameters<typeof $fetch>[1])) as T;
							const entry: CachedFetchEntry<T> = {
								cachedAt: Date.now(),
								data: freshData,
								headers: {},
								status: 200,
								ttl,
							};
							await storage.setItem(cacheKey, entry);
							import.meta.dev && logger.info(`[fetch-cache] Revalidated: ${url}`);
						} catch (error) {
							import.meta.dev && logger.warn(`[fetch-cache] Revalidation failed: ${url}`, error);
						}
					})(),
				);

				// Return stale data immediately
				return { cachedAt: cached.cachedAt, data: cached.data, isStale: true };
			}

			// Cache miss - fetch and return immediately, cache in background
			import.meta.dev && logger.info(`[fetch-cache] MISS: ${url}`);

			const data = (await $fetch(url, options as Parameters<typeof $fetch>[1])) as T;
			const cachedAt = Date.now();

			// Defer cache write to background via waitUntil for faster response
			event.waitUntil(
				(async () => {
					try {
						const entry: CachedFetchEntry<T> = {
							cachedAt,
							data,
							headers: {},
							status: 200,
							ttl,
						};
						await storage.setItem(cacheKey, entry);
					} catch (error) {
						// Storage write failed - log but don't fail the request
						import.meta.dev && logger.warn(`[fetch-cache] Storage write failed for ${url}:`, error);
					}
				})(),
			);

			return { cachedAt, data, isStale: false };
		};
	}

	// Attach to event context for access in composables via useRequestEvent()
	nitroApp.hooks.hook("request", (event) => {
		event.context.cachedFetch = createCachedFetch(event);
	});
});

// Extend the H3EventContext type
declare module "h3" {
	interface H3EventContext {
		cachedFetch?: CachedFetchFunction;
	}
}
