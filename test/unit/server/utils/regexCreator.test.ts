import { create } from "#server/utils/regexCreator";
import { describe, expect, it } from "vitest";

describe("regexCreator.create", () => {
	describe("basic word matching", () => {
		it("should create a pattern that matches a simple word", () => {
			const pattern = create(["hello"]);
			const regex = new RegExp(pattern, "i");
			expect(regex.test("hello")).toBe(true);
			expect(regex.test("say hello there")).toBe(true);
		});

		it("should match multiple words", () => {
			const pattern = create(["hello", "world"]);
			const regex = new RegExp(pattern, "i");
			expect(regex.test("hello")).toBe(true);
			expect(regex.test("world")).toBe(true);
		});

		it("should be case insensitive with i flag", () => {
			const pattern = create(["hello"]);
			const regex = new RegExp(pattern, "i");
			expect(regex.test("HELLO")).toBe(true);
			expect(regex.test("HeLLo")).toBe(true);
		});
	});

	describe("word boundaries with wildcards", () => {
		it("should match words without wildcards at word boundaries", () => {
			const pattern = create(["test"]);
			const regex = new RegExp(pattern, "i");
			expect(regex.test("test")).toBe(true);
			expect(regex.test("a test here")).toBe(true);
		});

		it("should match start wildcard (no end boundary)", () => {
			const pattern = create(["*ing"]);
			const regex = new RegExp(pattern, "i");
			expect(regex.test("running")).toBe(true);
			expect(regex.test("singing")).toBe(true);
		});

		it("should match end wildcard (no start boundary)", () => {
			const pattern = create(["un*"]);
			const regex = new RegExp(pattern, "i");
			expect(regex.test("un")).toBe(true);
			expect(regex.test("unreal")).toBe(true);
		});

		it("should match both wildcards (no boundaries)", () => {
			const pattern = create(["*bad*"]);
			const regex = new RegExp(pattern, "i");
			expect(regex.test("bad")).toBe(true);
			expect(regex.test("badword")).toBe(true);
			expect(regex.test("verybadstuff")).toBe(true);
		});
	});

	describe("special regex characters", () => {
		it("should escape regex special characters in words", () => {
			const pattern = create(["test.com"]);
			const regex = new RegExp(pattern, "i");
			expect(regex.test("test.com")).toBe(true);
		});

		it("should escape parentheses", () => {
			const pattern = create(["(test)"]);
			const regex = new RegExp(pattern, "i");
			expect(regex.test("(test)")).toBe(true);
		});
	});

	describe("character groups", () => {
		it("should process character groups in brackets", () => {
			const pattern = create(["[abc]at"]);
			const regex = new RegExp(pattern, "i");
			expect(regex.test("aat")).toBe(true);
			expect(regex.test("bat")).toBe(true);
			expect(regex.test("cat")).toBe(true);
		});

		it("should process character ranges in groups", () => {
			const pattern = create(["[a-z]at"]);
			const regex = new RegExp(pattern, "i");
			expect(regex.test("bat")).toBe(true);
			expect(regex.test("cat")).toBe(true);
			expect(regex.test("zat")).toBe(true);
		});
	});

	describe("empty input", () => {
		it("should return empty string for empty array", () => {
			const pattern = create([]);
			expect(pattern).toBe("");
		});
	});

	describe("word separation handling", () => {
		it("should match words with non-word character separators", () => {
			const pattern = create(["hello"]);
			const regex = new RegExp(pattern, "i");
			expect(regex.test("h.e.l.l.o")).toBe(true);
			expect(regex.test("h e l l o")).toBe(true);
		});
	});

	describe("mixed boundary types", () => {
		it("should handle a mix of boundary types", () => {
			const pattern = create(["hello", "*world", "test*", "*mid*"]);
			const regex = new RegExp(pattern, "i");
			expect(regex.test("hello")).toBe(true);
			expect(regex.test("world")).toBe(true);
			expect(regex.test("test")).toBe(true);
			expect(regex.test("mid")).toBe(true);
		});
	});
});
