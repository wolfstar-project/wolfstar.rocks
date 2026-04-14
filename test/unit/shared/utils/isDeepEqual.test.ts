import { isDeepEqual } from "#shared/utils/isDeepEqual";
import { describe, expect, it, vi } from "vitest";

describe("isDeepEqual", () => {
	describe("primitives", () => {
		it("should return true for identical numbers", () => {
			expect(isDeepEqual(1, 1)).toBe(true);
			expect(isDeepEqual(0, 0)).toBe(true);
			expect(isDeepEqual(-1, -1)).toBe(true);
		});

		it("should return false for different numbers", () => {
			expect(isDeepEqual(1, 2)).toBe(false);
		});

		it("should treat 0 and -0 as not equal (Object.is semantics)", () => {
			expect(isDeepEqual(0, -0)).toBe(false);
		});

		it("should handle NaN correctly via Object.is", () => {
			expect(isDeepEqual(Number.NaN, Number.NaN)).toBe(true);
		});

		it("should return true for identical strings", () => {
			expect(isDeepEqual("hello", "hello")).toBe(true);
			expect(isDeepEqual("", "")).toBe(true);
		});

		it("should return false for different strings", () => {
			expect(isDeepEqual("hello", "world")).toBe(false);
		});

		it("should return true for identical booleans", () => {
			expect(isDeepEqual(true, true)).toBe(true);
			expect(isDeepEqual(false, false)).toBe(true);
		});

		it("should return false for different booleans", () => {
			expect(isDeepEqual(true, false)).toBe(false);
		});

		it("should handle null and undefined", () => {
			expect(isDeepEqual(null, null)).toBe(true);
			expect(isDeepEqual(undefined, undefined)).toBe(true);
			expect(isDeepEqual(null, undefined)).toBe(false);
			expect(isDeepEqual(undefined, null)).toBe(false);
		});

		it("should return false for mismatched types", () => {
			expect(isDeepEqual(1, "1")).toBe(false);
			expect(isDeepEqual(0, false)).toBe(false);
			expect(isDeepEqual("", false)).toBe(false);
			expect(isDeepEqual(null, 0)).toBe(false);
		});

		it("should handle bigints", () => {
			expect(isDeepEqual(1n, 1n)).toBe(true);
			expect(isDeepEqual(1n, 2n)).toBe(false);
		});

		it("should handle symbols", () => {
			const sym = Symbol("test");
			expect(isDeepEqual(sym, sym)).toBe(true);
			expect(isDeepEqual(Symbol("a"), Symbol("a"))).toBe(false);
		});
	});

	describe("plain objects", () => {
		it("should return true for equal empty objects", () => {
			expect(isDeepEqual({}, {})).toBe(true);
		});

		it("should return true for equal flat objects", () => {
			expect(isDeepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
		});

		it("should return false when keys differ", () => {
			expect(isDeepEqual({ a: 1 }, { b: 1 })).toBe(false);
		});

		it("should return false when values differ", () => {
			expect(isDeepEqual({ a: 1 }, { a: 2 })).toBe(false);
		});

		it("should return false for different key counts", () => {
			expect(isDeepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
		});

		it("should compare nested objects deeply", () => {
			expect(isDeepEqual({ a: { b: { c: 3 } } }, { a: { b: { c: 3 } } })).toBe(true);
			expect(isDeepEqual({ a: { b: { c: 3 } } }, { a: { b: { c: 4 } } })).toBe(false);
		});

		it("should return false for object vs non-object", () => {
			expect(isDeepEqual({ a: 1 }, null)).toBe(false);
			expect(isDeepEqual(null, { a: 1 })).toBe(false);
			expect(isDeepEqual({ a: 1 }, 1)).toBe(false);
		});
	});

	describe("arrays", () => {
		it("should return true for equal empty arrays", () => {
			expect(isDeepEqual([], [])).toBe(true);
		});

		it("should return true for equal arrays", () => {
			expect(isDeepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
		});

		it("should return false for different length arrays", () => {
			expect(isDeepEqual([1, 2], [1, 2, 3])).toBe(false);
		});

		it("should return false for different elements", () => {
			expect(isDeepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
		});

		it("should compare nested arrays deeply", () => {
			expect(isDeepEqual([[1, 2], [3]], [[1, 2], [3]])).toBe(true);
			expect(isDeepEqual([[1, 2], [3]], [[1, 2], [4]])).toBe(false);
		});

		it("should return false for array vs non-array object", () => {
			expect(isDeepEqual([1], { 0: 1, length: 1 })).toBe(false);
		});
	});

	describe("Date", () => {
		it("should return true for equal dates", () => {
			const d1 = new Date("2024-01-01");
			const d2 = new Date("2024-01-01");
			expect(isDeepEqual(d1, d2)).toBe(true);
		});

		it("should return false for different dates", () => {
			const d1 = new Date("2024-01-01");
			const d2 = new Date("2024-01-02");
			expect(isDeepEqual(d1, d2)).toBe(false);
		});

		it("should return false for invalid dates (NaN timestamps are not equal)", () => {
			expect(isDeepEqual(new Date("invalid"), new Date("invalid"))).toBe(false);
		});
	});

	describe("RegExp", () => {
		it("should return true for equal regexps", () => {
			expect(isDeepEqual(/abc/gi, /abc/gi)).toBe(true);
		});

		it("should return false for different patterns", () => {
			expect(isDeepEqual(/abc/, /def/)).toBe(false);
		});

		it("should return false for different flags", () => {
			expect(isDeepEqual(/abc/g, /abc/i)).toBe(false);
		});
	});

	describe("Map", () => {
		it("should return true for equal maps", () => {
			const m1 = new Map([
				["a", 1],
				["b", 2],
			]);
			const m2 = new Map([
				["a", 1],
				["b", 2],
			]);
			expect(isDeepEqual(m1, m2)).toBe(true);
		});

		it("should return false for maps with different sizes", () => {
			const m1 = new Map([["a", 1]]);
			const m2 = new Map([
				["a", 1],
				["b", 2],
			]);
			expect(isDeepEqual(m1, m2)).toBe(false);
		});

		it("should return false for maps with different values", () => {
			const m1 = new Map([["a", 1]]);
			const m2 = new Map([["a", 2]]);
			expect(isDeepEqual(m1, m2)).toBe(false);
		});

		it("should return false for maps with different keys", () => {
			const m1 = new Map([["a", 1]]);
			const m2 = new Map([["b", 1]]);
			expect(isDeepEqual(m1, m2)).toBe(false);
		});

		it("should handle maps with object keys deeply", () => {
			const key1 = { id: 1 };
			const key2 = { id: 1 };
			const m1 = new Map([[key1, "value"]]);
			const m2 = new Map([[key2, "value"]]);
			expect(isDeepEqual(m1, m2)).toBe(true);
		});

		it("should return false for map vs non-map", () => {
			expect(isDeepEqual(new Map(), {})).toBe(false);
		});
	});

	describe("Set", () => {
		it("should return true for equal sets", () => {
			const s1 = new Set([1, 2, 3]);
			const s2 = new Set([1, 2, 3]);
			expect(isDeepEqual(s1, s2)).toBe(true);
		});

		it("should return false for sets with different sizes", () => {
			const s1 = new Set([1, 2]);
			const s2 = new Set([1, 2, 3]);
			expect(isDeepEqual(s1, s2)).toBe(false);
		});

		it("should return false for sets with different values", () => {
			const s1 = new Set([1, 2, 3]);
			const s2 = new Set([1, 2, 4]);
			expect(isDeepEqual(s1, s2)).toBe(false);
		});

		it("should handle sets with object values deeply", () => {
			const s1 = new Set([{ a: 1 }]);
			const s2 = new Set([{ a: 1 }]);
			expect(isDeepEqual(s1, s2)).toBe(true);
		});

		it("should return false for set vs non-set", () => {
			expect(isDeepEqual(new Set(), [])).toBe(false);
		});
	});

	describe("circular references", () => {
		it("should handle self-referencing objects", () => {
			const a: Record<string, unknown> = { value: 1 };
			a.self = a;
			const b: Record<string, unknown> = { value: 1 };
			b.self = b;
			expect(isDeepEqual(a, b)).toBe(true);
		});

		it("should handle mutually referencing objects", () => {
			const a1: Record<string, unknown> = {};
			const a2: Record<string, unknown> = {};
			a1.ref = a2;
			a2.ref = a1;

			const b1: Record<string, unknown> = {};
			const b2: Record<string, unknown> = {};
			b1.ref = b2;
			b2.ref = b1;

			expect(isDeepEqual(a1, b1)).toBe(true);
		});
	});

	describe("same reference", () => {
		it("should return true for the same object reference", () => {
			const obj = { a: 1 };
			expect(isDeepEqual(obj, obj)).toBe(true);
		});

		it("should return true for the same array reference", () => {
			const arr = [1, 2, 3];
			expect(isDeepEqual(arr, arr)).toBe(true);
		});
	});

	describe("different prototypes", () => {
		it("should return false for objects with different prototypes", () => {
			class A {
				x = 1;
			}
			class B {
				x = 1;
			}
			expect(isDeepEqual(new A(), new B())).toBe(false);
		});
	});

	describe("options: onDifference", () => {
		it("should call onDifference when values are not equal", () => {
			const onDifference = vi.fn();
			isDeepEqual({ a: 1 }, { a: 2 }, { onDifference });
			expect(onDifference).toHaveBeenCalledOnce();
			expect(onDifference).toHaveBeenCalledWith({
				path: ["a"],
				left: 1,
				right: 2,
			});
		});

		it("should not call onDifference when values are equal", () => {
			const onDifference = vi.fn();
			isDeepEqual({ a: 1 }, { a: 1 }, { onDifference });
			expect(onDifference).not.toHaveBeenCalled();
		});
	});

	describe("options: onEqualSuccess / onEqualFailed", () => {
		it("should call onEqualSuccess when equal", () => {
			const onEqualSuccess = vi.fn();
			isDeepEqual(1, 1, { onEqualSuccess });
			expect(onEqualSuccess).toHaveBeenCalledOnce();
		});

		it("should call onEqualFailed when not equal", () => {
			const onEqualFailed = vi.fn();
			isDeepEqual(1, 2, { onEqualFailed });
			expect(onEqualFailed).toHaveBeenCalledOnce();
		});

		it("should call onEqualFalied (backwards-compat alias)", () => {
			const onEqualFalied = vi.fn();
			isDeepEqual(1, 2, { onEqualFalied });
			expect(onEqualFalied).toHaveBeenCalledOnce();
		});

		it("should pass first difference to onEqualFailed", () => {
			const onEqualFailed = vi.fn();
			isDeepEqual({ a: 1 }, { a: 2 }, { onEqualFailed });
			expect(onEqualFailed).toHaveBeenCalledWith(
				expect.objectContaining({ path: ["a"], left: 1, right: 2 }),
			);
		});
	});

	describe("options: customEqual", () => {
		it("should use customEqual override when it returns a boolean", () => {
			const result = isDeepEqual(
				{ a: "foo" },
				{ a: "bar" },
				{
					customEqual: (_left, _right, path) => {
						if (path.length === 1 && path[0] === "a") {
							return true;
						}
						return undefined;
					},
				},
			);
			expect(result).toBe(true);
		});

		it("should fall back to default when customEqual returns undefined", () => {
			const result = isDeepEqual(
				{ a: 1 },
				{ a: 2 },
				{
					customEqual: () => undefined,
				},
			);
			expect(result).toBe(false);
		});

		it("should report difference when customEqual returns false", () => {
			const onDifference = vi.fn();
			isDeepEqual(
				{ a: 1 },
				{ a: 1 },
				{
					customEqual: () => false,
					onDifference,
				},
			);
			expect(onDifference).toHaveBeenCalledOnce();
		});
	});

	describe('options: mode "all"', () => {
		it("should report all differences", () => {
			const diffs: unknown[] = [];
			isDeepEqual(
				{ a: 1, b: 2, c: 3 },
				{ a: 10, b: 20, c: 30 },
				{
					mode: "all",
					onDifference: (diff) => diffs.push(diff),
				},
			);
			expect(diffs).toHaveLength(3);
		});

		it("should report all array differences", () => {
			const diffs: unknown[] = [];
			isDeepEqual([1, 2, 3], [10, 20, 30], {
				mode: "all",
				onDifference: (diff) => diffs.push(diff),
			});
			expect(diffs).toHaveLength(3);
		});
	});

	describe('options: mode "first" (default)', () => {
		it("should stop at first difference in objects", () => {
			const diffs: unknown[] = [];
			isDeepEqual(
				{ a: 1, b: 2 },
				{ a: 10, b: 20 },
				{
					mode: "first",
					onDifference: (diff) => diffs.push(diff),
				},
			);
			expect(diffs).toHaveLength(1);
		});

		it("should stop at first difference in arrays", () => {
			const diffs: unknown[] = [];
			isDeepEqual([1, 2, 3], [10, 20, 30], {
				mode: "first",
				onDifference: (diff) => diffs.push(diff),
			});
			expect(diffs).toHaveLength(1);
		});
	});

	describe("mixed nested structures", () => {
		it("should compare complex nested structures", () => {
			const a = {
				users: [
					{ id: 1, name: "Alice", roles: new Set(["admin", "user"]) },
					{ id: 2, name: "Bob", roles: new Set(["user"]) },
				],
				metadata: new Map([["version", 1]]),
				createdAt: new Date("2024-01-01"),
			};
			const b = {
				users: [
					{ id: 1, name: "Alice", roles: new Set(["admin", "user"]) },
					{ id: 2, name: "Bob", roles: new Set(["user"]) },
				],
				metadata: new Map([["version", 1]]),
				createdAt: new Date("2024-01-01"),
			};
			expect(isDeepEqual(a, b)).toBe(true);
		});

		it("should detect differences in deeply nested structures", () => {
			const a = {
				users: [{ id: 1, roles: new Set(["admin"]) }],
			};
			const b = {
				users: [{ id: 1, roles: new Set(["user"]) }],
			};
			expect(isDeepEqual(a, b)).toBe(false);
		});
	});

	describe("set: mode all differences", () => {
		it("should report extra values in right set", () => {
			const diffs: unknown[] = [];
			const s1 = new Set([1, 2]);
			const s2 = new Set([3, 4]);
			isDeepEqual(s1, s2, {
				mode: "all",
				onDifference: (diff) => diffs.push(diff),
			});
			expect(diffs.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe("map: mode all differences", () => {
		it("should report all map key mismatches", () => {
			const diffs: unknown[] = [];
			const m1 = new Map([
				["a", 1],
				["b", 2],
			]);
			const m2 = new Map([
				["c", 1],
				["d", 2],
			]);
			isDeepEqual(m1, m2, {
				mode: "all",
				onDifference: (diff) => diffs.push(diff),
			});
			expect(diffs.length).toBeGreaterThanOrEqual(2);
		});

		it("should report value mismatches when keys match", () => {
			const onDifference = vi.fn();
			const m1 = new Map([["a", 1]]);
			const m2 = new Map([["a", 2]]);
			isDeepEqual(m1, m2, { mode: "all", onDifference });
			expect(onDifference).toHaveBeenCalled();
		});
	});
});
