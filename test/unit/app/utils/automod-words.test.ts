import { create } from "#shared/utils/automod-word-pattern";
import { describe, expect, it } from "vitest";
import {
	automodWordExamples,
	checkAutomodWord,
	checkAutomodWordLetters,
	composeAutomodWord,
	exportAutomodWords,
	findCoveredAutomodWords,
	importAutomodWords,
	parseAutomodWord,
	type AutomodWordDraft,
} from "~/utils/automod-words";

const draft = (overrides: Partial<AutomodWordDraft>): AutomodWordDraft => ({
	mode: "whole",
	letters: "bad",
	alternatives: {},
	...overrides,
});

describe("composeAutomodWord", () => {
	it.each([
		["whole", "bad"],
		["continues", "bad*"],
		["prefixed", "*bad"],
		["anywhere", "*bad*"],
	] as const)("saves the %s mode as %s", (mode, saved) => {
		expect(composeAutomodWord(draft({ mode }))).toBe(saved);
	});

	it("writes the alternatives of a letter as a group", () => {
		expect(composeAutomodWord(draft({ alternatives: { 1: "@4" } }))).toBe("b[a@4]d");
	});

	it("puts a dash last, where it cannot read as a range", () => {
		expect(composeAutomodWord(draft({ alternatives: { 1: "-z" } }))).toBe("b[az-]d");
	});

	it("drops brackets, spaces and repeats from the alternatives", () => {
		expect(composeAutomodWord(draft({ alternatives: { 1: "a[ ]a" } }))).toBe("bad");
	});

	it("builds the bot's expression from the saved word", () => {
		const word = composeAutomodWord(draft({ mode: "continues", alternatives: { 1: "@" } }));
		expect(create([word])).toBe("(?<=^|\\W)(?:b+\\W*[a@]+\\W*d+)");
	});
});

describe("parseAutomodWord", () => {
	it.each(["bad", "bad*", "*bad", "*bad*", "b[a@4]d", "a*b", "**ab"])(
		"reads %s back into the same word",
		(word) => {
			const parsed = parseAutomodWord(word);
			expect(parsed).not.toBeNull();
			expect(composeAutomodWord(parsed!)).toBe(word);
		},
	);

	it("leaves a range and a stray bracket to the advanced field", () => {
		expect(parseAutomodWord("x[a-z]y")).toBeNull();
		expect(parseAutomodWord("ab]")).toBeNull();
		expect(parseAutomodWord("[ab")).toBeNull();
	});
});

describe("checkAutomodWord", () => {
	it("rejects a word of 1 or 33 characters", () => {
		expect(checkAutomodWord("a", []).problem).toBe("tooShort");
		expect(checkAutomodWord("a".repeat(33), []).problem).toBe("tooLong");
		expect(checkAutomodWord("ab", []).problem).toBeNull();
		expect(checkAutomodWord("a".repeat(32), []).problem).toBeNull();
	});

	it("rejects wildcards with nothing between them", () => {
		expect(checkAutomodWord("**", []).problem).toBe("empty");
	});

	it("rejects a duplicate once saved as the server saves it", () => {
		const check = checkAutomodWord("  BAD ", ["bad"]);
		expect(check.word).toBe("bad");
		expect(check.problem).toBe("duplicate");
		expect(check.notes).toContain("normalized");
	});

	it("rejects brackets that are not balanced", () => {
		expect(checkAutomodWord("b[ad", []).problem).toBe("brackets");
		expect(checkAutomodWord("ba]d", []).problem).toBe("brackets");
		expect(checkAutomodWord("b[]d", []).problem).toBe("brackets");
		expect(checkAutomodWord("b[a@]d", []).problem).toBeNull();
	});

	it("explains a * in the middle", () => {
		expect(checkAutomodWord("a*b", []).notes).toContain("innerWildcard");
		expect(checkAutomodWord("ab*", []).notes).not.toContain("innerWildcard");
	});

	it("refuses a word once the list is full", () => {
		const full = Array.from({ length: 200 }, (_, index) => `word${index}`);
		expect(checkAutomodWord("another", full).problem).toBe("listFull");
	});
});

describe("checkAutomodWordLetters", () => {
	it("keeps the wildcards and the groups to their own choices", () => {
		expect(checkAutomodWordLetters("bad*")).toBe("edgeWildcard");
		expect(checkAutomodWordLetters("*bad")).toBe("edgeWildcard");
		expect(checkAutomodWordLetters("b[a]d")).toBe("brackets");
		expect(checkAutomodWordLetters("a*b")).toBeNull();
	});
});

describe("automodWordExamples", () => {
	const verdicts = (word: string) =>
		Object.fromEntries(
			automodWordExamples(word).map((example) => [example.kind, example.matches]),
		);

	it("shows what a whole word lets through", () => {
		expect(verdicts("bad")).toStrictEqual({
			plain: true,
			repeated: true,
			separated: true,
			continues: false,
			prefixed: false,
			inside: false,
		});
	});

	it("shows what a word anywhere takes", () => {
		expect(verdicts("*bad*")).toMatchObject({ continues: true, prefixed: true, inside: true });
	});
});

describe("findCoveredAutomodWords", () => {
	it("finds a word another one already takes", () => {
		const covered = findCoveredAutomodWords(["bad", "*bad*", "good"]);
		expect(covered.get("bad")).toBe("*bad*");
		expect(covered.has("*bad*")).toBe(false);
		expect(covered.has("good")).toBe(false);
	});

	it("does not call a word covered when only some of its alternatives are", () => {
		expect(findCoveredAutomodWords(["bad", "b[ae]d"]).has("b[ae]d")).toBe(false);
		expect(findCoveredAutomodWords(["b[ae]d", "bad"]).get("bad")).toBe("b[ae]d");
	});

	it("does not take a word that goes on for the whole one", () => {
		expect(findCoveredAutomodWords(["bad", "bad*"]).get("bad*")).toBeUndefined();
	});
});

describe("import and export", () => {
	it("reads one word per line, and says why a line is skipped", () => {
		const { added, rejected } = importAutomodWords("Bad\n\na\nbad\ngood*\r\n", ["good*"]);
		expect(added).toStrictEqual(["bad"]);
		expect(rejected).toStrictEqual([
			{ line: "a", problem: "tooShort" },
			{ line: "bad", problem: "duplicate" },
			{ line: "good*", problem: "duplicate" },
		]);
	});

	it("writes a list the import reads back", () => {
		const words = ["bad", "*evil*"];
		expect(importAutomodWords(exportAutomodWords(words), []).added).toStrictEqual(words);
	});
});
