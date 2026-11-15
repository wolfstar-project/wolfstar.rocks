import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordChannelHeader from "~/components/discord/channel/header.vue";

function findMembersButton(wrapper: VueWrapper) {
	return wrapper
		.findAll("button")
		.find((button) => button.attributes("aria-pressed") !== undefined);
}

describe("DiscordChannelHeader", () => {
	it("renders channel name, topic, online count, badge and toolbar labels (positive)", async () => {
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
		expect(wrapper.find("header.discord-channel-header").exists()).toBe(true);
		expect(wrapper.text()).toContain("mod-commands");
		expect(wrapper.text()).toContain("Try a slash command below.");
		expect(wrapper.text()).toContain("19 Online");
		expect(wrapper.find("[data-slot='notification-badge']").text()).toBe("48");
		const labels = wrapper
			.findAll("button[aria-label]")
			.map((button) => button.attributes("aria-label"));
		expect(labels).toEqual(
			expect.arrayContaining([
				"Threads",
				"Notification settings",
				"Pinned messages",
				"Hide member list",
			]),
		);
		const membersButton = findMembersButton(wrapper);
		expect(membersButton?.attributes("aria-label")).toBe("Hide member list");
		expect(membersButton?.attributes("aria-pressed")).toBe("true");
		expect(membersButton?.attributes("data-state")).toBe("active");
	});

	it("emits members toggle events when the members toolbar button is clicked (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordChannelHeader, {
			props: { name: "mod-commands", membersOpen: true },
		});

		// ACT
		await findMembersButton(wrapper)!.trigger("click");

		// ASSERT
		expect(wrapper.emitted("update:membersOpen")?.[0]).toEqual([false]);
		expect(wrapper.emitted("toggle-members")).toHaveLength(1);
	});

	it("shows Show member list when membersOpen is false (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChannelHeader, {
			props: { name: "mod-commands", membersOpen: false },
		});

		// ASSERT
		const membersButton = findMembersButton(wrapper);
		expect(membersButton?.attributes("aria-label")).toBe("Show member list");
		expect(membersButton?.attributes("aria-pressed")).toBe("false");
		expect(membersButton?.attributes("data-state")).toBe("inactive");
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
		expect(title.exists()).toBe(true);
		expect(wrapper.emitted("open-channel-info")).toHaveLength(1);
	});

	it("hides the notification badge and online count when they are not set (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChannelHeader, {
			props: { name: "general", notificationCount: 0 },
		});

		// ASSERT
		expect(wrapper.find("[data-slot='notification-badge']").exists()).toBe(false);
		expect(wrapper.text()).not.toContain("Online");
	});

	it("renders the search field as decoration, out of the tab order (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChannelHeader, {
			props: {
				name: "mod-commands",
				searchPlaceholder: "Search WolfStar Laboratory",
			},
		});
		const search = wrapper
			.findAll("button")
			.find((button) => button.text() === "Search WolfStar Laboratory");

		// ASSERT
		expect(search?.attributes("aria-hidden")).toBe("true");
		expect(search?.attributes("tabindex")).toBe("-1");
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
