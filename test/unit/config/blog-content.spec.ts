import { describe, expect, it } from "vitest";
import { frontmatterProblems } from "../../../config/blog-content";

const post = {
	authors: [{ name: "RedStar" }],
	category: "Release",
	date: "2026-10-12",
	description: "The v7 alpha is live.",
	title: "WolfStar v7 alpha",
};

const entry = {
	date: "2026-08-24",
	description: "The callback page could claim your session was missing.",
	kind: "fixed",
	title: "Fixed a false session error",
};

describe("frontmatterProblems", () => {
	it("accepts a complete post and a complete changelog entry", () => {
		expect(frontmatterProblems("blog", post)).toEqual([]);
		expect(frontmatterProblems("changelog", entry)).toEqual([]);
	});

	it("accepts the date YAML hands over when it is written without quotes", () => {
		expect(frontmatterProblems("blog", { ...post, date: new Date("2026-10-12") })).toEqual([]);
	});

	it.each([
		["a category in lower case", { category: "release" }, "`category` must be one of"],
		["a category that does not exist", { category: "News" }, "`category` must be one of"],
		["no author", { authors: [] }, "`authors` needs at least one author"],
		[
			"an author without a name",
			{ authors: [{ to: "https://x.com/redstar071" }] },
			"`authors`",
		],
		["a date that is not one", { date: "next week" }, "`date` is not a date"],
		["an empty title", { title: " " }, "`title` is missing"],
		["no description", { description: undefined }, "`description` is missing"],
	])("refuses a post with %s", (_, change, problem) => {
		const problems = frontmatterProblems("blog", { ...post, ...change });

		expect(problems).toHaveLength(1);
		expect(problems[0]).toContain(problem);
	});

	it("names the kinds a changelog entry may have when it has another", () => {
		expect(frontmatterProblems("changelog", { ...entry, kind: "Fixed" })).toEqual([
			"`kind` must be one of: new, improved, fixed.",
		]);
	});

	it("lists every problem of a file at once", () => {
		expect(frontmatterProblems("changelog", {})).toHaveLength(4);
	});

	it("leaves the other collections alone", () => {
		expect(frontmatterProblems("landing", {})).toEqual([]);
	});
});
