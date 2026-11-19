/**
 * The values a blog post's `category` and a changelog entry's `kind` may take.
 * `content.config.ts` validates the frontmatter against them, and the pages
 * read them for their tabs and badges, so a value is added in this one place.
 */
export const BLOG_CATEGORIES = ["Release", "Announcement", "Tutorial", "Article"] as const;

export const CHANGELOG_KINDS = ["new", "improved", "fixed"] as const;

/** How many changelog entries the blog shows before it links to the archive. */
export const CHANGELOG_TIMELINE_LIMIT = 8;

const WORDS_PER_MINUTE = 220;

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;
// The target of a link or an image: `](https://example.com "title")`.
const LINK_TARGET = /\]\([^)]*\)/g;
// The opening or closing line of a component: `::note{color="info"}`, `::`.
const COMPONENT_FENCE = /^\s*:{2}.*$/gm;
const HTML_TAG = /<[^>]+>/g;
const WORD = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;

/**
 * Whole minutes a reader needs for a post, from its Markdown source.
 * An estimate: link targets, HTML tags and component fences are not read aloud,
 * so they are left out, and code is counted as prose.
 */
export function readingMinutes(markdown: string): number {
	const text = markdown
		.replace(FRONTMATTER, "")
		.replace(LINK_TARGET, "]")
		.replace(COMPONENT_FENCE, "")
		.replace(HTML_TAG, " ");
	const words = text.match(WORD)?.length ?? 0;

	return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** `/updates?category=release` for `Release`. */
export function blogCategorySlug(category: string): string {
	return category.toLowerCase();
}

/**
 * The id a changelog entry has on `/changelog`, from its content path:
 * `/changelog/rocks-v2` is `#rocks-v2`.
 */
export function changelogEntryAnchor(path: string): string {
	return path.replace(/\/+$/, "").split("/").pop() ?? "";
}
