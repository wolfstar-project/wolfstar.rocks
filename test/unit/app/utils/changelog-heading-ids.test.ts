import { describe, expect, it } from "vitest";
import {
	prefixHeadingIds,
	rehypeChangelogHeadingIds,
	slugifyHeadingText,
} from "~/utils/changelog-heading-ids";

interface HastNode {
	type: string;
	tagName?: string;
	value?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
}

function heading(level: number, text: string): HastNode {
	return {
		type: "element",
		tagName: `h${level}`,
		properties: {},
		children: [{ type: "text", value: text }],
	};
}

function tree(...children: HastNode[]): HastNode {
	return { type: "root", children };
}

describe("slugifyHeadingText", () => {
	it("lowercases and joins words with single dashes", () => {
		expect(slugifyHeadingText("Bug Fixes")).toBe("bug-fixes");
	});

	it("strips emoji, punctuation, and leading/trailing dashes", () => {
		expect(slugifyHeadingText("❤️ Contributors")).toBe("contributors");
	});
});

describe("prefixHeadingIds", () => {
	it("scopes heading ids by the release prefix", () => {
		const root = tree(heading(2, "Fixes"), heading(3, "Chore"));

		prefixHeadingIds(root, "v1.2.3");

		expect(root.children?.[0]?.properties?.id).toBe("v1-2-3-fixes");
		expect(root.children?.[1]?.properties?.id).toBe("v1-2-3-chore");
	});

	it("keeps ids unique across releases sharing section names", () => {
		const releaseA = tree(heading(2, "Fixes"));
		const releaseB = tree(heading(2, "Fixes"));

		prefixHeadingIds(releaseA, "v1.0.0");
		prefixHeadingIds(releaseB, "v2.0.0");

		expect(releaseA.children?.[0]?.properties?.id).toBe("v1-0-0-fixes");
		expect(releaseB.children?.[0]?.properties?.id).toBe("v2-0-0-fixes");
	});

	it("de-duplicates repeated headings within a single release", () => {
		const root = tree(heading(2, "Fixes"), heading(2, "Fixes"));

		prefixHeadingIds(root, "v1.0.0");

		expect(root.children?.[0]?.properties?.id).toBe("v1-0-0-fixes");
		expect(root.children?.[1]?.properties?.id).toBe("v1-0-0-fixes-1");
	});

	it("falls back to a section slug when a heading has no text", () => {
		const root = tree(heading(2, ""));

		prefixHeadingIds(root, "v1.0.0");

		expect(root.children?.[0]?.properties?.id).toBe("v1-0-0-section");
	});
});

describe("rehypeChangelogHeadingIds", () => {
	it("returns a transformer that prefixes heading ids in place", () => {
		const transform = rehypeChangelogHeadingIds({ prefix: "v1.0.0" });
		const root = tree(heading(2, "Enhancements"));

		transform(root);

		expect(root.children?.[0]?.properties?.id).toBe("v1-0-0-enhancements");
	});
});
