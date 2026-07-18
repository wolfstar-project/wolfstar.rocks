import type { CachedFetchEntry } from "#shared/utils/fetch-cache-config";
import {
	FETCH_CACHE_ALLOWED_DOMAINS,
	FETCH_CACHE_DEFAULT_TTL,
	FETCH_CACHE_STORAGE_BASE,
	FETCH_CACHE_VERSION,
	generateFetchCacheKey,
	isAllowedDomain,
	isCacheEntryStale,
	resolveFetchCacheUrl,
	shouldCacheFetch,
} from "#shared/utils/fetch-cache-config";
import { describe, expect, it, vi } from "vitest";

describe("isAllowedDomain", () => {
	it("should return true for relative URLs", () => {
		expect(isAllowedDomain("/api/users")).toBe(true);
		expect(isAllowedDomain("/")).toBe(true);
		expect(isAllowedDomain("/guilds/123")).toBe(true);
	});

	it("should return true for allowed domains", () => {
		for (const domain of FETCH_CACHE_ALLOWED_DOMAINS) {
			expect(isAllowedDomain(`https://${domain}/api`)).toBe(true);
		}
	});

	it("should return false for disallowed domains", () => {
		expect(isAllowedDomain("https://evil.com/api")).toBe(false);
		expect(isAllowedDomain("https://google.com")).toBe(false);
		expect(isAllowedDomain("https://discord.com/api")).toBe(false);
	});

	it("should accept URL objects", () => {
		const allowed = new URL("https://wolfstar.rocks/api");
		expect(isAllowedDomain(allowed)).toBe(true);

		const disallowed = new URL("https://evil.com/api");
		expect(isAllowedDomain(disallowed)).toBe(false);
	});

	it("should return false for invalid URLs", () => {
		expect(isAllowedDomain("not-a-url")).toBe(false);
		expect(isAllowedDomain("")).toBe(false);
	});

	it("should not allow subdomains that are not explicitly listed", () => {
		expect(isAllowedDomain("https://evil.wolfstar.rocks/api")).toBe(false);
	});
});

describe("isCacheEntryStale", () => {
	it("should return false for a fresh entry", () => {
		const entry: CachedFetchEntry = {
			data: {},
			status: 200,
			headers: {},
			cachedAt: Date.now(),
			ttl: 300,
		};
		expect(isCacheEntryStale(entry)).toBe(false);
	});

	it("should return true for an expired entry", () => {
		const entry: CachedFetchEntry = {
			data: {},
			status: 200,
			headers: {},
			cachedAt: Date.now() - 600_000,
			ttl: 300,
		};
		expect(isCacheEntryStale(entry)).toBe(true);
	});

	it("should return false for entry exactly at TTL boundary", () => {
		const now = Date.now();
		vi.spyOn(Date, "now").mockReturnValue(now);
		const entry: CachedFetchEntry = {
			data: {},
			status: 200,
			headers: {},
			cachedAt: now - 300_000,
			ttl: 300,
		};
		expect(isCacheEntryStale(entry)).toBe(false);
		vi.restoreAllMocks();
	});

	it("should return true for entry 1ms past TTL", () => {
		const now = Date.now();
		vi.spyOn(Date, "now").mockReturnValue(now);
		const entry: CachedFetchEntry = {
			data: {},
			status: 200,
			headers: {},
			cachedAt: now - 300_001,
			ttl: 300,
		};
		expect(isCacheEntryStale(entry)).toBe(true);
		vi.restoreAllMocks();
	});

	it("should handle zero TTL", () => {
		const entry: CachedFetchEntry = {
			data: {},
			status: 200,
			headers: {},
			cachedAt: Date.now() - 1,
			ttl: 0,
		};
		expect(isCacheEntryStale(entry)).toBe(true);
	});
});

describe("constants", () => {
	it("should have correct default TTL of 5 minutes", () => {
		expect(FETCH_CACHE_DEFAULT_TTL).toBe(300);
	});

	it("should have a cache version", () => {
		expect(FETCH_CACHE_VERSION).toBe("v2");
	});

	it("should have a storage base key", () => {
		expect(FETCH_CACHE_STORAGE_BASE).toBe("fetch-cache");
	});

	it("should have known allowed domains", () => {
		expect(FETCH_CACHE_ALLOWED_DOMAINS).toContain("wolfstar.rocks");
		expect(FETCH_CACHE_ALLOWED_DOMAINS).toContain("api.wolfstar.rocks");
	});
});

describe("resolveFetchCacheUrl", () => {
	it("should apply baseURL to relative paths", () => {
		const resolved = resolveFetchCacheUrl("/guilds/1/settings", {
			baseURL: "https://api.wolfstar.rocks",
		});
		expect(resolved.href).toBe("https://api.wolfstar.rocks/guilds/1/settings");
	});

	it("should merge query options into the search string", () => {
		const resolved = resolveFetchCacheUrl("/audit-logs", {
			baseURL: "https://api.wolfstar.rocks",
			query: { limit: 25, page: 2 },
		});
		expect(resolved.searchParams.get("limit")).toBe("25");
		expect(resolved.searchParams.get("page")).toBe("2");
	});
});

describe("shouldCacheFetch", () => {
	it("should allow same-origin relative URLs without baseURL", () => {
		expect(shouldCacheFetch("/api/users")).toBe(true);
	});

	it("should allow relative URLs when baseURL is an allowed host", () => {
		expect(shouldCacheFetch("/commands", { baseURL: "https://api.wolfstar.rocks" })).toBe(true);
	});

	it("should reject relative URLs when baseURL is disallowed", () => {
		expect(shouldCacheFetch("/commands", { baseURL: "https://evil.com" })).toBe(false);
	});
});

describe("generateFetchCacheKey", () => {
	it("should include the resolved host from baseURL", () => {
		const key = generateFetchCacheKey("/commands", {
			baseURL: "https://api.wolfstar.rocks",
		});
		expect(key).toContain("api.wolfstar.rocks");
		expect(key).toContain("/commands");
	});

	it("should differ when query params differ", () => {
		const a = generateFetchCacheKey("/audit-logs", {
			baseURL: "https://api.wolfstar.rocks",
			query: { page: 1 },
		});
		const b = generateFetchCacheKey("/audit-logs", {
			baseURL: "https://api.wolfstar.rocks",
			query: { page: 2 },
		});
		expect(a).not.toBe(b);
	});

	it("should differ when Cookie headers differ", () => {
		const a = generateFetchCacheKey("/guilds/1/settings", {
			baseURL: "https://api.wolfstar.rocks",
			headers: { Cookie: "SAPPHIRE_AUTH=user-a" },
		});
		const b = generateFetchCacheKey("/guilds/1/settings", {
			baseURL: "https://api.wolfstar.rocks",
			headers: { Cookie: "SAPPHIRE_AUTH=user-b" },
		});
		expect(a).not.toBe(b);
	});

	it("should share keys for anonymous requests", () => {
		const a = generateFetchCacheKey("/commands", {
			baseURL: "https://api.wolfstar.rocks",
		});
		const b = generateFetchCacheKey("/commands", {
			baseURL: "https://api.wolfstar.rocks",
			headers: { "Content-Type": "application/json" },
		});
		expect(a).toBe(b);
	});
});
