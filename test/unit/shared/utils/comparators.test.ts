import { describe, expect, it } from "vitest";
import { asc, desc, max } from "../../../../shared/utils/comparators";

describe("asc", () => {
  it("should return -1 when first number is smaller", () => {
    expect(asc(1, 2)).toBe(-1);
    expect(asc(0, 100)).toBe(-1);
    expect(asc(-10, 5)).toBe(-1);
  });

  it("should return 1 when first number is larger", () => {
    expect(asc(2, 1)).toBe(1);
    expect(asc(100, 0)).toBe(1);
    expect(asc(5, -10)).toBe(1);
  });

  it("should return 0 when numbers are equal", () => {
    expect(asc(1, 1)).toBe(0);
    expect(asc(0, 0)).toBe(0);
    expect(asc(-5, -5)).toBe(0);
  });

  it("should work with strings in ascending order", () => {
    expect(asc("a", "b")).toBe(-1);
    expect(asc("b", "a")).toBe(1);
    expect(asc("abc", "abc")).toBe(0);
    expect(asc("apple", "banana")).toBe(-1);
    expect(asc("zebra", "apple")).toBe(1);
  });

  it("should work with bigints in ascending order", () => {
    expect(asc(BigInt(1), BigInt(2))).toBe(-1);
    expect(asc(BigInt(2), BigInt(1))).toBe(1);
    expect(asc(BigInt(100), BigInt(100))).toBe(0);
    expect(asc(BigInt(-10), BigInt(5))).toBe(-1);
    expect(asc(BigInt(5), BigInt(-10))).toBe(1);
  });

  it("should handle zero values correctly", () => {
    expect(asc(0, 1)).toBe(-1);
    expect(asc(1, 0)).toBe(1);
    expect(asc(0, 0)).toBe(0);
    expect(asc(-1, 0)).toBe(-1);
    expect(asc(0, -1)).toBe(1);
  });

  it("should handle negative numbers correctly", () => {
    expect(asc(-5, -3)).toBe(-1);
    expect(asc(-3, -5)).toBe(1);
    expect(asc(-10, -10)).toBe(0);
    expect(asc(-100, 0)).toBe(-1);
    expect(asc(0, -100)).toBe(1);
  });
});

describe("desc", () => {
  it("should return 1 when first number is smaller", () => {
    expect(desc(1, 2)).toBe(1);
    expect(desc(0, 100)).toBe(1);
    expect(desc(-10, 5)).toBe(1);
  });

  it("should return -1 when first number is larger", () => {
    expect(desc(2, 1)).toBe(-1);
    expect(desc(100, 0)).toBe(-1);
    expect(desc(5, -10)).toBe(-1);
  });

  it("should return 0 when numbers are equal", () => {
    expect(desc(1, 1)).toBe(0);
    expect(desc(0, 0)).toBe(0);
    expect(desc(-5, -5)).toBe(0);
  });

  it("should work with strings in descending order", () => {
    expect(desc("a", "b")).toBe(1);
    expect(desc("b", "a")).toBe(-1);
    expect(desc("abc", "abc")).toBe(0);
    expect(desc("apple", "banana")).toBe(1);
    expect(desc("zebra", "apple")).toBe(-1);
  });

  it("should work with bigints in descending order", () => {
    expect(desc(BigInt(1), BigInt(2))).toBe(1);
    expect(desc(BigInt(2), BigInt(1))).toBe(-1);
    expect(desc(BigInt(100), BigInt(100))).toBe(0);
    expect(desc(BigInt(-10), BigInt(5))).toBe(1);
    expect(desc(BigInt(5), BigInt(-10))).toBe(-1);
  });

  it("should handle zero values correctly", () => {
    expect(desc(0, 1)).toBe(1);
    expect(desc(1, 0)).toBe(-1);
    expect(desc(0, 0)).toBe(0);
    expect(desc(-1, 0)).toBe(1);
    expect(desc(0, -1)).toBe(-1);
  });

  it("should handle negative numbers correctly", () => {
    expect(desc(-5, -3)).toBe(1);
    expect(desc(-3, -5)).toBe(-1);
    expect(desc(-10, -10)).toBe(0);
    expect(desc(-100, 0)).toBe(1);
    expect(desc(0, -100)).toBe(-1);
  });
});

describe("max", () => {
  it("should return maximum from multiple number values", () => {
    expect(max(1, 2, 3, 4, 5)).toBe(5);
    expect(max(10, 5, 8, 3, 12)).toBe(12);
    expect(max(100, 200, 50)).toBe(200);
    expect(max(7, 2, 9, 1, 15, 6)).toBe(15);
  });

  it("should return maximum from array of bigints", () => {
    expect(max(BigInt(1), BigInt(2), BigInt(3))).toBe(BigInt(3));
    expect(max(BigInt(100), BigInt(500), BigInt(250))).toBe(BigInt(500));
    expect(max(BigInt(10), BigInt(5), BigInt(20), BigInt(15))).toBe(BigInt(20));
  });

  it("should handle single value", () => {
    expect(max(42)).toBe(42);
    expect(max(0)).toBe(0);
    expect(max(-5)).toBe(-5);
    expect(max(BigInt(123))).toBe(BigInt(123));
  });

  it("should handle negative numbers", () => {
    expect(max(-1, -2, -3)).toBe(-1);
    expect(max(-10, -5, -20)).toBe(-5);
    expect(max(-100, -50, -75)).toBe(-50);
  });

  it("should handle mixed positive and negative numbers", () => {
    expect(max(-5, 0, 5)).toBe(5);
    expect(max(-10, -5, 0, 5, 10)).toBe(10);
    expect(max(3, -7, 1, -2, 8)).toBe(8);
    expect(max(-100, 50, -25, 75)).toBe(75);
  });

  it("should throw TypeError when no values provided", () => {
    expect(() => max()).toThrow(TypeError);
    expect(() => max()).toThrow("Expected at least 1 value.");
  });

  it("should throw TypeError when spreading empty array", () => {
    const empty: number[] = [];
    expect(() => max(...empty)).toThrow(TypeError);
    expect(() => max(...empty)).toThrow("Expected at least 1 value.");
  });

  it("should handle large arrays efficiently", () => {
    // Create deterministic array: [1, 2, 3, ..., 1000, ..., 1, 2, 3, ...]
    const largeArray = Array.from({ length: 10000 }, (_, i) => (i % 1000) + 1);
    expect(max(...largeArray)).toBe(1000);
  });

  it("should handle zero in the array", () => {
    expect(max(0, 1, 2)).toBe(2);
    expect(max(-5, 0, -3)).toBe(0);
    expect(max(0, 0, 0)).toBe(0);
    expect(max(5, 0, 10)).toBe(10);
  });

  it("should return first occurrence when all values are equal", () => {
    expect(max(7, 7, 7, 7)).toBe(7);
    expect(max(0, 0, 0)).toBe(0);
    expect(max(-3, -3, -3)).toBe(-3);
    expect(max(BigInt(5), BigInt(5))).toBe(BigInt(5));
  });
});
