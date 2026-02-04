import { describe, expect, it } from "vitest";
import { asc, desc, differenceArray, differenceBitField, differenceMap, max } from "../../../../shared/utils/comparators";

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

describe("differenceBitField", () => {
  it("should detect added bits", () => {
    // 0b0101 (5) -> 0b1101 (13): added bit at position 3 (0b1000 = 8)
    const result = differenceBitField(0b0101, 0b1101);
    expect(result.added).toBe(0b1000);
    expect(result.removed).toBe(0);
  });

  it("should detect removed bits", () => {
    // 0b1101 (13) -> 0b0101 (5): removed bit at position 3 (0b1000 = 8)
    const result = differenceBitField(0b1101, 0b0101);
    expect(result.added).toBe(0);
    expect(result.removed).toBe(0b1000);
  });

  it("should detect both added and removed bits", () => {
    // 0b0101 (5) -> 0b1010 (10): removed bits 0,2 (0b0101), added bits 1,3 (0b1010)
    const result = differenceBitField(0b0101, 0b1010);
    expect(result.added).toBe(0b1010);
    expect(result.removed).toBe(0b0101);
  });

  it("should handle identical bitfields (no changes)", () => {
    const result = differenceBitField(0b1111, 0b1111);
    expect(result.added).toBe(0);
    expect(result.removed).toBe(0);
  });

  it("should handle zero values", () => {
    const result1 = differenceBitField(0, 0);
    expect(result1.added).toBe(0);
    expect(result1.removed).toBe(0);

    const result2 = differenceBitField(0, 0b1010);
    expect(result2.added).toBe(0b1010);
    expect(result2.removed).toBe(0);

    const result3 = differenceBitField(0b1010, 0);
    expect(result3.added).toBe(0);
    expect(result3.removed).toBe(0b1010);
  });

  it("should handle all bits set", () => {
    // 0b1111 (15) -> 0b0000 (0): all bits removed
    const result1 = differenceBitField(0b1111, 0b0000);
    expect(result1.added).toBe(0);
    expect(result1.removed).toBe(0b1111);

    // 0b0000 (0) -> 0b1111 (15): all bits added
    const result2 = differenceBitField(0b0000, 0b1111);
    expect(result2.added).toBe(0b1111);
    expect(result2.removed).toBe(0);
  });

  it("should work with bigint values", () => {
    const prev = 0b0101n;
    const next = 0b1101n;
    const result = differenceBitField(prev, next);

    expect(result.added).toBe(0b1000n);
    expect(result.removed).toBe(0b0000n);
  });
});

describe("differenceArray", () => {
  it("should detect added elements", () => {
    const previous = [1, 2, 3];
    const next = [1, 2, 3, 4, 5];
    const result = differenceArray(previous, next);
    expect(result.added).toEqual([4, 5]);
    expect(result.removed).toEqual([]);
  });

  it("should detect removed elements", () => {
    const previous = [1, 2, 3, 4, 5];
    const next = [1, 2, 3];
    const result = differenceArray(previous, next);
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([4, 5]);
  });

  it("should detect both added and removed elements", () => {
    const previous = [1, 2, 3];
    const next = [3, 4, 5];
    const result = differenceArray(previous, next);
    expect(result.added).toEqual([4, 5]);
    expect(result.removed).toEqual([1, 2]);
  });

  it("should handle identical arrays (no changes)", () => {
    const previous = [1, 2, 3];
    const next = [1, 2, 3];
    const result = differenceArray(previous, next);
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
  });

  it("should handle empty arrays", () => {
    const result1 = differenceArray([], []);
    expect(result1.added).toEqual([]);
    expect(result1.removed).toEqual([]);

    const result2 = differenceArray([], [1, 2, 3]);
    expect(result2.added).toEqual([1, 2, 3]);
    expect(result2.removed).toEqual([]);

    const result3 = differenceArray([1, 2, 3], []);
    expect(result3.added).toEqual([]);
    expect(result3.removed).toEqual([1, 2, 3]);
  });

  it("should handle completely different arrays", () => {
    const previous = [1, 2, 3];
    const next = [4, 5, 6];
    const result = differenceArray(previous, next);
    expect(result.added).toEqual([4, 5, 6]);
    expect(result.removed).toEqual([1, 2, 3]);
  });

  it("should preserve original element order in results", () => {
    const previous = ["a", "b", "c", "d"];
    const next = ["d", "e", "f", "a"];
    const result = differenceArray(previous, next);
    // Added elements should appear in order from 'next'
    expect(result.added).toEqual(["e", "f"]);
    // Removed elements should appear in order from 'previous'
    expect(result.removed).toEqual(["b", "c"]);
  });
});

