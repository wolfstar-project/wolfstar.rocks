/* eslint-disable unused-imports/no-unused-vars */
import { describe, expect, it, vi } from "vitest";
import { andMix, asc, bidirectionalReplace, desc, differenceArray, differenceBitField, differenceMap, max, orMix } from "../../../../shared/utils/comparators";

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

describe("bidirectionalReplace", () => {
  it("should process matched and unmatched portions", () => {
    const result = bidirectionalReplace(
      /\d+/g, // Match numbers
      "a123b456c",
      {
        onMatch: (match) => `[${match[0]}]`,
        outMatch: (content, _prev, _next) => content,
      },
    );

    expect(result).toEqual(["a", "[123]", "b", "[456]", "c"]);
  });

  it("should handle content before first match", () => {
    const result = bidirectionalReplace(
      /\d+/g,
      "hello123world",
      {
        onMatch: (match) => `[${match[0]}]`,
        outMatch: (content, _prev, _next) => content,
      },
    );

    expect(result).toEqual(["hello", "[123]", "world"]);
    expect(result[0]).toBe("hello"); // Content before first match
  });

  it("should handle content between matches", () => {
    const result = bidirectionalReplace(
      /\d+/g,
      "a123b456c789d",
      {
        onMatch: (match) => `[${match[0]}]`,
        outMatch: (content, _prev, _next) => content,
      },
    );

    expect(result).toEqual(["a", "[123]", "b", "[456]", "c", "[789]", "d"]);
    expect(result[2]).toBe("b"); // Content between first and second match
    expect(result[4]).toBe("c"); // Content between second and third match
  });

  it("should handle content after last match", () => {
    const result = bidirectionalReplace(
      /\d+/g,
      "123hello",
      {
        onMatch: (match) => `[${match[0]}]`,
        outMatch: (content, _prev, _next) => content,
      },
    );

    expect(result).toEqual(["[123]", "hello"]);
    expect(result[1]).toBe("hello"); // Content after last match
  });

  it("should handle no matches (all outMatch)", () => {
    const onMatchCalls: RegExpExecArray[] = [];
    const outMatchCalls: Array<{ content: string; prev: number; next: number }> = [];

    const result = bidirectionalReplace(
      /\d+/g,
      "abcdef",
      {
        onMatch: (match) => {
          onMatchCalls.push(match);
          return `[${match[0]}]`;
        },
        outMatch: (content, prev, next) => {
          outMatchCalls.push({ content, prev, next });
          return content;
        },
      },
    );

    expect(result).toEqual(["abcdef"]);
    expect(onMatchCalls.length).toBe(0); // No matches
    expect(outMatchCalls.length).toBe(1); // One outMatch for entire string
    expect(outMatchCalls[0]).toEqual({ content: "abcdef", prev: 0, next: 6 });
  });

  it("should handle consecutive matches with no gap", () => {
    // Use /\d/g to match each digit separately (consecutive matches)
    const result = bidirectionalReplace(
      /\d/g,
      "123",
      {
        onMatch: (match) => `[${match[0]}]`,
        outMatch: (content, _prev, _next) => content,
      },
    );

    // Should have 3 consecutive matches with NO outMatch calls
    expect(result).toEqual(["[1]", "[2]", "[3]"]);
    expect(result.length).toBe(3);
  });

  it("should not call outMatch between consecutive matches", () => {
    let outMatchCalls = 0;
    const result = bidirectionalReplace(
      /\d/g,
      "123",
      {
        onMatch: (match) => match[0],
        outMatch: (content, _prev, _next) => {
          outMatchCalls++;
          return content;
        },
      },
    );

    expect(result).toEqual(["1", "2", "3"]);
    expect(outMatchCalls).toBe(0); // No gaps, so outMatch should never be called
  });

  it("should pass correct indices to outMatch", () => {
    const outMatchCalls: Array<{ prev: number; next: number }> = [];

    bidirectionalReplace(
      /\d+/g,
      "a123b456c",
      {
        onMatch: (match) => `[${match[0]}]`,
        outMatch: (content, prev, next) => {
          outMatchCalls.push({ prev, next });
          return content;
        },
      },
    );

    expect(outMatchCalls).toEqual([
      { prev: 0, next: 1 }, // "a" before first match at index 1
      { prev: 4, next: 5 }, // "b" between matches
      { prev: 8, next: 9 }, // "c" after last match
    ]);
  });

  it("should pass correct match groups to onMatch", () => {
    const matches: string[] = [];

    bidirectionalReplace(
      /(\d+)([a-z]+)/g,
      "123abc456def",
      {
        onMatch: (match) => {
          matches.push(match[0]); // Full match
          matches.push(match[1]!); // First capture group (digits)
          matches.push(match[2]!); // Second capture group (letters)
          return match[0];
        },
        outMatch: (content, _prev, _next) => content,
      },
    );

    expect(matches).toEqual([
      "123abc",
      "123",
      "abc",
      "456def",
      "456",
      "def",
    ]);
  });

  it("should preserve order of results", () => {
    const result = bidirectionalReplace<string | number>(
      /\d+/g,
      "a123b456c789d",
      {
        onMatch: (match) => Number.parseInt(match[0], 10),
        outMatch: (content, _prev, _next) => content.toUpperCase(),
      },
    );

    expect(result).toEqual(["A", 123, "B", 456, "C", 789, "D"]);
    expect(result[0]).toBe("A"); // First outMatch
    expect(result[1]).toBe(123); // First onMatch
    expect(result[2]).toBe("B"); // Second outMatch
    expect(result[3]).toBe(456); // Second onMatch
  });

  it("should handle empty string", () => {
    const result = bidirectionalReplace(
      /\d+/g,
      "",
      {
        onMatch: (match) => `[${match[0]}]`,
        outMatch: (content, _prev, _next) => content,
      },
    );

    expect(result).toEqual([]);
  });

  it("should handle pattern that matches entire string", () => {
    const result = bidirectionalReplace(
      /.+/g, // Match entire string
      "hello",
      {
        onMatch: (match) => match[0].toUpperCase(),
        outMatch: (content, _prev, _next) => content,
      },
    );

    expect(result).toEqual(["HELLO"]);
    expect(result.length).toBe(1); // Only onMatch, no outMatch calls
  });

  it("should handle patterns with multiple capture groups", () => {
    const captureGroups: Array<{ full: string; group1: string; group2: string }> = [];

    bidirectionalReplace(
      /(\w+)=(\w+)/g,
      "key1=value1 key2=value2",
      {
        onMatch: (match) => {
          captureGroups.push({
            full: match[0],
            group1: match[1]!,
            group2: match[2]!,
          });
          return match[0];
        },
        outMatch: (content, _prev, _next) => content,
      },
    );

    expect(captureGroups).toEqual([
      { full: "key1=value1", group1: "key1", group2: "value1" },
      { full: "key2=value2", group1: "key2", group2: "value2" },
    ]);
  });

  it("should handle strings that start and end with matches", () => {
    const result = bidirectionalReplace(
      /\d+/g,
      "123abc456",
      {
        onMatch: (match) => `[${match[0]}]`,
        outMatch: (content, _prev, _next) => content,
      },
    );

    expect(result).toEqual(["[123]", "abc", "[456]"]);
    expect(result.length).toBe(3);
  });
});

