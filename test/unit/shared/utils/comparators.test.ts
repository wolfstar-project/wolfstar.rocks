import { describe, expect, it } from "vitest";
import { asc, desc } from "../../../../shared/utils/comparators";

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
