import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordChannelHeader from "~/components/discord/channel/header.vue";

describe("DiscordChannelHeader", () => {
	it("renders channel name, topic, online count, and toolbar labels (positive)", async () => {
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

		expect(wrapper.find(".discord-channel-header").exists()).toBe(true);
		expect(wrapper.text()).toContain("mod-commands");
		expect(wrapper.text()).toContain("Try a slash command below.");
		expect(wrapper.text()).toContain("19 Online");
		expect(wrapper.find(".discord-channel-header-badge").text()).toBe("48");
		const membersButton = wrapper
			.findAll(".discord-channel-header-action")
			.find((action) => action.attributes("aria-pressed") !== undefined);
		expect(membersButton?.attributes("aria-label")).toBe("Hide member list");
		expect(membersButton?.attributes("aria-pressed")).toBe("true");
	});

	it("emits members toggle events when the members toolbar button is clicked (positive)", async () => {
		const wrapper = await mountSuspended(DiscordChannelHeader, {
			props: { name: "mod-commands", membersOpen: true },
		});
		const membersButton = wrapper
			.findAll(".discord-channel-header-action")
			.find((action) => action.attributes("aria-pressed") !== undefined);

		await membersButton!.trigger("click");

		expect(wrapper.emitted("update:membersOpen")?.[0]).toEqual([false]);
		expect(wrapper.emitted("toggle-members")).toHaveLength(1);
	});

	it("shows Show member list when membersOpen is false (negative)", async () => {
		const wrapper = await mountSuspended(DiscordChannelHeader, {
			props: { name: "mod-commands", membersOpen: false },
		});

		const membersButton = wrapper
			.findAll(".discord-channel-header-action")
			.find((action) => action.attributes("aria-pressed") !== undefined);
		expect(membersButton?.attributes("aria-label")).toBe("Show member list");
		expect(membersButton?.attributes("aria-pressed")).toBe("false");
		expect(membersButton?.classes()).not.toContain("discord-channel-header-action-active");
	});

	it("emits open-channel-info from the mobile title button (positive)", async () => {
		const wrapper = await mountSuspended(DiscordChannelHeader, {
			props: { name: "mod-commands" },
		});

		await wrapper.find("button.discord-channel-header-mobile-title").trigger("click");

		expect(wrapper.emitted("open-channel-info")).toHaveLength(1);
		expect(
			wrapper.find("button.discord-channel-header-mobile-title").attributes("aria-label"),
		).toBe("Open channel info for #mod-commands");
	});

	it("hides the notification badge when notificationCount is zero (negative)", async () => {
		const wrapper = await mountSuspended(DiscordChannelHeader, {
			props: { name: "general", notificationCount: 0 },
		});

		expect(wrapper.find(".discord-channel-header-badge").exists()).toBe(false);
		expect(wrapper.find(".discord-channel-header-topic").exists()).toBe(false);
	});

	it("uses Discord desktop toolbar icon size (24px) on action glyphs (positive)", async () => {
		const wrapper = await mountSuspended(DiscordChannelHeader, {
			props: { name: "mod-commands" },
		});

		// Discord iconWrapper is 24×24; Tailwind size-6
		const actionIcons = wrapper
			.findAll(".discord-channel-header-action")
			.map((action) => action.find("[class*='size-6']"));
		expect(actionIcons).toHaveLength(4);
		for (const icon of actionIcons) {
			expect(icon.exists()).toBe(true);
		}
	});

	it("renders desktop search with left placeholder and right magnifier (positive)", async () => {
		const wrapper = await mountSuspended(DiscordChannelHeader, {
			props: {
				name: "mod-commands",
				searchPlaceholder: "Search WolfStar Laboratory",
			},
		});
		const search = wrapper.find(".discord-channel-header-search");
		const children = search.element.children;

		// Placeholder text left, magnifier icon right (Discord order)
		expect(search.exists()).toBe(true);
		expect(wrapper.find(".discord-channel-header-search-placeholder").text()).toBe(
			"Search WolfStar Laboratory",
		);
		expect(wrapper.find(".discord-channel-header-search-icon").exists()).toBe(true);
		expect(children[0]?.classList.contains("discord-channel-header-search-placeholder")).toBe(
			true,
		);
		expect(children[1]?.classList.contains("discord-channel-header-search-icon")).toBe(true);
	});
});