describe("andMix", () => {
  it("should return true when all functions return true", () => {
    const fn1 = () => true;
    const fn2 = () => true;
    const fn3 = () => true;

    const combined = andMix(fn1, fn2, fn3);
    const result = combined();

    expect(result).toBe(true);
  });

  it("should return false when any function returns false", () => {
    const fn1 = () => true;
    const fn2 = () => false;
    const fn3 = () => true;

    const combined = andMix(fn1, fn2, fn3);
    const result = combined();

    expect(result).toBe(false);
  });

  it("should short-circuit on first false", () => {
    const fn1 = vi.fn((_arg: string) => true);
    const fn2 = vi.fn((_arg: string) => false);
    const fn3 = vi.fn((_arg: string) => true);

    const combined = andMix(fn1, fn2, fn3);
    const result = combined("test");

    expect(result).toBe(false);
    expect(fn1).toHaveBeenCalledWith("test");
    expect(fn2).toHaveBeenCalledWith("test");
    expect(fn3).not.toHaveBeenCalled(); // Short-circuited!
  });

  it("should throw when called with no functions", () => {
    expect(() => andMix()).toThrow(Error);
    expect(() => andMix()).toThrow("You must input at least one function.");
  });

  it("should handle single function", () => {
    const fn = () => true;
    const combined = andMix(fn);

    expect(combined()).toBe(true);

    const fn2 = () => false;
    const combined2 = andMix(fn2);

    expect(combined2()).toBe(false);
  });

  it("should pass arguments correctly to all functions", () => {
    const fn1 = vi.fn((a: number, b: string) => a > 0);
    const fn2 = vi.fn((a: number, b: string) => b.length > 0);
    const fn3 = vi.fn((a: number, b: string) => true);

    const combined = andMix(fn1, fn2, fn3);
    combined(5, "hello");

    expect(fn1).toHaveBeenCalledWith(5, "hello");
    expect(fn2).toHaveBeenCalledWith(5, "hello");
    expect(fn3).toHaveBeenCalledWith(5, "hello");
  });

  it("should preserve type signatures with typed functions", () => {
    type CheckFn = (value: number) => boolean;

    const isPositive: CheckFn = (value) => value > 0;
    const isEven: CheckFn = (value) => value % 2 === 0;
    const isLessThan100: CheckFn = (value) => value < 100;

    const combined = andMix(isPositive, isEven, isLessThan100);

    // Type check: combined should accept number and return boolean
    const result: boolean = combined(42);
    expect(result).toBe(true);

    // Test with value that fails one condition
    expect(combined(3)).toBe(false); // Not even
    expect(combined(-2)).toBe(false); // Not positive
    expect(combined(200)).toBe(false); // Not less than 100
  });
});

