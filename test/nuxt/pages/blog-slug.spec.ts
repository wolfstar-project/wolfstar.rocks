import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import BlogSlug from "~/pages/(marketing)/blog/[slug].vue";

const mockPost = {
	path: "/blog/wolfstar-v7",
	title: "WolfStar v7",
	description: "Introducing WolfStar v7",
	date: "2024-01-01",
	author: "RedStar",
	draft: false,
	tags: [],
	body: { toc: { links: [] } },
};

function makeQueryChain(resolvedValue: unknown) {
	const chain: Record<string, unknown> = {};
	for (const method of ["where", "path", "limit", "skip"]) {
		chain[method] = () => chain;
	}
	// .order() is the final call in the surround chain — return a Promise
	// so Promise.all resolves it correctly instead of treating it as a plain object.
	chain["order"] = () => Promise.resolve(resolvedValue);
	chain["all"] = () => Promise.resolve(resolvedValue);
	chain["first"] = () => Promise.resolve(resolvedValue);
	return chain;
}

// Use vi.hoisted so the mock references are stable across the hoisting boundary
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
	});
});
