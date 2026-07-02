import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import BlogIndex from "~/pages/(marketing)/blog/index.vue";

const mockLanding = {
	path: "/blog",
	title: "The WolfStar Blog",
	description: "Read the latest news about WolfStar.",
	head: { title: "WolfStar Blog" },
};

const mockPosts = [
	{
		path: "/blog/wolfstar-v7",
		title: "WolfStar v7",
		description: "Introducing WolfStar v7",
		date: "2024-01-01",
		category: "Announcement",
		image: "/logo.svg",
		draft: false,
		tags: [],
		authors: [{ name: "RedStar" }],
	},
];

function makeQueryChain(resolvedValue: unknown) {
	const chain: Record<string, unknown> = {};
	for (const method of ["where", "order", "path", "limit", "skip"]) {
		chain[method] = () => chain;
	}
	chain["all"] = () => Promise.resolve(resolvedValue);
	chain["first"] = () => Promise.resolve(resolvedValue);
	return chain;
}

const { queryCollectionMock } = vi.hoisted(() => ({
	queryCollectionMock: vi.fn((collection: string) => {
		if (collection === "landing") {
			return makeQueryChain(mockLanding);
		}
		return makeQueryChain(mockPosts);
	}),
}));

mockNuxtImport("queryCollection", () => queryCollectionMock);

describe("blog index page", () => {
	it("renders without error", async () => {
		const wrapper = await mountSuspended(BlogIndex);
		expect(wrapper.html()).toBeTruthy();
		expect(wrapper.text()).toContain("WolfStar v7");
	});
});