describe("orMix", () => {
  it("should return true when any function returns true", () => {
    const fn1 = () => false;
    const fn2 = () => true;
    const fn3 = () => false;

    const combined = orMix(fn1, fn2, fn3);
    const result = combined();

    expect(result).toBe(true);
  });

  it("should return false when all functions return false", () => {
    const fn1 = () => false;
    const fn2 = () => false;
    const fn3 = () => false;

    const combined = orMix(fn1, fn2, fn3);
    const result = combined();

    expect(result).toBe(false);
  });

  it("should short-circuit on first true", () => {
    const fn1 = vi.fn((_arg: string) => false);
    const fn2 = vi.fn((_arg: string) => true);
    const fn3 = vi.fn((_arg: string) => false);

    const combined = orMix(fn1, fn2, fn3);
    const result = combined("test");

    expect(result).toBe(true);
    expect(fn1).toHaveBeenCalledWith("test");
    expect(fn2).toHaveBeenCalledWith("test");
    expect(fn3).not.toHaveBeenCalled(); // Short-circuited!
  });

  it("should throw when called with no functions", () => {
    expect(() => orMix()).toThrow(Error);
    expect(() => orMix()).toThrow("You must input at least one function.");
  });

  it("should handle single function", () => {
    const fn = () => true;
    const combined = orMix(fn);

    expect(combined()).toBe(true);

    const fn2 = () => false;
    const combined2 = orMix(fn2);

    expect(combined2()).toBe(false);
  });

  it("should pass arguments correctly to all functions", () => {
    const fn1 = vi.fn((a: number, _b: string) => a < 0);
    const fn2 = vi.fn((_a: number, b: string) => b.length === 0);
    const fn3 = vi.fn((a: number, _b: string) => a > 100);

    const combined = orMix(fn1, fn2, fn3);
    combined(5, "hello");

    expect(fn1).toHaveBeenCalledWith(5, "hello");
    expect(fn2).toHaveBeenCalledWith(5, "hello");
    expect(fn3).toHaveBeenCalledWith(5, "hello");
  });

  it("should preserve type signatures with typed functions", () => {
    type CheckFn = (value: number) => boolean;

    const isNegative: CheckFn = (value) => value < 0;
    const isOdd: CheckFn = (value) => value % 2 !== 0;
    const isGreaterThan100: CheckFn = (value) => value > 100;

    const combined = orMix(isNegative, isOdd, isGreaterThan100);

    // Type check: combined should accept number and return boolean
    const result: boolean = combined(3);
    expect(result).toBe(true); // 3 is odd

    // Test with value that passes one condition
    expect(combined(3)).toBe(true); // Odd
    expect(combined(-2)).toBe(true); // Negative
    expect(combined(200)).toBe(true); // Greater than 100
    expect(combined(-5)).toBe(true); // Negative and odd
    expect(combined(42)).toBe(false); // Positive, even, not > 100
  });
});
