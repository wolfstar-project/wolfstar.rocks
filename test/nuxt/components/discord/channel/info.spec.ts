import type { DiscordMemberListMember } from "~/types/discord";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordChannelInfo from "~/components/discord/channel/info.vue";

const online: DiscordMemberListMember[] = [
	{ id: "1", name: "WolfStar", app: true, verified: true },
];
const offline: DiscordMemberListMember[] = [{ id: "2", name: "Stella" }];

function mountInfo(
	props: Partial<{ name: string; initialTab: "members" | "threads" | "media" }> = {},
) {
	return mountSuspended(DiscordChannelInfo, {
		props: {
			name: "mod-commands",
			online,
			offline,
			...props,
		},
		attachTo: document.body,
	});
}

describe("DiscordChannelInfo", () => {
	it("opens as a dialog on Members with the member list visible (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountInfo();

		// ASSERT
		const dialog = wrapper.find("[role='dialog']");
		expect(dialog.attributes("aria-modal")).toBe("true");
		expect(dialog.attributes("aria-label")).toBe("Channel information for #mod-commands");
		expect(wrapper.find("[role='tablist']").attributes("aria-label")).toBe(
			"Channel information sections",
		);
		const membersTab = wrapper.find("#discord-channel-info-tab-members");
		expect(membersTab.attributes("aria-selected")).toBe("true");
		expect(wrapper.find(".discord-channel-info-members").exists()).toBe(true);
		expect(wrapper.text()).toContain("WolfStar");
	});

	it("switches tabs on click and shows empty state for non-members panels (positive)", async () => {
		// ARRANGE
		const wrapper = await mountInfo();

		// ACT
		await wrapper.find("#discord-channel-info-tab-threads").trigger("click");

		// ASSERT
		expect(wrapper.find("#discord-channel-info-tab-threads").attributes("aria-selected")).toBe(
			"true",
		);
		expect(wrapper.find(".discord-channel-info-members").exists()).toBe(false);
		expect(wrapper.text()).toContain("There are no threads.");
	});

	it("moves focus across tabs with arrow keys (positive)", async () => {
		// ARRANGE
		const wrapper = await mountInfo();
		const membersTab = wrapper.find("#discord-channel-info-tab-members");

		// ACT
		await membersTab.trigger("keydown", { key: "ArrowRight" });

		// ASSERT
		expect(wrapper.find("#discord-channel-info-tab-media").attributes("aria-selected")).toBe(
			"true",
		);
		expect(document.activeElement?.id).toBe("discord-channel-info-tab-media");
	});

	it("emits close from the back button and Escape (positive)", async () => {
		// ARRANGE
		const wrapper = await mountInfo();

		// ACT
		await wrapper.find("button[aria-label='Back to channel']").trigger("click");
		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
		await wrapper.vm.$nextTick();

		// ASSERT
		expect(wrapper.emitted("close")?.length).toBeGreaterThanOrEqual(2);
	});

	it("does not change tabs for unrelated keys (negative)", async () => {
		// ARRANGE
		const wrapper = await mountInfo({ initialTab: "members" });
		const membersTab = wrapper.find("#discord-channel-info-tab-members");

		// ACT
		await membersTab.trigger("keydown", { key: "a" });

		// ASSERT
		expect(membersTab.attributes("aria-selected")).toBe("true");
		expect(wrapper.find(".discord-channel-info-members").exists()).toBe(true);
	});

	it("shows the empty search copy for media instead of members (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountInfo({ initialTab: "media" });

		// ASSERT
		expect(wrapper.find(".discord-channel-info-members").exists()).toBe(false);
		expect(wrapper.text()).toContain("Unfortunately, no results were found.");
	});
});
