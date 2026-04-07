import { bitwiseArray, bitwiseHas, bitwiseSet } from "#shared/utils/bits";
import { describe, expect, it } from "vitest";

describe("bitwiseSet", () => {
	it("should set a bit when toggle is true", () => {
		expect(bitwiseSet(0b0000, 0b0010, true)).toBe(0b0010);
	});

	it("should not change already-set bits when toggle is true", () => {
		expect(bitwiseSet(0b0010, 0b0010, true)).toBe(0b0010);
	});

	it("should clear a bit when toggle is false", () => {
		expect(bitwiseSet(0b0011, 0b0010, false)).toBe(0b0001);
	});

	it("should not change already-cleared bits when toggle is false", () => {
		expect(bitwiseSet(0b0001, 0b0010, false)).toBe(0b0001);
	});

	it("should handle setting multiple bits", () => {
		expect(bitwiseSet(0b0000, 0b1111, true)).toBe(0b1111);
	});

	it("should handle clearing all bits", () => {
		expect(bitwiseSet(0b1111, 0b1111, false)).toBe(0b0000);
	});

	it("should preserve other bits when setting", () => {
		expect(bitwiseSet(0b1010, 0b0100, true)).toBe(0b1110);
	});

	it("should preserve other bits when clearing", () => {
		expect(bitwiseSet(0b1110, 0b0100, false)).toBe(0b1010);
	});
});

describe("bitwiseHas", () => {
	it("should return true when bit is set", () => {
		expect(bitwiseHas(0b0010, 0b0010)).toBe(true);
	});

	it("should return false when bit is not set", () => {
		expect(bitwiseHas(0b0001, 0b0010)).toBe(false);
	});

	it("should return true when all checked bits are set", () => {
		expect(bitwiseHas(0b1111, 0b0110)).toBe(true);
	});

	it("should return false when only some checked bits are set", () => {
		expect(bitwiseHas(0b0010, 0b0110)).toBe(false);
	});

	it("should return true for zero bit check on any value", () => {
		expect(bitwiseHas(0b1111, 0b0000)).toBe(true);
		expect(bitwiseHas(0b0000, 0b0000)).toBe(true);
	});

	it("should return false for non-zero check on zero value", () => {
		expect(bitwiseHas(0b0000, 0b0001)).toBe(false);
	});
});

describe("bitwiseArray", () => {
	it("should combine bits with OR", () => {
		expect(bitwiseArray([0b0001, 0b0010, 0b0100])).toBe(0b0111);
	});

	it("should return 0 for empty array", () => {
		expect(bitwiseArray([])).toBe(0);
	});

	it("should handle single element", () => {
		expect(bitwiseArray([0b1010])).toBe(0b1010);
	});

	it("should handle overlapping bits", () => {
		expect(bitwiseArray([0b0011, 0b0110])).toBe(0b0111);
	});

	it("should handle all zeros", () => {
		expect(bitwiseArray([0, 0, 0])).toBe(0);
	});
});
