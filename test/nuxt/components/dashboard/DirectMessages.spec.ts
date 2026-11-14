import { DashboardDirectMessages, DashboardDirectMessageThread } from "#components";
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import {
	MOCK_ANNOUNCEMENTS,
	MOCK_APP_INVITE,
	MOCK_COMPONENTS_V2,
} from "~~/test/mocks/announcements";

registerEndpoint("/api/users/appeals", {
	method: "GET",
	handler: () => ({ entries: [], openCount: 2 }),
});

let failing = false;
let posts = MOCK_ANNOUNCEMENTS;
registerEndpoint("/api/announcements/wolfstar", {
	method: "GET",
	handler: () => {
		if (failing) throw new Error("Discord is down");
		return posts;
	},
});

describe("dashboard direct messages", () => {
	// A desktop's Home, where the thread is on screen: a phone's list keeps the
	// thread mounted but hidden, and marks nothing read (its own test, below).
	beforeAll(async () => {
		await page.viewport(1280, 900);
	});

	beforeEach(() => {
		failing = false;
		posts = MOCK_ANNOUNCEMENTS;
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
		// A name with a space is still a mention, not the raw `<@…>`.
		expect(thread.text()).toContain("@Jane Doe");
		expect(thread.text()).not.toContain("<@");
		expect(thread.text()).toContain("WolfStar v7");
		expect(thread.get('a[href="https://wolfstar.rocks/changelog"]').attributes("target")).toBe(
			"_blank",
		);
		await vi.waitFor(() => expect(useDirectMessages().totalUnread.value).toBe(0));
		thread.unmount();
	});

	// The message display of the preferences, as Discord's compact mode: no
	// avatar, and the time ahead of the name.
	it("draws the posts compact when the message display is", async () => {
		useLogDensity().value = "compact";
		const thread = await mountSuspended(DashboardDirectMessageThread);

		await vi.waitFor(() => expect(thread.findAll("article")).toHaveLength(2));
		const post = thread.get("article");
		expect(post.find("[data-slot='message-avatar']").exists()).toBe(false);
		expect(post.get("time").classes()).toContain("order-first");

		useLogDensity().value = "cozy";
		thread.unmount();
	});

	it("shows Discord's count of each reaction", async () => {
		const thread = await mountSuspended(DashboardDirectMessageThread);

		await vi.waitFor(() =>
			expect(thread.find('[role="group"][aria-label="Reactions"]').exists()).toBe(true),
		);
		expect(thread.get('[role="group"][aria-label="Reactions"]').text()).toContain("🎉");
		expect(thread.get('[role="group"][aria-label="Reactions"]').text()).toContain("12");
		expect(
			thread.get('[role="img"][aria-label="wolf, 1 reaction"] img').attributes("src"),
		).toBe("https://cdn.discordapp.com/emojis/700000000000000001.webp?size=48");
		thread.unmount();
	});

	it("counts every post unread before the first visit", async () => {
		const list = await mountSuspended(DashboardDirectMessages);

		await vi.waitFor(() => expect(useDirectMessages().totalUnread.value).toBe(2));
		expect(list.text()).toContain("WolfStar v7");
		list.unmount();
	});

	// The row carries the name the posts are signed with on Discord.
	it("lists WolfStar's thread as WolfStar Announcements", async () => {
		const list = await mountSuspended(DashboardDirectMessages);

		await vi.waitFor(() => expect(list.text()).toContain("WolfStar Announcements"));
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

	// The announcements write their details as indented items, which Discord
	// draws as a list of their own under the item above.
	it("nests an indented list item under the one above it", async () => {
		posts = [
			{
				...MOCK_ANNOUNCEMENTS[1]!,
				content: "- Removed `/permission-nodes`.\n  - If your server still has old nodes",
			},
		];
		const thread = await mountSuspended(DashboardDirectMessageThread);

		await vi.waitFor(() => expect(thread.findAll("article")).toHaveLength(1));
		const nested = thread.get("ul > li > ul > li");
		expect(nested.text()).toBe("If your server still has old nodes");
		expect(thread.get("ul > li").text()).toContain("Removed");
		thread.unmount();
	});

	// Discord unfurls an app's invite link into its card, under the post.
	it("draws an invited app's card with a link to invite it", async () => {
		const { url } = MOCK_APP_INVITE;
		posts = [
			{
				...MOCK_ANNOUNCEMENTS[1]!,
				apps: [MOCK_APP_INVITE],
				content: `Re-invite her with ${url}`,
			},
		];
		const thread = await mountSuspended(DashboardDirectMessageThread);

		await vi.waitFor(() => expect(thread.findAll("article article")).toHaveLength(1));
		const card = thread.get("article article");
		expect(card.text()).toContain("WolfStar Alpha");
		expect(card.text()).toContain("Moderation, in alpha.");
		const invite = card.get(`a[href="${url}"]`);
		expect(invite.text()).toBe("Invite WolfStar Alpha");
		expect(invite.attributes("target")).toBe("_blank");
		thread.unmount();
	});

	// A post sent with Components V2 has no content: its layout is all it shows.
	it("draws a Components V2 post's container and its link buttons", async () => {
		posts = [{ ...MOCK_ANNOUNCEMENTS[1]!, components: MOCK_COMPONENTS_V2, embeds: [] }];
		const thread = await mountSuspended(DashboardDirectMessageThread);

		await vi.waitFor(() => expect(thread.findAll("article")).toHaveLength(1));
		const post = thread.get("article");
		expect(post.text()).toContain("@Subscribers");
		expect(post.get("h2, h3, h4").text()).toBe("wolfstar.rocks v0.16.0 preview");
		const notes = post.get('a[href="https://wolfstar.rocks/changelog"]');
		expect(notes.text()).toBe("Release notes");
		expect(notes.attributes("target")).toBe("_blank");
		thread.unmount();
	});

	it("previews a newest post of images alone as one, not as no messages", async () => {
		posts = [
			...MOCK_ANNOUNCEMENTS,
			{
				...MOCK_ANNOUNCEMENTS[1]!,
				content: "",
				embeds: [],
				id: "1290000000000000003",
				images: [{ height: 600, url: "https://cdn.discordapp.com/a.png", width: 800 }],
			},
		];
		const list = await mountSuspended(DashboardDirectMessages);

		const wolfstar = () =>
			list
				.findAll(".dm-row:not(.dm-row--page)")
				.find((row) => row.text().includes("WolfStar"));
		await vi.waitFor(() => expect(wolfstar()?.text()).toContain("Sent an image"));
		expect(wolfstar()?.text()).not.toContain("No messages yet");
		list.unmount();
	});

	it("marks nothing read on a phone's list, where the thread is hidden", async () => {
		await page.viewport(390, 844);
		const thread = await mountSuspended(DashboardDirectMessageThread);

		await vi.waitFor(() => expect(thread.findAll("article")).toHaveLength(2));
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(useDirectMessages().totalUnread.value).toBe(2);
		thread.unmount();
		await page.viewport(1280, 900);
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
