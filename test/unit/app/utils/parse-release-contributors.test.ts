import { describe, expect, it } from "vitest";
import { parseReleaseContributors } from "~/utils/parse-release-contributors";

describe("parseReleaseContributors", () => {
	it("returns the original markdown when no Contributors section exists", () => {
		const markdown = "## Features\n\n* Something cool\n";

		expect(parseReleaseContributors(markdown)).toEqual({
			bodyMarkdown: markdown,
			contributors: [],
		});
	});

	it("extracts contributors and strips the Contributors section from the body", () => {
		const markdown = [
			"### Features",
			"",
			"* Add hover cards",
			"",
			"### ❤️ Contributors",
			"",
			"- RedStar (@RedStar071)",
			"- Favna (@favna)",
			"",
		].join("\n");

		const result = parseReleaseContributors(markdown);

		expect(result.contributors).toEqual([
			{ name: "RedStar", username: "RedStar071" },
			{ name: "Favna", username: "favna" },
		]);
		expect(result.bodyMarkdown).toBe("### Features\n\n* Add hover cards");
		expect(result.bodyMarkdown).not.toContain("Contributors");
		expect(result.bodyMarkdown).not.toContain("@RedStar071");
	});

	it("matches a Contributors heading without the heart emoji", () => {
		const markdown = "### Features\n\n* Fix\n\n### Contributors\n\n- Alice (@alice)\n";

		const result = parseReleaseContributors(markdown);

		expect(result.contributors).toEqual([{ name: "Alice", username: "alice" }]);
		expect(result.bodyMarkdown).toBe("### Features\n\n* Fix");
	});

	it("keeps content after the Contributors section in the body", () => {
		const markdown = [
			"### Features",
			"",
			"* Thing",
			"",
			"### ❤️ Contributors",
			"",
			"- RedStar (@RedStar071)",
			"",
			"### Notes",
			"",
			"Extra note",
		].join("\n");

		const result = parseReleaseContributors(markdown);

		expect(result.contributors).toEqual([{ name: "RedStar", username: "RedStar071" }]);
		expect(result.bodyMarkdown).toContain("### Features");
		expect(result.bodyMarkdown).toContain("### Notes");
		expect(result.bodyMarkdown).toContain("Extra note");
		expect(result.bodyMarkdown).not.toContain("Contributors");
	});

	it("deduplicates usernames case-insensitively", () => {
		const markdown = [
			"### ❤️ Contributors",
			"",
			"- RedStar (@RedStar071)",
			"- Other (@redstar071)",
		].join("\n");

		expect(parseReleaseContributors(markdown).contributors).toEqual([
			{ name: "RedStar", username: "RedStar071" },
		]);
	});

	it("ignores malformed contributor lines", () => {
		const markdown = [
			"### ❤️ Contributors",
			"",
			"- Missing handle",
			"- Valid (@valid-user)",
			"- (@onlyhandle)",
		].join("\n");

		expect(parseReleaseContributors(markdown).contributors).toEqual([
			{ name: "Valid", username: "valid-user" },
		]);
	});
});
