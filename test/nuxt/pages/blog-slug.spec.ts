import type { VueWrapper } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BlogSlug from "~/pages/(marketing)/blog/[slug].vue";

const mockPost = {
	path: "/blog/wolfstar-v7",
	stem: "blog/wolfstar-v7",
	title: "WolfStar v7",
	description: "Introducing WolfStar v7",
	date: "2024-02-25",
	category: "Announcement",
	image: "/logo.svg",
	draft: false,
	tags: [],
	authors: [{ name: "RedStar", to: "https://github.com/wolfstar-project" }],
	readingTime: 4,
	body: { toc: { links: [] as Array<{ depth: number; id: string; text: string }> } },
};

function makeQueryChain(resolve: () => unknown) {
	const chain: Record<string, unknown> = {};
	for (const method of ["where", "path"]) {
		chain[method] = () => chain;
	}
	chain["order"] = () => Promise.resolve(resolve());
	chain["first"] = () => Promise.resolve(resolve());
	return chain;
}

const { content, queryCollectionMock, queryCollectionItemSurroundingsMock } = vi.hoisted(() => {
	const content: { post: unknown; surround: unknown[] } = { post: null, surround: [null, null] };
	return {
		content,
		queryCollectionMock: vi.fn(() => makeQueryChain(() => content.post)),
		queryCollectionItemSurroundingsMock: vi.fn(() => makeQueryChain(() => content.surround)),
	};
});

mockNuxtImport("queryCollection", () => queryCollectionMock);
mockNuxtImport("queryCollectionItemSurroundings", () => queryCollectionItemSurroundingsMock);

// A mounted page keeps its `useAsyncData` entries alive, and the next mount would
// read them instead of asking for the content again.
const mounted: VueWrapper[] = [];

async function mountPost(route = "/blog/wolfstar-v7") {
	const wrapper = await mountSuspended(BlogSlug, { route });
	mounted.push(wrapper);
	return wrapper;
}

describe("blog post page", () => {
	beforeEach(() => {
		content.post = mockPost;
		content.surround = [null, null];
	});

	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	it("shows the post with its date and reading time", async () => {
		const wrapper = await mountPost();

		expect(wrapper.get("h1").text()).toBe("WolfStar v7");
		expect(wrapper.text()).toContain("Introducing WolfStar v7");
		expect(wrapper.text()).toContain("Feb 25, 2024");
		expect(wrapper.text()).toContain("4 min read");
	});

	it("links the category to the posts of that category", async () => {
		const wrapper = await mountPost();

		expect(wrapper.get('a[href="/updates?category=announcement"]').text()).toBe(
			"Announcements",
		);
	});

	it("links an author who has a page, and names the others", async () => {
		content.post = { ...mockPost, authors: [...mockPost.authors, { name: "Staryl" }] };

		const wrapper = await mountPost();

		expect(wrapper.get('a[href="https://github.com/wolfstar-project"]').text()).toBe("RedStar");
		expect(wrapper.text()).toContain("RedStar and Staryl");
	});

	it("links to the post's source", async () => {
		const wrapper = await mountPost();

		expect(
			wrapper
				.find(
					'a[href="https://github.com/wolfstar-project/wolfstar.rocks/edit/main/content/blog/wolfstar-v7.md"]',
				)
				.exists(),
		).toBe(true);
	});

	it("offers the page as Markdown", async () => {
		const wrapper = await mountPost();

		expect(wrapper.text()).toContain("Copy page");
		expect(wrapper.find('button[aria-label="Open copy options"]').exists()).toBe(true);
	});

	it("links a release to the releases around it", async () => {
		content.post = { ...mockPost, category: "Release" };
		content.surround = [
			{
				description: "The alpha.",
				path: "/blog/wolfstar-v7-alpha",
				title: "WolfStar v7 alpha",
			},
			null,
		];

		const wrapper = await mountPost();

		expect(wrapper.text()).toContain("Release history");
		expect(wrapper.find('a[href="/blog/wolfstar-v7-alpha"]').exists()).toBe(true);
	});

	it("leaves the release history out of a post that is not a release", async () => {
		content.surround = [
			{
				description: "The alpha.",
				path: "/blog/wolfstar-v7-alpha",
				title: "WolfStar v7 alpha",
			},
			null,
		];

		const wrapper = await mountPost();

		expect(wrapper.text()).not.toContain("Release history");
	});

	it("says a post that fits the screen is read to its end", async () => {
		content.post = {
			...mockPost,
			body: {
				toc: {
					links: [
						{ depth: 2, id: "why", text: "Why" },
						{ depth: 2, id: "what", text: "What" },
					],
				},
			},
		};

		const wrapper = await mountPost();

		expect(wrapper.get("aside").text()).toContain("Finished");
	});

	it("leaves the table of contents out of a post with a single section", async () => {
		content.post = {
			...mockPost,
			body: { toc: { links: [{ depth: 2, id: "why", text: "Why" }] } },
		};

		const wrapper = await mountPost();

		expect(wrapper.find("aside").exists()).toBe(false);
	});

	it("lists the sections of a post that has several", async () => {
		content.post = {
			...mockPost,
			body: {
				toc: {
					links: [
						{ depth: 2, id: "why", text: "Why" },
						{ depth: 2, id: "what", text: "What" },
					],
				},
			},
		};

		const wrapper = await mountPost();

		expect(wrapper.get("aside").text()).toContain("Why");
		expect(wrapper.get("aside").text()).toContain("What");
	});

	it("does not render the article when the post is not found", async () => {
		content.post = null;

		// The page calls createError(404, { fatal: true }) for a missing post, which
		// Nuxt surfaces as an error state rather than a rejection, so the article
		// content is never rendered.
		const wrapper = await mountPost("/blog/missing");

		expect(wrapper.text()).not.toContain("WolfStar v7");
	});
});
