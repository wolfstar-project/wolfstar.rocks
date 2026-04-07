import type { CachedFetchEntry } from "#shared/utils/fetch-cache-config";
import {
	FETCH_CACHE_ALLOWED_DOMAINS,
	FETCH_CACHE_DEFAULT_TTL,
	FETCH_CACHE_STORAGE_BASE,
	FETCH_CACHE_VERSION,
	isAllowedDomain,
	isCacheEntryStale,
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
		expect(FETCH_CACHE_VERSION).toBe("v1");
	});

	it("should have a storage base key", () => {
		expect(FETCH_CACHE_STORAGE_BASE).toBe("fetch-cache");
	});

	it("should have known allowed domains", () => {
		expect(FETCH_CACHE_ALLOWED_DOMAINS).toContain("wolfstar.rocks");
		expect(FETCH_CACHE_ALLOWED_DOMAINS).toContain("api.wolfstar.rocks");
	});
});
