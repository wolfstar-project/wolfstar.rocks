interface HastNode {
	type: string;
	tagName?: string;
	value?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
}

const HEADING_TAG = /^h[1-6]$/;

/**
 * Slugifies heading text into an id-safe fragment (lowercase alphanumerics
 * joined by single dashes, no leading/trailing dash).
 */
export function slugifyHeadingText(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function extractText(node: HastNode): string {
	if (node.type === "text") {
		return node.value ?? "";
	}

	return (node.children ?? []).map(extractText).join("");
}

/**
 * Rewrites heading ids in a parsed hast tree so they are prefixed with a
 * per-release slug and de-duplicated within the tree.
 *
 * Each changelog release renders in its own `<MDC>` instance with a fresh
 * slugger, so without a prefix identical section headings ("Fixes", "Chore",
 * ...) collide across releases and fail html-validate's `no-dup-id` rule when
 * the page is prerendered.
 */
export function prefixHeadingIds(tree: HastNode, prefix: string): void {
	const base = slugifyHeadingText(prefix);
	const seen = new Map<string, number>();

	const walk = (node: HastNode): void => {
		if (node.type === "element" && node.tagName && HEADING_TAG.test(node.tagName)) {
			const slug = slugifyHeadingText(extractText(node)) || "section";
			const scoped = base ? `${base}-${slug}` : slug;
			const count = seen.get(scoped) ?? 0;
			seen.set(scoped, count + 1);
			node.properties = node.properties ?? {};
			node.properties.id = count === 0 ? scoped : `${scoped}-${count}`;
		}

		for (const child of node.children ?? []) {
			walk(child);
		}
	};

	walk(tree);
}

/**
 * MDC/rehype plugin factory. Registered as a `parserOptions.rehype.plugins`
 * entry on the changelog `<MDC>` so each release gets release-scoped heading
 * ids. MDC's compiler keeps a pre-set `properties.id`, so this runs before its
 * own slug generation.
 */
export function rehypeChangelogHeadingIds(options: { prefix: string }) {
	return (tree: HastNode): void => {
		prefixHeadingIds(tree, options.prefix);
	};
}
