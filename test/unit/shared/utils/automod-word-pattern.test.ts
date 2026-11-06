import {
	compileAutomodWords,
	create,
	findAutomodWordMatches,
	processGroup,
	processLetter,
	processWordBoundaries,
	processWordPattern,
	processWordPatternsWithGroups,
	WordBoundary,
} from "#shared/utils/automod-word-pattern";
import { describe, expect, it } from "vitest";

// The expected sources are the bot's own, from `projects/bot/tests/lib/RegexCreator.test.ts` (wolfstar-project/wolfstar,
// V7): the port must build the same expression, character for character.
describe("the port of the bot's RegexCreator", () => {
	it("escapes the symbols of an expression", () => {
		expect(processLetter("a")).toBe("a");
		expect(processLetter("/")).toBe("\\/");
	});

	it("lets every letter repeat, with separators between them", () => {
		expect(processWordPattern("a")).toBe("a+");
		expect(processWordPattern("ab")).toBe("a+\\W*b+");
		expect(processWordPattern("/b")).toBe("\\/+\\W*b+");
	});

	it.each([
		["a", "[a]"],
		["a-b", "[a-b]"],
		["-b", "[\\-b]"],
		["b-", "[b\\-]"],
		["---", "[\\-]"],
		["a-b-z", "[a-b\\-z]"],
		["?:*a-b-z0-9.", "[\\?:\\*a-b\\-z0-9\\.]"],
	])("builds the group %s as %s", (group, expected) => {
		expect(processGroup(group)).toBe(expected);
	});

	it.each([
		["[a-b]c", "[a-b]+\\W*c+"],
		["a[b-c]d[ef]g", "a+\\W*[b-c]+\\W*d+\\W*[ef]+\\W*g+"],
		["[ab][c-e][]]", "[ab]+\\W*[c-e]+\\W*\\[+\\W*\\]+\\W*\\]+"],
	])("builds the word %s as %s", (word, expected) => {
		expect(processWordPatternsWithGroups(word)).toBe(expected);
	});

	it("reads a * only at the edges as a wildcard", () => {
		expect(processWordBoundaries("a")).toBe(WordBoundary.None);
		expect(processWordBoundaries("a*")).toBe(WordBoundary.End);
		expect(processWordBoundaries("*a")).toBe(WordBoundary.Start);
		expect(processWordBoundaries("*a*")).toBe(WordBoundary.Both);
		expect(processWordBoundaries("a*a")).toBe(WordBoundary.None);
	});

	it.each([
		[["a"], "(?<=^|\\W)(?:a+)(?=$|\\W)"],
		[["a", "b"], "(?<=^|\\W)(?:a+|b+)(?=$|\\W)"],
		[["a", "*b"], "(?<=^|\\W)(?:a+)(?=$|\\W)|(?:b+)(?=$|\\W)"],
		[["a", "b*"], "(?<=^|\\W)(?:a+)(?=$|\\W)|(?<=^|\\W)(?:b+)"],
		[["a", "*b*", "c"], "(?<=^|\\W)(?:a+|c+)(?=$|\\W)|(?:b+)"],
		[["http://*"], "(?<=^|\\W)(?:h+\\W*t+\\W*t+\\W*p+\\W*:+\\W*\\/+\\W*\\/+)"],
	])("creates %j as %s", (words, expected) => {
		expect(create(words)).toBe(expected);
	});

	it("reads a group with brackets that never close in linear time", () => {
		const start = performance.now();
		processWordPatternsWithGroups("[".repeat(100_000));
		expect(performance.now() - start).toBeLessThan(1000);
	});
});

describe("findAutomodWordMatches", () => {
	const caught = (words: string[], text: string) => {
		const expression = compileAutomodWords(words);
		if (expression === null) return [];
		return findAutomodWordMatches(expression, text).map(({ start, end }) =>
			text.slice(start, end),
		);
	};

	it("returns null for no words", () => {
		expect(compileAutomodWords([])).toBeNull();
	});

	it("takes a whole word only between characters that are not letters, digits or _", () => {
		expect(caught(["bad"], "so bad!")).toStrictEqual(["bad"]);
		expect(caught(["bad"], "badge")).toStrictEqual([]);
		expect(caught(["bad"], "subbad")).toStrictEqual([]);
		expect(caught(["bad"], "bad_x")).toStrictEqual([]);
	});

	it("takes a word that goes on with word*", () => {
		expect(caught(["parola*"], "che parolaccia")).toStrictEqual(["parola"]);
		expect(caught(["parola*"], "laparola")).toStrictEqual([]);
	});

	it("takes a word with letters before with *word", () => {
		expect(caught(["*bad"], "unbad")).toStrictEqual(["bad"]);
		expect(caught(["*bad"], "badge")).toStrictEqual([]);
	});

	it("takes a word anywhere with *word*", () => {
		expect(caught(["*bad*"], "abadon")).toStrictEqual(["bad"]);
	});

	it("takes repeated letters and separators", () => {
		expect(caught(["bad"], "baaaad")).toStrictEqual(["baaaad"]);
		expect(caught(["bad"], "b.a.d and b a d")).toStrictEqual(["b.a.d", "b a d"]);
	});

	it("takes one character of a group or a range", () => {
		expect(caught(["b[a@4]d"], "b@d b4d")).toStrictEqual(["b@d", "b4d"]);
		expect(caught(["x[a-z]y"], "xqy x1y")).toStrictEqual(["xqy"]);
	});

	it("reads a * in the middle as an asterisk", () => {
		expect(caught(["a*b"], "a*b")).toStrictEqual(["a*b"]);
		expect(caught(["a*b"], "axxb")).toStrictEqual([]);
	});

	it("ignores capital letters", () => {
		expect(caught(["bad"], "BAD")).toStrictEqual(["BAD"]);
	});
});
