import type { VueWrapper } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UpdatesIndex from "~/pages/(marketing)/updates/index.vue";

const alphaPost = {
	path: "/blog/wolfstar-v7-alpha",
	title: "The alpha is live",
	description: "Notes, a honeypot channel, and settings export.",
	date: "2026-10-12",
	category: "Release",
	image: "/logo.svg",
	authors: [{ name: "RedStar" }],
	readingTime: 3,
};

const proposalPost = {
	path: "/blog/wolfstar-v7",
	title: "A network of single-purpose bots",
	description: "A proposal for the WolfStar network.",
	date: "2024-02-25",
	category: "Announcement",
	authors: [{ name: "RedStar" }],
};

const redesignEntry = {
	path: "/changelog/homepage-redesign",
	title: "Redesigned homepages",
	description: "Both bot landing pages got a visual pass.",
	date: "2026-08-25",
	kind: "improved",
};

function makeQueryChain(resolvedValue: unknown) {
	const chain: Record<string, unknown> = {};
	for (const method of ["where", "order", "select", "limit"]) {
		chain[method] = () => chain;
	}
	chain["all"] = () => Promise.resolve(resolvedValue);
	return chain;
}

const { content, queryCollectionMock } = vi.hoisted(() => {
	const content: Record<string, unknown[]> = { blog: [], changelog: [] };
	return {
		content,
		queryCollectionMock: vi.fn((collection: string) => makeQueryChain(content[collection])),
	};
});

mockNuxtImport("queryCollection", () => queryCollectionMock);

// A mounted page keeps its `useAsyncData` entries alive, and the next mount would
// read them instead of asking for the content again.
const mounted: VueWrapper[] = [];

async function mountUpdates(route = "/updates") {
	const wrapper = await mountSuspended(UpdatesIndex, { route });
	mounted.push(wrapper);
	return wrapper;
}

function categoryLinks(wrapper: VueWrapper) {
	return wrapper
		.get('nav[aria-label="Post categories"]')
		.findAll("a")
		.map((link) => link.text());
}

describe("updates page", () => {
	beforeEach(() => {
		content.blog = [alphaPost, proposalPost];
		content.changelog = [redesignEntry];
	});

	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	it("lists each post with its category, date and reading time", async () => {
		const wrapper = await mountUpdates();

		const card = wrapper.get(`a[href="${alphaPost.path}"]`).element.closest("article");
		expect(card?.textContent).toContain("The alpha is live");
		expect(card?.textContent).toContain("Release");
		expect(card?.textContent).toContain("Oct 12, 2026");
		expect(card?.textContent).toContain("3 min read");
		expect(wrapper.text()).toContain("A network of single-purpose bots");
	});

	it("leaves the reading time out of a post that has none", async () => {
		const wrapper = await mountUpdates();

		const card = wrapper.get(`a[href="${proposalPost.path}"]`).element.closest("article");
		expect(card?.textContent).not.toContain("min read");
	});

	it("links a changelog entry to its place on the changelog page", async () => {
		const wrapper = await mountUpdates();

		const entry = wrapper.get('a[href="/changelog#homepage-redesign"]');
		expect(entry.text()).toContain("Redesigned homepages");
		expect(entry.text()).toContain("Improved");
	});

	it("leaves the changelog out when it has no entry", async () => {
		content.changelog = [];

		const wrapper = await mountUpdates();

		expect(wrapper.find("#changelog-heading").exists()).toBe(false);
		expect(wrapper.text()).toContain("The alpha is live");
	});

	it("offers only the categories a post uses", async () => {
		const wrapper = await mountUpdates();

		expect(categoryLinks(wrapper)).toEqual(["All", "Releases", "Announcements"]);
	});

	it("lists only the posts of the category in the address", async () => {
		const wrapper = await mountUpdates("/updates?category=announcement");

		expect(wrapper.text()).toContain("A network of single-purpose bots");
		expect(wrapper.text()).not.toContain("The alpha is live");
		expect(wrapper.get('nav a[aria-current="true"]').text()).toBe("Announcements");
	});

	it("lists every post when no post uses the category in the address", async () => {
		const wrapper = await mountUpdates("/updates?category=tutorial");

		expect(wrapper.text()).toContain("The alpha is live");
		expect(wrapper.text()).toContain("A network of single-purpose bots");
		expect(wrapper.get('nav a[aria-current="true"]').text()).toBe("All");
	});

	it("points to the changelog when there is no post", async () => {
		content.blog = [];

		const wrapper = await mountUpdates();

		expect(wrapper.text()).toContain("No posts yet");
		expect(wrapper.findAll('a[href="/changelog"]').length).toBeGreaterThan(0);
	});
});
