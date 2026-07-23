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
export const FETCH_CACHE_VERSION = "v2";

/**
 * Storage key prefix for fetch cache entries.
 */
export const FETCH_CACHE_STORAGE_BASE = "fetch-cache";

/**
 * Simple hash for cache-key segments (query, body, auth headers).
 */
export function simpleHash(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash &= hash;
	}
	return Math.abs(hash).toString(36);
}

export type FetchCacheKeyOptions = {
	method?: string;
	body?: unknown;
	baseURL?: string;
	query?: Record<string, unknown>;
	headers?: HeadersInit;
};

/**
 * Resolve a fetch URL the same way ofetch does for cache eligibility / keys:
 * apply `baseURL` and merge `query` into the search string.
 */
export function resolveFetchCacheUrl(url: string, options: FetchCacheKeyOptions = {}): URL {
	const base = options.baseURL || "http://localhost";
	const urlObj = new URL(url, base);

	if (options.query) {
		for (const [key, value] of Object.entries(options.query)) {
			if (value === undefined || value === null) {
				continue;
			}
			if (Array.isArray(value)) {
				for (const entry of value) {
					urlObj.searchParams.append(key, String(entry));
				}
			} else {
				urlObj.searchParams.set(key, String(value));
			}
		}
	}

	return urlObj;
}

function readHeader(headers: HeadersInit | undefined, name: string): string | undefined {
	if (!headers) {
		return undefined;
	}

	const lower = name.toLowerCase();

	if (headers instanceof Headers) {
		return headers.get(name) ?? undefined;
	}

	if (Array.isArray(headers)) {
		for (const [key, value] of headers) {
			if (key.toLowerCase() === lower) {
				return value;
			}
		}
		return undefined;
	}

	for (const [key, value] of Object.entries(headers)) {
		if (key.toLowerCase() === lower) {
			if (Array.isArray(value)) {
				const first = value[0];
				return first === undefined ? undefined : String(first);
			}
			return value === undefined ? undefined : String(value);
		}
	}

	return undefined;
}

/**
 * Auth-scoped fragment for cache keys. Authenticated SSR responses must not
 * be reused across users; public/anonymous calls share one entry.
 */
export function getFetchCacheAuthKey(headers: HeadersInit | undefined): string {
	const cookie = readHeader(headers, "cookie");
	const authorization = readHeader(headers, "authorization");
	const material = [cookie, authorization].filter(Boolean).join("|");
	return material ? simpleHash(material) : "";
}

/**
 * Generate a cache key that includes host (via baseURL), query, body, and auth.
 */
export function generateFetchCacheKey(url: string, options: FetchCacheKeyOptions = {}): string {
	const urlObj = resolveFetchCacheUrl(url, options);
	const method = (options.method || "GET").toUpperCase();
	const bodyHash = options.body ? simpleHash(JSON.stringify(options.body)) : "";
	const searchHash = urlObj.search ? simpleHash(urlObj.search) : "";
	const authHash = getFetchCacheAuthKey(options.headers);

	return [
		FETCH_CACHE_VERSION,
		urlObj.host,
		method,
		urlObj.pathname,
		searchHash,
		bodyHash,
		authHash,
	]
		.filter(Boolean)
		.join(":");
}

/**
 * Whether a fetch URL should use the SSR fetch cache.
 *
 * Relative URLs without `baseURL` are treated as same-origin and allowed.
 * Relative URLs with `baseURL` (e.g. `$api`) are checked against the resolved host.
 */
export function shouldCacheFetch(url: string, options: FetchCacheKeyOptions = {}): boolean {
	if (typeof url === "string" && url.startsWith("/") && !options.baseURL) {
		return true;
	}

	try {
		return isAllowedDomain(resolveFetchCacheUrl(url, options));
	} catch {
		return false;
	}
}

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
