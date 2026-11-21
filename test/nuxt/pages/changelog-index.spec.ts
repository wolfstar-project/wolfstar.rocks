import type { VueWrapper } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChangelogIndex from "~/pages/(marketing)/changelog/index.vue";

const sessionFix = {
	path: "/changelog/oauth-session-fix",
	title: "Fixed a false session error",
	description: "The callback page could claim your session was missing.",
	date: "2026-08-24",
	kind: "fixed",
	authors: [],
};

const release = {
	path: "/changelog/rocks-v2",
	title: "wolfstar.rocks v2.0",
	description: "Authentication moved to Better Auth.",
	date: "2026-08-20",
	kind: "new",
	authors: [{ name: "RedStar" }],
};

function makeQueryChain(resolvedValue: unknown) {
	const chain: Record<string, unknown> = {};
	chain["order"] = () => chain;
	chain["all"] = () => Promise.resolve(resolvedValue);
	return chain;
}

const { content, queryCollectionMock } = vi.hoisted(() => {
	const content: { entries: unknown[] } = { entries: [] };
	return {
		content,
		queryCollectionMock: vi.fn(() => makeQueryChain(content.entries)),
	};
});

mockNuxtImport("queryCollection", () => queryCollectionMock);

// A mounted page keeps its `useAsyncData` entries alive, and the next mount would
// read them instead of asking for the content again.
const mounted: VueWrapper[] = [];

async function mountChangelog() {
	const wrapper = await mountSuspended(ChangelogIndex, { route: "/changelog" });
	mounted.push(wrapper);
	return wrapper;
}

describe("changelog page", () => {
	beforeEach(() => {
		content.entries = [sessionFix, release];
	});

	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	it("gives each entry the anchor its links point to", async () => {
		const wrapper = await mountChangelog();

		expect(wrapper.get("#oauth-session-fix").text()).toContain("Fixed a false session error");
		expect(wrapper.get("#rocks-v2").text()).toContain("wolfstar.rocks v2.0");
	});

	it("says what kind of change an entry is, and who made it", async () => {
		const wrapper = await mountChangelog();

		expect(wrapper.get("#oauth-session-fix").text()).toContain("Fixed");
		expect(wrapper.get("#rocks-v2").text()).toContain("New");
		expect(wrapper.get("#rocks-v2").text()).toContain("RedStar");
	});

	it("points to the GitHub releases when there is no entry", async () => {
		content.entries = [];

		const wrapper = await mountChangelog();

		expect(wrapper.text()).toContain("No changelog entries yet");
		// One in the page's header, one as the action of the empty list.
		expect(
			wrapper.findAll(
				'a[href="https://github.com/wolfstar-project/wolfstar.rocks/releases"]',
			),
		).toHaveLength(2);
	});
});
