/**
 * Configuration for the stale-while-revalidate fetch cache.
 *
 * This cache intercepts external API calls during SSR and caches responses
 */

/**
 * Domains that should have their fetch responses cached.
 * Only requests to these domains will be intercepted and cached.
 */
export const FETCH_CACHE_ALLOWED_DOMAINS = [
	"wolfstar.rocks",
	"api.wolfstar.rocks",
	"beta.wolfstar.rocks",
	"api.beta.wolfstar.rocks",
	"localhost:8282",
];

/**
 * Default TTL for cached fetch responses (in seconds).
 * After this time, cached data is considered "stale" but will still be
 * returned immediately while a background revalidation occurs.
 */
export const FETCH_CACHE_DEFAULT_TTL = 60 * 5; // 5 minutes

/**
 * Cache key version prefix.
 * Increment this to invalidate all cached entries (e.g., after format changes).
 */
export const FETCH_CACHE_VERSION = "v1";

/**
 * Storage key prefix for fetch cache entries.
 */
export const FETCH_CACHE_STORAGE_BASE = "fetch-cache";

/**
 * Check if a URL's host is in the allowed domains list.
 *
 * Relative URLs (e.g. "/api/users") are always treated as same-origin and
 * therefore allowed — they will never resolve to an external host.
 */
export function isAllowedDomain(url: string | URL): boolean {
	// Relative URLs are same-origin: always cache-eligible
	if (typeof url === "string" && url.startsWith("/")) {
		return true;
	}

	try {
		const urlObj = typeof url === "string" ? new URL(url) : url;
		return FETCH_CACHE_ALLOWED_DOMAINS.includes(urlObj.host);
	} catch {
		return false;
	}
}

/**
 * Structure of a cached fetch entry stored in Nitro storage.
 */
export interface CachedFetchEntry<T = unknown> {
	/** The response body/data */
	data: T;
	/** HTTP status code */
	status: number;
	/** Response headers (subset) */
	headers: Record<string, string>;
	/** Unix timestamp when the entry was cached */
	cachedAt: number;
	/** TTL in seconds */
	ttl: number;
}

/**
 * Check if a cached entry is stale (past its TTL).
 */
export function isCacheEntryStale(entry: CachedFetchEntry): boolean {
	const now = Date.now();
	const expiresAt = entry.cachedAt + entry.ttl * 1000;
	return now > expiresAt;
}

/**
 * Result returned by cachedFetch with staleness metadata.
 * This allows consumers to know if the data came from stale cache
 * and potentially trigger client-side revalidation.
 */
export interface CachedFetchResult<T> {
	/** The response data */
	data: T;
	/** Whether the data came from stale cache (past TTL) */
	isStale: boolean;
	/** Unix timestamp when the data was cached, or null if fresh fetch */
	cachedAt: number | null;
}

/**
 * Type for the cachedFetch function attached to event context.
 */
export type CachedFetchFunction = <T = unknown>(
	url: string,
	options?: Parameters<typeof $fetch>[1],
	ttl?: number,
) => Promise<CachedFetchResult<T>>;
