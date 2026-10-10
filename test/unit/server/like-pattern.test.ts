import { containsPattern } from "#server/utils/like-pattern";
import { describe, expect, it } from "vitest";

describe("containsPattern", () => {
	it("wraps a plain term in wildcards", () => {
		expect(containsPattern("ban")).toBe("%ban%");
	});

	it("escapes the LIKE wildcards so they match literally", () => {
		expect(containsPattern("_")).toBe(String.raw`%\_%`);
		expect(containsPattern("100%")).toBe(String.raw`%100\%%`);
	});

	it("escapes the escape character itself", () => {
		expect(containsPattern(String.raw`a\b`)).toBe(String.raw`%a\\b%`);
	});
});
