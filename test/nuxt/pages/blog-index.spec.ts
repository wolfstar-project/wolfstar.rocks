import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import BlogIndex from "~/pages/(marketing)/blog/index.vue";

const mockPosts = [
	{
		path: "/blog/wolfstar-v7",
		title: "WolfStar v7",
		description: "Introducing WolfStar v7",
		date: "2024-01-01",
		author: "RedStar",
		draft: false,
		tags: [],
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

mockNuxtImport("queryCollection", () => () => makeQueryChain(mockPosts));

describe("blog index page", () => {
	it("renders without error", async () => {
		const wrapper = await mountSuspended(BlogIndex);
		expect(wrapper.html()).toBeTruthy();
	});
});
