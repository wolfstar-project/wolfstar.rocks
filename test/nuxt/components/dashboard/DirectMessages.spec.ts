import { DashboardDirectMessages, DashboardDirectMessageThread } from "#components";
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MOCK_ANNOUNCEMENTS } from "~~/test/mocks/announcements";

registerEndpoint("/api/users/appeals", {
	method: "GET",
	handler: () => ({ entries: [], openCount: 2 }),
});

let failing = false;
registerEndpoint("/api/announcements/wolfstar", {
	method: "GET",
	handler: () => {
		if (failing) throw new Error("Discord is down");
		return MOCK_ANNOUNCEMENTS;
	},
});

describe("dashboard direct messages", () => {
	beforeEach(() => {
		failing = false;
		localStorage.removeItem("wolfstar-dm-read");
		clearNuxtState(["dm:posts", "dm:status"]);
		// Set directly: `useDirectMessages()` would start reading the posts here,
		// before a test decides how the endpoint answers.
		useState("dm:thread").value = "wolfstar";
		useState("home:page").value = "thread";
	});

	it("shows the announcement channel's posts and marks them read once open", async () => {
		const thread = await mountSuspended(DashboardDirectMessageThread);

		await vi.waitFor(() => expect(thread.findAll("article")).toHaveLength(2));
		expect(thread.text()).toContain("Dashboard v3");
		expect(thread.text()).toContain("@Moderator");
		expect(thread.text()).toContain("WolfStar v7");
		expect(thread.get('a[href="https://wolfstar.rocks/changelog"]').attributes("target")).toBe(
			"_blank",
		);
		await vi.waitFor(() => expect(useDirectMessages().totalUnread.value).toBe(0));
		thread.unmount();
	});

	it("shows Discord's count of each reaction", async () => {
		const thread = await mountSuspended(DashboardDirectMessageThread);

		await vi.waitFor(() =>
			expect(thread.find('ul[aria-label="Reactions"]').exists()).toBe(true),
		);
		expect(thread.get('ul[aria-label="Reactions"]').text()).toContain("🎉");
		expect(thread.get('ul[aria-label="Reactions"]').text()).toContain("12");
		thread.unmount();
	});

	it("counts every post unread before the first visit", async () => {
		const list = await mountSuspended(DashboardDirectMessages);

		await vi.waitFor(() => expect(useDirectMessages().totalUnread.value).toBe(2));
		expect(list.text()).toContain("WolfStar v7");
		list.unmount();
	});

	it("offers to load the posts again when Discord fails", async () => {
		failing = true;
		const thread = await mountSuspended(DashboardDirectMessageThread);

		await vi.waitFor(() => expect(thread.text()).toContain("couldn't be loaded"));
		failing = false;
		await thread.get("button").trigger("click");
		await vi.waitFor(() => expect(thread.findAll("article")).toHaveLength(2));
		thread.unmount();
	});

	it("filters the threads by name and opens one", async () => {
		const list = await mountSuspended(DashboardDirectMessages);

		await list.get('input[type="search"]').setValue("star");
		expect(list.findAll(".dm-row:not(.dm-row--page)")).toHaveLength(2);
		await list.get('input[type="search"]').setValue("staryl");
		expect(list.findAll(".dm-row:not(.dm-row--page)")).toHaveLength(1);

		await list.get(".dm-row:not(.dm-row--page)").trigger("click");
		expect(useDirectMessages().threadId.value).toBe("staryl");
		list.unmount();
	});

	it("switches the Home to the member's appeals, with how many cases can be appealed", async () => {
		const list = await mountSuspended(DashboardDirectMessages);
		const row = list.get(".dm-row--page");

		await vi.waitFor(() => expect(row.text()).toContain("2"));
		expect(row.text()).toContain("Appeals");
		expect(row.attributes("aria-current")).toBeUndefined();

		await row.trigger("click");
		expect(useDirectMessages().page.value).toBe("appeals");
		expect(row.attributes("aria-current")).toBe("page");

		await list.get(".dm-row:not(.dm-row--page)").trigger("click");
		expect(useDirectMessages().page.value).toBe("thread");
		list.unmount();
	});
});
