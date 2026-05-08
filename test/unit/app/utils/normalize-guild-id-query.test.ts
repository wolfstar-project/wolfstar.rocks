import { describe, expect, it } from "vitest";
import { normalizeGuildIdQuery } from "~/utils/normalize-guild-id-query";

describe("normalizeGuildIdQuery", () => {
	it("returns guild id for a valid string", () => {
		expect(normalizeGuildIdQuery("123456789012345678")).toBe("123456789012345678");
	});

	it("returns undefined for missing value", () => {
		expect(normalizeGuildIdQuery(undefined)).toBeUndefined();
	});

	it("returns undefined for null-like query strings", () => {
		expect(normalizeGuildIdQuery("null")).toBeUndefined();
		expect(normalizeGuildIdQuery("undefined")).toBeUndefined();
	});

	it("trims valid ids and rejects empty strings", () => {
		expect(normalizeGuildIdQuery(" 123456789012345678 ")).toBe("123456789012345678");
		expect(normalizeGuildIdQuery("   ")).toBeUndefined();
	});
});
