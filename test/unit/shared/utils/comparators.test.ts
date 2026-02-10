import { describe, expect, it, vi } from "vitest";
import {
	andMix,
	asc,
	bidirectionalReplace,
	desc,
	differenceArray,
	differenceBitField,
	differenceMap,
	max,
	orMix,
} from "../../../../shared/utils/comparators";

describe(asc, () => {
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
		expect(asc(1n, 2n)).toBe(-1);
		expect(asc(2n, 1n)).toBe(1);
		expect(asc(100n, 100n)).toBe(0);
		expect(asc(BigInt(-10), 5n)).toBe(-1);
		expect(asc(5n, BigInt(-10))).toBe(1);
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

describe(desc, () => {
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
		expect(desc(1n, 2n)).toBe(1);
		expect(desc(2n, 1n)).toBe(-1);
		expect(desc(100n, 100n)).toBe(0);
		expect(desc(BigInt(-10), 5n)).toBe(1);
		expect(desc(5n, BigInt(-10))).toBe(-1);
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

describe(max, () => {
	it("should return maximum from multiple number values", () => {
		expect(max(1, 2, 3, 4, 5)).toBe(5);
		expect(max(10, 5, 8, 3, 12)).toBe(12);
		expect(max(100, 200, 50)).toBe(200);
		expect(max(7, 2, 9, 1, 15, 6)).toBe(15);
	});

	it("should return maximum from array of bigints", () => {
		expect(max(1n, 2n, 3n)).toBe(3n);
		expect(max(100n, 500n, 250n)).toBe(500n);
		expect(max(10n, 5n, 20n, 15n)).toBe(20n);
	});

	it("should handle single value", () => {
		expect(max(42)).toBe(42);
		expect(max(0)).toBe(0);
		expect(max(-5)).toBe(-5);
		expect(max(123n)).toBe(123n);
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
		const largeArray = Array.from({ length: 10_000 }, (_, i) => (i % 1000) + 1);
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
		expect(max(5n, 5n)).toBe(5n);
	});
});

describe(differenceBitField, () => {
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

describe(differenceArray, () => {
	it("should detect added elements", () => {
		const previous = [1, 2, 3];
		const next = [1, 2, 3, 4, 5];
		const result = differenceArray(previous, next);
		expect(result.added).toStrictEqual([4, 5]);
		expect(result.removed).toStrictEqual([]);
	});

	it("should detect removed elements", () => {
		const previous = [1, 2, 3, 4, 5];
		const next = [1, 2, 3];
		const result = differenceArray(previous, next);
		expect(result.added).toStrictEqual([]);
		expect(result.removed).toStrictEqual([4, 5]);
	});

	it("should detect both added and removed elements", () => {
		const previous = [1, 2, 3];
		const next = [3, 4, 5];
		const result = differenceArray(previous, next);
		expect(result.added).toStrictEqual([4, 5]);
		expect(result.removed).toStrictEqual([1, 2]);
	});

	it("should handle identical arrays (no changes)", () => {
		const previous = [1, 2, 3];
		const next = [1, 2, 3];
		const result = differenceArray(previous, next);
		expect(result.added).toStrictEqual([]);
		expect(result.removed).toStrictEqual([]);
	});

	it("should handle empty arrays", () => {
		const result1 = differenceArray([], []);
		expect(result1.added).toStrictEqual([]);
		expect(result1.removed).toStrictEqual([]);

		const result2 = differenceArray([], [1, 2, 3]);
		expect(result2.added).toStrictEqual([1, 2, 3]);
		expect(result2.removed).toStrictEqual([]);

		const result3 = differenceArray([1, 2, 3], []);
		expect(result3.added).toStrictEqual([]);
		expect(result3.removed).toStrictEqual([1, 2, 3]);
	});

	it("should handle completely different arrays", () => {
		const previous = [1, 2, 3];
		const next = [4, 5, 6];
		const result = differenceArray(previous, next);
		expect(result.added).toStrictEqual([4, 5, 6]);
		expect(result.removed).toStrictEqual([1, 2, 3]);
	});

	it("should preserve original element order in results", () => {
		const previous = ["a", "b", "c", "d"];
		const next = ["d", "e", "f", "a"];
		const result = differenceArray(previous, next);
		// Added elements should appear in order from 'next'
		expect(result.added).toStrictEqual(["e", "f"]);
		// Removed elements should appear in order from 'previous'
		expect(result.removed).toStrictEqual(["b", "c"]);
	});
});

describe(differenceMap, () => {
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
		expect(result.added).toStrictEqual(
			new Map([
				["c", 3],
				["d", 4],
			]),
		);
		expect(result.removed).toStrictEqual(new Map());
		expect(result.updated).toStrictEqual(new Map());
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
		expect(result.added).toStrictEqual(new Map());
		expect(result.removed).toStrictEqual(
			new Map([
				["c", 3],
				["d", 4],
			]),
		);
		expect(result.updated).toStrictEqual(new Map());
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
		expect(result.added).toStrictEqual(new Map());
		expect(result.removed).toStrictEqual(new Map());
		expect(result.updated).toStrictEqual(
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
		expect(result.added).toStrictEqual(new Map([["d", 4]]));
		expect(result.removed).toStrictEqual(new Map([["b", 2]]));
		expect(result.updated).toStrictEqual(new Map([["a", [1, 10]]]));
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
		expect(result.added).toStrictEqual(new Map());
		expect(result.removed).toStrictEqual(new Map());
		expect(result.updated).toStrictEqual(new Map());
	});

	it("should handle empty maps", () => {
		const result1 = differenceMap(new Map(), new Map());
		expect(result1.added).toStrictEqual(new Map());
		expect(result1.removed).toStrictEqual(new Map());
		expect(result1.updated).toStrictEqual(new Map());

		const result2 = differenceMap(
			new Map(),
			new Map([
				["a", 1],
				["b", 2],
			]),
		);
		expect(result2.added).toStrictEqual(
			new Map([
				["a", 1],
				["b", 2],
			]),
		);
		expect(result2.removed).toStrictEqual(new Map());
		expect(result2.updated).toStrictEqual(new Map());

		const result3 = differenceMap(
			new Map([
				["a", 1],
				["b", 2],
			]),
			new Map(),
		);
		expect(result3.added).toStrictEqual(new Map());
		expect(result3.removed).toStrictEqual(
			new Map([
				["a", 1],
				["b", 2],
			]),
		);
		expect(result3.updated).toStrictEqual(new Map());
	});

	it("should use strict equality for value comparison", () => {
		// Different object instances with same content should be detected as updated
		const obj1 = { x: 1 };
		const obj2 = { x: 1 };
		const previous = new Map([["key", obj1]]);
		const next = new Map([["key", obj2]]);
		const result = differenceMap(previous, next);
		expect(result.added).toStrictEqual(new Map());
		expect(result.removed).toStrictEqual(new Map());
		expect(result.updated).toStrictEqual(new Map([["key", [obj1, obj2]]]));

		// Same object instance should not be detected as updated
		const obj3 = { x: 1 };
		const previous2 = new Map([["key", obj3]]);
		const next2 = new Map([["key", obj3]]);
		const result2 = differenceMap(previous2, next2);
		expect(result2.added).toStrictEqual(new Map());
		expect(result2.removed).toStrictEqual(new Map());
		expect(result2.updated).toStrictEqual(new Map());
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
		expect(result.added).toStrictEqual(new Map([[key3, "value3"]]));
		expect(result.removed).toStrictEqual(new Map([[key2, "value2"]]));
		expect(result.updated).toStrictEqual(new Map([[key1, ["value1", "updated1"]]]));
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

describe(bidirectionalReplace, () => {
	it("should process matched and unmatched portions", () => {
		const result = bidirectionalReplace(
			/\d+/g, // Match numbers
			"a123b456c",
			{
				onMatch: (match) => `[${match[0]}]`,
				outMatch: (content, _prev, _next) => content,
			},
		);

		expect(result).toStrictEqual(["a", "[123]", "b", "[456]", "c"]);
	});

	it("should handle content before first match", () => {
		const result = bidirectionalReplace(/\d+/g, "hello123world", {
			onMatch: (match) => `[${match[0]}]`,
			outMatch: (content, _prev, _next) => content,
		});

		expect(result).toStrictEqual(["hello", "[123]", "world"]);
		expect(result[0]).toBe("hello"); // Content before first match
	});

	it("should handle content between matches", () => {
		const result = bidirectionalReplace(/\d+/g, "a123b456c789d", {
			onMatch: (match) => `[${match[0]}]`,
			outMatch: (content, _prev, _next) => content,
		});

		expect(result).toStrictEqual(["a", "[123]", "b", "[456]", "c", "[789]", "d"]);
		expect(result[2]).toBe("b"); // Content between first and second match
		expect(result[4]).toBe("c"); // Content between second and third match
	});

	it("should handle content after last match", () => {
		const result = bidirectionalReplace(/\d+/g, "123hello", {
			onMatch: (match) => `[${match[0]}]`,
			outMatch: (content, _prev, _next) => content,
		});

		expect(result).toStrictEqual(["[123]", "hello"]);
		expect(result[1]).toBe("hello"); // Content after last match
	});

	it("should handle no matches (all outMatch)", () => {
		const onMatchCalls: RegExpExecArray[] = [];
		const outMatchCalls: { content: string; prev: number; next: number }[] = [];

		const result = bidirectionalReplace(/\d+/g, "abcdef", {
			onMatch: (match) => {
				onMatchCalls.push(match);
				return `[${match[0]}]`;
			},
			outMatch: (content, prev, next) => {
				outMatchCalls.push({ content, next, prev });
				return content;
			},
		});

		expect(result).toStrictEqual(["abcdef"]);
		expect(onMatchCalls).toHaveLength(0); // No matches
		expect(outMatchCalls).toHaveLength(1); // One outMatch for entire string
		expect(outMatchCalls[0]).toStrictEqual({ content: "abcdef", next: 6, prev: 0 });
	});

	it("should handle consecutive matches with no gap", () => {
		// Use /\d/g to match each digit separately (consecutive matches)
		const result = bidirectionalReplace(/\d/g, "123", {
			onMatch: (match) => `[${match[0]}]`,
			outMatch: (content, _prev, _next) => content,
		});

		// Should have 3 consecutive matches with NO outMatch calls
		expect(result).toStrictEqual(["[1]", "[2]", "[3]"]);
		expect(result).toHaveLength(3);
	});

	it("should not call outMatch between consecutive matches", () => {
		let outMatchCalls = 0;
		const result = bidirectionalReplace(/\d/g, "123", {
			onMatch: (match) => match[0],
			outMatch: (content, _prev, _next) => {
				outMatchCalls++;
				return content;
			},
		});

		expect(result).toStrictEqual(["1", "2", "3"]);
		expect(outMatchCalls).toBe(0); // No gaps, so outMatch should never be called
	});

	it("should pass correct indices to outMatch", () => {
		const outMatchCalls: { prev: number; next: number }[] = [];

		bidirectionalReplace(/\d+/g, "a123b456c", {
			onMatch: (match) => `[${match[0]}]`,
			outMatch: (content, prev, next) => {
				outMatchCalls.push({ next, prev });
				return content;
			},
		});

		expect(outMatchCalls).toStrictEqual([
			{ next: 1, prev: 0 }, // "a" before first match at index 1
			{ next: 5, prev: 4 }, // "b" between matches
			{ next: 9, prev: 8 }, // "c" after last match
		]);
	});

	it("should pass correct match groups to onMatch", () => {
		const matches: string[] = [];

		bidirectionalReplace(/(\d+)([a-z]+)/g, "123abc456def", {
			onMatch: (match) => {
				matches.push(match[0]); // Full match
				matches.push(match[1]!); // First capture group (digits)
				matches.push(match[2]!); // Second capture group (letters)
				return match[0];
			},
			outMatch: (content, _prev, _next) => content,
		});

		expect(matches).toStrictEqual(["123abc", "123", "abc", "456def", "456", "def"]);
	});

	it("should preserve order of results", () => {
		const result = bidirectionalReplace<string | number>(/\d+/g, "a123b456c789d", {
			onMatch: (match) => Number.parseInt(match[0], 10),
			outMatch: (content, _prev, _next) => content.toUpperCase(),
		});

		expect(result).toStrictEqual(["A", 123, "B", 456, "C", 789, "D"]);
		expect(result[0]).toBe("A"); // First outMatch
		expect(result[1]).toBe(123); // First onMatch
		expect(result[2]).toBe("B"); // Second outMatch
		expect(result[3]).toBe(456); // Second onMatch
	});

	it("should handle empty string", () => {
		const result = bidirectionalReplace(/\d+/g, "", {
			onMatch: (match) => `[${match[0]}]`,
			outMatch: (content, _prev, _next) => content,
		});

		expect(result).toStrictEqual([]);
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

		expect(result).toStrictEqual(["HELLO"]);
		expect(result).toHaveLength(1); // Only onMatch, no outMatch calls
	});

	it("should handle patterns with multiple capture groups", () => {
		const captureGroups: { full: string; group1: string; group2: string }[] = [];

		bidirectionalReplace(/(\w+)=(\w+)/g, "key1=value1 key2=value2", {
			onMatch: (match) => {
				captureGroups.push({
					full: match[0],
					group1: match[1]!,
					group2: match[2]!,
				});
				return match[0];
			},
			outMatch: (content, _prev, _next) => content,
		});

		expect(captureGroups).toStrictEqual([
			{ full: "key1=value1", group1: "key1", group2: "value1" },
			{ full: "key2=value2", group1: "key2", group2: "value2" },
		]);
	});

	it("should handle strings that start and end with matches", () => {
		const result = bidirectionalReplace(/\d+/g, "123abc456", {
			onMatch: (match) => `[${match[0]}]`,
			outMatch: (content, _prev, _next) => content,
		});

		expect(result).toStrictEqual(["[123]", "abc", "[456]"]);
		expect(result).toHaveLength(3);
	});
});

describe(andMix, () => {
	it("should return true when all functions return true", () => {
		const fn1 = () => true;
		const fn2 = () => true;
		const fn3 = () => true;

		const combined = andMix(fn1, fn2, fn3);
		const result = combined();

		expect(result).toBeTruthy();
	});

	it("should return false when any function returns false", () => {
		const fn1 = () => true;
		const fn2 = () => false;
		const fn3 = () => true;

		const combined = andMix(fn1, fn2, fn3);
		const result = combined();

		expect(result).toBeFalsy();
	});

	it("should short-circuit on first false", () => {
		const fn1 = vi.fn((_arg: string) => true);
		const fn2 = vi.fn((_arg: string) => false);
		const fn3 = vi.fn((_arg: string) => true);

		const combined = andMix(fn1, fn2, fn3);
		const result = combined("test");

		expect(result).toBeFalsy();
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

		expect(combined()).toBeTruthy();

		const fn2 = () => false;
		const combined2 = andMix(fn2);

		expect(combined2()).toBeFalsy();
	});

	it("should pass arguments correctly to all functions", () => {
		const fn1 = vi.fn((a: number, _b: string) => a > 0);
		const fn2 = vi.fn((_a: number, b: string) => b.length > 0);
		const fn3 = vi.fn((_a: number, _b: string) => true);

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
		expect(result).toBeTruthy();

		// Test with value that fails one condition
		expect(combined(3)).toBeFalsy(); // Not even
		expect(combined(-2)).toBeFalsy(); // Not positive
		expect(combined(200)).toBeFalsy(); // Not less than 100
	});
});

describe(orMix, () => {
	it("should return true when any function returns true", () => {
		const fn1 = () => false;
		const fn2 = () => true;
		const fn3 = () => false;

		const combined = orMix(fn1, fn2, fn3);
		const result = combined();

		expect(result).toBeTruthy();
	});

	it("should return false when all functions return false", () => {
		const fn1 = () => false;
		const fn2 = () => false;
		const fn3 = () => false;

		const combined = orMix(fn1, fn2, fn3);
		const result = combined();

		expect(result).toBeFalsy();
	});

	it("should short-circuit on first true", () => {
		const fn1 = vi.fn((_arg: string) => false);
		const fn2 = vi.fn((_arg: string) => true);
		const fn3 = vi.fn((_arg: string) => false);

		const combined = orMix(fn1, fn2, fn3);
		const result = combined("test");

		expect(result).toBeTruthy();
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

		expect(combined()).toBeTruthy();

		const fn2 = () => false;
		const combined2 = orMix(fn2);

		expect(combined2()).toBeFalsy();
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
		expect(result).toBeTruthy(); // 3 is odd

		// Test with value that passes one condition
		expect(combined(3)).toBeTruthy(); // Odd
		expect(combined(-2)).toBeTruthy(); // Negative
		expect(combined(200)).toBeTruthy(); // Greater than 100
		expect(combined(-5)).toBeTruthy(); // Negative and odd
		expect(combined(42)).toBeFalsy(); // Positive, even, not > 100
	});
});

describe("integration tests", () => {
	/**
	 * Integration test: Sorting with max() and asc/desc comparators
	 * Validates that sorting functions work correctly with max() utility
	 * Real-world scenario: Finding maximum value in sorted/unsorted arrays
	 */
	it("should correctly combine sorting comparators with max utility", () => {
		const numbers = [42, 7, 23, 91, 15, 68, 3];

		// Sort ascending and verify max is at the end
		const sortedAsc = [...numbers].toSorted(asc);
		expect(sortedAsc).toStrictEqual([3, 7, 15, 23, 42, 68, 91]);
		expect(sortedAsc[sortedAsc.length - 1]).toBe(max(...numbers));
		expect(max(...sortedAsc)).toBe(91);

		// Sort descending and verify max is at the start
		const sortedDesc = [...numbers].toSorted(desc);
		expect(sortedDesc).toStrictEqual([91, 68, 42, 23, 15, 7, 3]);
		expect(sortedDesc[0]).toBe(max(...numbers));
		expect(max(...sortedDesc)).toBe(91);

		// Verify max works on sorted and unsorted arrays identically
		expect(max(...numbers)).toBe(max(...sortedAsc));
		expect(max(...numbers)).toBe(max(...sortedDesc));
	});

	/**
	 * Integration test: Complex difference detection with Maps and boolean combinators
	 * Validates differenceMap working with complex nested objects and andMix validation
	 * Real-world scenario: Configuration management system tracking changes with validation rules
	 */
	it("should detect and validate complex map changes with predicate composition", () => {
		// Simulate guild configuration objects
		interface GuildConfig {
			enabled: boolean;
			threshold: number;
			channels: string[];
		}

		const loggingConfig = { channels: ["admin", "audit"], enabled: true, threshold: 10 };

		const previousConfig = new Map<string, GuildConfig>([
			["moderation", { channels: ["mod-log"], enabled: true, threshold: 5 }],
			["automod", { channels: ["general"], enabled: false, threshold: 3 }],
			["logging", loggingConfig], // Use same reference
		]);

		const nextConfig = new Map<string, GuildConfig>([
			["moderation", { channels: ["mod-log"], enabled: true, threshold: 10 }], // Updated threshold
			["logging", loggingConfig], // Same reference - no change detected
			["welcome", { channels: ["welcome"], enabled: true, threshold: 1 }], // Added
		]);

		const diff = differenceMap(previousConfig, nextConfig);

		// Verify additions
		expect(diff.added.size).toBe(1);
		expect(diff.added.has("welcome")).toBeTruthy();
		expect(diff.added.get("welcome")).toStrictEqual({
			channels: ["welcome"],
			enabled: true,
			threshold: 1,
		});

		// Verify removals
		expect(diff.removed.size).toBe(1);
		expect(diff.removed.has("automod")).toBeTruthy();

		// Verify updates
		expect(diff.updated.size).toBe(1);
		expect(diff.updated.has("moderation")).toBeTruthy();

		// Use andMix to validate that updated configs meet criteria
		const isEnabled = (cfg: GuildConfig) => cfg.enabled;
		const hasHighThreshold = (cfg: GuildConfig) => cfg.threshold >= 5;
		const hasChannels = (cfg: GuildConfig) => cfg.channels.length > 0;

		const validateConfig = andMix(isEnabled, hasHighThreshold, hasChannels);

		// Validate the updated moderation config
		const [, nextMod] = diff.updated.get("moderation")!;
		expect(validateConfig(nextMod)).toBeTruthy();

		// Validate added welcome config fails threshold check
		const welcomeConfig = diff.added.get("welcome")!;
		expect(validateConfig(welcomeConfig)).toBeFalsy(); // Threshold is 1, not >= 5
	});

	/**
	 * Integration test: Regex processing with bidirectionalReplace and transformations
	 * Validates bidirectionalReplace in a real text processing scenario
	 * Real-world scenario: Discord message parsing with mention replacement and text formatting
	 */
	it("should process complex text with bidirectionalReplace and apply transformations", () => {
		// Simulate Discord message with user mentions
		const message = "Hey <@123456>, check out <@789012> for the updates!";

		// Process mentions and text separately
		const result = bidirectionalReplace<string>(/<@(\d+)>/g, message, {
			onMatch: (match) => {
				const userId = match[1]!;
				// Simulate user lookup and format as @Username
				const userMap = new Map([
					["123456", "Alice"],
					["789012", "Bob"],
				]);
				return `@${userMap.get(userId) ?? "Unknown"}`;
			},
			outMatch: (content) => content.trim(),
		});

		expect(result).toStrictEqual(["Hey", "@Alice", ", check out", "@Bob", "for the updates!"]);

		// Combine results and verify the final message
		const processedMessage = result.join(" ");
		expect(processedMessage).toBe("Hey @Alice , check out @Bob for the updates!");

		// Use differenceArray to track which users were mentioned
		const originalMentions = ["123456", "789012"];
		const newMentions = ["123456", "789012", "456789"];
		const mentionDiff = differenceArray(originalMentions, newMentions);

		expect(mentionDiff.added).toStrictEqual(["456789"]);
		expect(mentionDiff.removed).toStrictEqual([]);
	});

	/**
	 * Integration test: Complex predicate composition with andMix and orMix
	 * Validates boolean combinators for complex validation logic
	 * Real-world scenario: User permission checking with multiple criteria
	 */
	it("should compose complex predicates for multi-criteria validation", () => {
		interface User {
			id: string;
			age: number;
			roles: string[];
			verified: boolean;
		}

		const users: User[] = [
			{ age: 25, id: "1", roles: ["admin", "moderator"], verified: true },
			{ age: 17, id: "2", roles: ["member"], verified: true },
			{ age: 30, id: "3", roles: ["moderator"], verified: false },
			{ age: 22, id: "4", roles: ["vip", "member"], verified: true },
		];

		// Create individual validation predicates
		const isAdult = (user: User) => user.age >= 18;
		const isVerified = (user: User) => user.verified;
		const hasModeratorRole = (user: User) => user.roles.includes("moderator");
		const hasAdminRole = (user: User) => user.roles.includes("admin");

		// Compose: Can moderate = (adult AND verified AND (moderator OR admin))
		const hasStaffRole = orMix(hasModeratorRole, hasAdminRole);
		const canModerate = andMix(isAdult, isVerified, hasStaffRole);

		// Test each user
		expect(canModerate(users[0]!)).toBeTruthy(); // Adult, verified, admin+moderator
		expect(canModerate(users[1]!)).toBeFalsy(); // Minor (age 17)
		expect(canModerate(users[2]!)).toBeFalsy(); // Not verified
		expect(canModerate(users[3]!)).toBeFalsy(); // No staff role

		// Filter users who can moderate
		const moderators = users.filter(canModerate);
		expect(moderators).toHaveLength(1);
		expect(moderators[0]!.id).toBe("1");

		// Alternative: Can participate = (adult OR verified)
		const canParticipate = orMix(isAdult, isVerified);
		const participants = users.filter(canParticipate);
		expect(participants).toHaveLength(4); // All users can participate
	});

	/**
	 * Integration test: Real-world workflow simulation combining multiple functions
	 * Validates end-to-end data processing pipeline using multiple comparator utilities
	 * Real-world scenario: Guild settings migration with validation and change tracking
	 */
	it("should handle complete data processing workflow with multiple utilities", () => {
		// Initial guild roles with bitfield permissions
		interface Role {
			id: string;
			name: string;
			permissions: number;
		}

		const adminRole = { id: "role1", name: "Admin", permissions: 0b1111 };

		const previousRoles = new Map<string, Role>([
			["role1", adminRole], // Use same reference
			["role2", { id: "role2", name: "Mod", permissions: 0b0111 }],
			["role3", { id: "role3", name: "Member", permissions: 0b0001 }],
		]);

		const nextRoles = new Map<string, Role>([
			["role1", adminRole], // Same reference - no change detected
			["role2", { id: "role2", name: "Moderator", permissions: 0b1111 }], // Name changed + permissions updated
			["role4", { id: "role4", name: "VIP", permissions: 0b0011 }], // New role
		]);

		// Step 1: Detect role changes
		const roleDiff = differenceMap(previousRoles, nextRoles);

		expect(roleDiff.added.size).toBe(1);
		expect(roleDiff.updated.size).toBe(1);
		expect(roleDiff.removed.size).toBe(1);

		// Step 2: Analyze permission changes for updated roles
		const [prevMod, nextMod] = roleDiff.updated.get("role2")!;
		const permissionDiff = differenceBitField(prevMod.permissions, nextMod.permissions);

		expect(permissionDiff.added).toBe(0b1000); // Added bit at position 3
		expect(permissionDiff.removed).toBe(0);

		// Step 3: Collect all role IDs and find the lexicographically maximum ID
		const allRoleIds = [...nextRoles.keys()];
		// Use sorting instead of max() since role IDs are strings
		const sortedIds = allRoleIds.toSorted(desc);
		const maxRoleId = sortedIds[0]; // First element after desc sort is the max
		expect(maxRoleId).toBe("role4"); // Lexicographically maximum

		// Step 4: Validate new roles with predicate composition
		const hasBasicPermissions = (role: Role) => (role.permissions & 0b0001) !== 0;
		const hasElevatedPermissions = (role: Role) => (role.permissions & 0b1000) !== 0;
		const isValidRole = (role: Role) => role.name.length > 0 && role.id.startsWith("role");

		const isFullyPrivilegedRole = andMix(isValidRole, hasBasicPermissions, hasElevatedPermissions);

		// Test roles
		expect(isFullyPrivilegedRole(nextRoles.get("role1")!)).toBeTruthy(); // Admin
		expect(isFullyPrivilegedRole(nextRoles.get("role2")!)).toBeTruthy(); // Moderator (updated)
		expect(isFullyPrivilegedRole(nextRoles.get("role4")!)).toBeFalsy(); // VIP (no elevated perms)

		// Step 5: Generate audit log using bidirectionalReplace for formatting
		const auditTemplate = "Roles changed: added=[role4], removed=[role3], updated=[role2]";
		const formattedAudit = bidirectionalReplace<string>(/\[(\w+)\]/g, auditTemplate, {
			onMatch: (match) => `"${match[1]}"`,
			outMatch: (content) => content,
		});

		const finalAudit = formattedAudit.join("");
		expect(finalAudit).toBe('Roles changed: added="role4", removed="role3", updated="role2"');
	});
});
