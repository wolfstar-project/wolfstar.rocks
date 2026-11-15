import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordChannelHeader from "~/components/discord/channel/header.vue";

function findMembersButton(wrapper: VueWrapper) {
	return wrapper.find("button[aria-pressed]");
}

/** Names of the controls a keyboard or a screen reader can reach. */
function controlNames(wrapper: VueWrapper) {
	return wrapper
		.findAll("button")
		.map((button) => button.attributes("aria-label") ?? button.text());
}

describe("DiscordChannelHeader", () => {
	it("renders channel name, topic, online count and badge (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChannelHeader, {
			props: {
				name: "mod-commands",
				type: "text",
				topic: "Try a slash command below.",
				searchPlaceholder: "Search",
				onlineCount: 19,
				notificationCount: 48,
				membersOpen: true,
			},
		});

		// ASSERT
		expect(wrapper.text()).toContain("mod-commands");
		expect(wrapper.text()).toContain("Try a slash command below.");
		expect(wrapper.text()).toContain("19 Online");
		const badge = wrapper
			.findAll("[aria-hidden='true']")
			.find((element) => element.text() === "48");
		expect(badge?.exists()).toBe(true);
	});

	it("renders a div, so the bar adds no banner landmark (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChannelHeader, {
			props: { name: "mod-commands" },
		});

		// ASSERT
		expect(wrapper.find("header").exists()).toBe(false);
		expect(wrapper.find("[role='banner']").exists()).toBe(false);
	});

	it("reaches only the controls that work in the showcase (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChannelHeader, {
			props: { name: "mod-commands", searchPlaceholder: "Search WolfStar Laboratory" },
		});

		// ASSERT
		expect(controlNames(wrapper)).toEqual([
			"Open channel info for #mod-commands",
			"Show member list",
		]);
		expect(wrapper.find("[tabindex]").exists()).toBe(false);
	});

	it("keeps the search and the other toolbar actions as decoration (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChannelHeader, {
			props: { name: "mod-commands", searchPlaceholder: "Search WolfStar Laboratory" },
		});
		const searches = wrapper
			.findAll("[aria-hidden='true']")
			.filter((element) => element.text() === "Search WolfStar Laboratory");

		// ASSERT
		expect(searches).toHaveLength(2);
		for (const search of searches) {
			expect(search.element.tagName).toBe("SPAN");
		}
	});

	it("reports the member list toggle state with aria-pressed and a fixed label (positive)", async () => {
		// ARRANGE / ACT
		const open = await mountSuspended(DiscordChannelHeader, {
			props: { name: "mod-commands", membersOpen: true },
		});
		const closed = await mountSuspended(DiscordChannelHeader, {
			props: { name: "mod-commands", membersOpen: false },
		});

		// ASSERT
		expect(findMembersButton(open).attributes("aria-label")).toBe("Show member list");
		expect(findMembersButton(open).attributes("aria-pressed")).toBe("true");
		expect(findMembersButton(closed).attributes("aria-label")).toBe("Show member list");
		expect(findMembersButton(closed).attributes("aria-pressed")).toBe("false");
	});

	it("emits members toggle events when the members toolbar button is clicked (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordChannelHeader, {
			props: { name: "mod-commands", membersOpen: true },
		});

		// ACT
		await findMembersButton(wrapper).trigger("click");

		// ASSERT
		expect(wrapper.emitted("update:membersOpen")?.[0]).toEqual([false]);
		expect(wrapper.emitted("toggle-members")).toHaveLength(1);
	});

	it("emits open-channel-info from the mobile title button (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordChannelHeader, {
			props: { name: "mod-commands" },
		});
		const title = wrapper.find("button[aria-label='Open channel info for #mod-commands']");

		// ACT
		await title.trigger("click");

		// ASSERT
		expect(title.text()).toContain("mod-commands");
		expect(wrapper.emitted("open-channel-info")).toHaveLength(1);
	});

	it("hides the notification badge and online count when they are not set (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChannelHeader, {
			props: { name: "general", notificationCount: 0 },
		});

		// ASSERT
		expect(wrapper.text()).not.toMatch(/\d/);
		expect(wrapper.text()).not.toContain("Online");
	});

	it("prefers the guild name over the plain search placeholder (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChannelHeader, {
			props: { name: "mod-commands", guildName: "WolfStar Laboratory" },
		});

		// ASSERT
		expect(wrapper.text()).toContain("Search WolfStar Laboratory");
	});
});