describe("differenceMap", () => {
  it("should detect added entries", () => {
    const previous = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    const next = new Map([
      ["a", 1],
      ["b", 2],
      ["c", 3],
      ["d", 4],
    ]);
    const result = differenceMap(previous, next);
    expect(result.added).toEqual(
      new Map([
        ["c", 3],
        ["d", 4],
      ]),
    );
    expect(result.removed).toEqual(new Map());
    expect(result.updated).toEqual(new Map());
  });

  it("should detect removed entries", () => {
    const previous = new Map([
      ["a", 1],
      ["b", 2],
      ["c", 3],
      ["d", 4],
    ]);
    const next = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    const result = differenceMap(previous, next);
    expect(result.added).toEqual(new Map());
    expect(result.removed).toEqual(
      new Map([
        ["c", 3],
        ["d", 4],
      ]),
    );
    expect(result.updated).toEqual(new Map());
  });

  it("should detect updated values", () => {
    const previous = new Map([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);
    const next = new Map([
      ["a", 10],
      ["b", 2],
      ["c", 30],
    ]);
    const result = differenceMap(previous, next);
    expect(result.added).toEqual(new Map());
    expect(result.removed).toEqual(new Map());
    expect(result.updated).toEqual(
      new Map([
        ["a", [1, 10]],
        ["c", [3, 30]],
      ]),
    );
  });

  it("should detect all three types of changes simultaneously", () => {
    const previous = new Map([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);
    const next = new Map([
      ["a", 10],
      ["c", 3],
      ["d", 4],
    ]);
    const result = differenceMap(previous, next);
    expect(result.added).toEqual(new Map([["d", 4]]));
    expect(result.removed).toEqual(new Map([["b", 2]]));
    expect(result.updated).toEqual(new Map([["a", [1, 10]]]));
  });

  it("should handle identical maps (no changes)", () => {
    const previous = new Map([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);
    const next = new Map([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);
    const result = differenceMap(previous, next);
    expect(result.added).toEqual(new Map());
    expect(result.removed).toEqual(new Map());
    expect(result.updated).toEqual(new Map());
  });

  it("should handle empty maps", () => {
    const result1 = differenceMap(new Map(), new Map());
    expect(result1.added).toEqual(new Map());
    expect(result1.removed).toEqual(new Map());
    expect(result1.updated).toEqual(new Map());

    const result2 = differenceMap(
      new Map(),
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
    );
    expect(result2.added).toEqual(
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
    );
    expect(result2.removed).toEqual(new Map());
    expect(result2.updated).toEqual(new Map());

    const result3 = differenceMap(
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
      new Map(),
    );
    expect(result3.added).toEqual(new Map());
    expect(result3.removed).toEqual(
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
    );
    expect(result3.updated).toEqual(new Map());
  });

  it("should use strict equality for value comparison", () => {
    // Different object instances with same content should be detected as updated
    const obj1 = { x: 1 };
    const obj2 = { x: 1 };
    const previous = new Map([["key", obj1]]);
    const next = new Map([["key", obj2]]);
    const result = differenceMap(previous, next);
    expect(result.added).toEqual(new Map());
    expect(result.removed).toEqual(new Map());
    expect(result.updated).toEqual(new Map([["key", [obj1, obj2]]]));

    // Same object instance should not be detected as updated
    const obj3 = { x: 1 };
    const previous2 = new Map([["key", obj3]]);
    const next2 = new Map([["key", obj3]]);
    const result2 = differenceMap(previous2, next2);
    expect(result2.added).toEqual(new Map());
    expect(result2.removed).toEqual(new Map());
    expect(result2.updated).toEqual(new Map());
  });

  it("should handle maps with object keys", () => {
    const key1 = { id: 1 };
    const key2 = { id: 2 };
    const key3 = { id: 3 };

    const previous = new Map([
      [key1, "value1"],
      [key2, "value2"],
    ]);
    const next = new Map([
      [key1, "updated1"],
      [key3, "value3"],
    ]);
    const result = differenceMap(previous, next);
    expect(result.added).toEqual(new Map([[key3, "value3"]]));
    expect(result.removed).toEqual(new Map([[key2, "value2"]]));
    expect(result.updated).toEqual(new Map([[key1, ["value1", "updated1"]]]));
  });

  it("should handle keys with undefined values correctly", () => {
    const prev = new Map([
      ["a", undefined],
      ["b", 1],
    ]);
    const next = new Map([
      ["a", undefined],
      ["c", 2],
    ]);

    const result = differenceMap(prev, next);

    // "a" should NOT appear in added/removed (same undefined value)
    expect(result.added.size).toBe(1);
    expect(result.added.get("c")).toBe(2);
    expect(result.removed.size).toBe(1);
    expect(result.removed.get("b")).toBe(1);
    expect(result.updated.size).toBe(0);
  });
});
