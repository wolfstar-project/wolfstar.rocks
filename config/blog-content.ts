import { parse as parseYaml } from "yaml";
import { BLOG_CATEGORIES, CHANGELOG_KINDS } from "../shared/utils/blog.ts";

/**
 * Nuxt Content stores a frontmatter value whatever its collection schema says:
 * a post with `category: release` is listed all the same, under no category.
 * This is the check the build runs instead, so a mistake names its file and
 * stops there. `docs/blog.md` lists the same fields for whoever writes them.
 */

function isText(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

function isDate(value: unknown): boolean {
	return (
		(typeof value === "string" || value instanceof Date) &&
		!Number.isNaN(new Date(value).getTime())
	);
}

function isAuthorList(value: unknown): boolean {
	return (
		Array.isArray(value) &&
		value.length > 0 &&
		value.every(
			(author) => typeof author === "object" && author !== null && isText(author.name),
		)
	);
}

function oneOf(values: readonly string[]): string {
	return values.join(", ");
}

/** What is wrong with the frontmatter of a post or of a changelog entry, one line each. */
export function frontmatterProblems(
	collection: string,
	frontmatter: Record<string, unknown>,
): string[] {
	if (collection !== "blog" && collection !== "changelog") return [];

	const problems: string[] = [];

	if (!isText(frontmatter.title)) problems.push("`title` is missing.");
	if (!isText(frontmatter.description)) problems.push("`description` is missing.");
	if (!isDate(frontmatter.date)) problems.push("`date` is not a date such as 2026-11-19.");

	if (collection === "blog") {
		if (!BLOG_CATEGORIES.includes(frontmatter.category as (typeof BLOG_CATEGORIES)[number])) {
			problems.push(`\`category\` must be one of: ${oneOf(BLOG_CATEGORIES)}.`);
		}
		if (!isAuthorList(frontmatter.authors)) {
			problems.push("`authors` needs at least one author with a `name`.");
		}
	} else if (!CHANGELOG_KINDS.includes(frontmatter.kind as (typeof CHANGELOG_KINDS)[number])) {
		problems.push(`\`kind\` must be one of: ${oneOf(CHANGELOG_KINDS)}.`);
	}

	return problems;
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

/**
 * What is wrong with one Markdown file of `content/blog` or `content/changelog`,
 * read from its source. The build checks the files themselves rather than what
 * Nuxt Content parsed: a file it already holds in its cache is never parsed again.
 */
export function fileProblems(collection: string, source: string): string[] {
	const block = FRONTMATTER.exec(source)?.[1];
	if (block === undefined) return ["The file has no frontmatter."];

	let frontmatter: unknown;
	try {
		frontmatter = parseYaml(block);
	} catch (error) {
		return [
			`The frontmatter is not valid YAML: ${error instanceof Error ? error.message : error}`,
		];
	}
	if (typeof frontmatter !== "object" || frontmatter === null || Array.isArray(frontmatter)) {
		return ["The frontmatter is not a list of fields."];
	}
	return frontmatterProblems(collection, frontmatter as Record<string, unknown>);
}
