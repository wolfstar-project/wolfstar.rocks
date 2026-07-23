import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import BlogSlug from "~/pages/(marketing)/blog/[slug].vue";

const mockPost = {
	path: "/blog/wolfstar-v7",
	stem: "blog/wolfstar-v7",
	title: "WolfStar v7",
	description: "Introducing WolfStar v7",
	date: "2024-01-01",
	category: "Announcement",
	image: "/logo.svg",
	draft: false,
	tags: [],
	authors: [{ name: "RedStar", to: "https://github.com/wolfstar-project" }],
	body: { toc: { links: [] } },
};

function makeQueryChain(resolvedValue: unknown) {
	const chain: Record<string, unknown> = {};
	for (const method of ["where", "path", "limit", "skip"]) {
		chain[method] = () => chain;
	}
	chain["order"] = () => Promise.resolve(resolvedValue);
	chain["all"] = () => Promise.resolve(resolvedValue);
	chain["first"] = () => Promise.resolve(resolvedValue);
	return chain;
}

const { queryCollectionMock, queryCollectionItemSurroundingsMock } = vi.hoisted(() => ({
	queryCollectionMock: vi.fn(() => makeQueryChain(mockPost)),
	queryCollectionItemSurroundingsMock: vi.fn(() => makeQueryChain([null, null])),
}));

mockNuxtImport("queryCollection", () => queryCollectionMock);
mockNuxtImport("queryCollectionItemSurroundings", () => queryCollectionItemSurroundingsMock);

describe("blog slug page", () => {
	it("renders a post without error when post is found", async () => {
		const wrapper = await mountSuspended(BlogSlug, {
			route: "/blog/wolfstar-v7",
		});
		expect(wrapper.html()).toBeTruthy();
		expect(wrapper.text()).toContain("WolfStar v7");
		expect(wrapper.text()).toContain("Announcement");
	});

	it("does not render the article when the post is not found", async () => {
		queryCollectionMock.mockReturnValueOnce(makeQueryChain(null));

		// The page calls createError(404, { fatal: true }) for a missing post, which
		// Nuxt surfaces as an error state rather than a rejection, so the article
		// content is never rendered.
		const wrapper = await mountSuspended(BlogSlug, { route: "/blog/missing" });

		expect(wrapper.text()).not.toContain("WolfStar v7");
	});
});
