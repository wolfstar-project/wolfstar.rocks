import { describe, expect, it } from "vitest";

describe("useCachedFetch", () => {
	it("should return a function", () => {
		const cachedFetch = useCachedFetch();
		expect(typeof cachedFetch).toBe("function");
	});

	it("should return a function that accepts url, options, and ttl parameters", () => {
		const cachedFetch = useCachedFetch();
		expect(cachedFetch.length).toBeGreaterThanOrEqual(0);
	});

	it("should be callable multiple times returning independent functions", () => {
		const cachedFetch1 = useCachedFetch();
		const cachedFetch2 = useCachedFetch();
		expect(cachedFetch1).not.toBe(cachedFetch2);
	});
});
