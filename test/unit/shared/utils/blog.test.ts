import { changelogEntryAnchor, readingMinutes } from "#shared/utils/blog";
import { describe, expect, it } from "vitest";

/** `count` words of prose. */
function words(count: number): string {
	return Array.from({ length: count }, () => "moderation").join(" ");
}

describe("readingMinutes", () => {
	it.each([
		[220, 1],
		[440, 2],
		[1000, 5],
	])("reads %i words in %i minutes", (count, minutes) => {
		expect(readingMinutes(words(count))).toBe(minutes);
	});

	it("never goes below a minute", () => {
		expect(readingMinutes("")).toBe(1);
		expect(readingMinutes("One short line.")).toBe(1);
	});

	it("does not count the frontmatter", () => {
		const frontmatter = `---\ntitle: A post\ndescription: ${words(900)}\n---\n`;

		expect(readingMinutes(`${frontmatter}${words(220)}`)).toBe(1);
	});

	it("does not count where a link points, only what it says", () => {
		const link = `[notes](https://example.com/${Array.from({ length: 900 }, () => "a").join("/")})`;

		expect(readingMinutes(`${words(220)} ${link}`)).toBe(1);
	});

	it("does not count the fences of a component, only what is inside", () => {
		const note = `::note{color="info" icon="i-lucide-info" title="${words(900)}"}\n${words(220)}\n::`;

		expect(readingMinutes(note)).toBe(1);
	});

	it("counts words in other scripts", () => {
		expect(readingMinutes(Array.from({ length: 440 }, () => "модерация").join(" "))).toBe(2);
	});
});

describe("changelogEntryAnchor", () => {
	it.each([
		["/changelog/rocks-v2", "rocks-v2"],
		["/changelog/rocks-v2/", "rocks-v2"],
		["rocks-v2", "rocks-v2"],
		["", ""],
	])("turns %j into %j", (path, anchor) => {
		expect(changelogEntryAnchor(path)).toBe(anchor);
	});
});
