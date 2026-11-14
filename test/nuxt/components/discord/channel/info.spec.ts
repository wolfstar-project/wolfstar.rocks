import type { VueWrapper } from "@vue/test-utils";
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

function findTab(wrapper: VueWrapper, label: string) {
	const tab = wrapper.findAll("[role='tab']").find((candidate) => candidate.text() === label);
	if (!tab) {
		throw new Error(`No tab named ${label}`);
	}
	return tab;
}

function membersRegion(wrapper: VueWrapper) {
	return wrapper.find("aside[aria-label='Members in #mod-commands']");
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
		expect(findTab(wrapper, "Members").attributes("aria-selected")).toBe("true");
		expect(membersRegion(wrapper).exists()).toBe(true);
		expect(wrapper.text()).toContain("WolfStar");
		expect(document.activeElement?.getAttribute("aria-label")).toBe("Back to channel");
	});

	it("links the selected tab to its panel (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountInfo();
		const membersTab = findTab(wrapper, "Members");
		const panel = wrapper.find("[role='tabpanel']");

		// ASSERT
		expect(membersTab.attributes("aria-controls")).toBe(panel.attributes("id"));
		expect(panel.attributes("aria-labelledby")).toBe(membersTab.attributes("id"));
	});

	it("switches tabs on press and shows the empty state for non-members panels (positive)", async () => {
		// ARRANGE
		const wrapper = await mountInfo();

		// ACT
		await findTab(wrapper, "Threads").trigger("mousedown", { button: 0 });

		// ASSERT
		expect(findTab(wrapper, "Threads").attributes("aria-selected")).toBe("true");
		expect(membersRegion(wrapper).exists()).toBe(false);
		expect(wrapper.text()).toContain("There are no threads.");
		expect(
			wrapper
				.findAll("button")
				.find((button) => button.text() === "Create Thread")
				?.attributes("disabled"),
		).toBeDefined();
	});

	it("moves focus and selection across tabs with arrow keys (positive)", async () => {
		// ARRANGE
		const wrapper = await mountInfo();
		const membersTab = findTab(wrapper, "Members");
		(membersTab.element as HTMLElement).focus();

		// ACT
		await membersTab.trigger("keydown", { key: "ArrowRight" });

		// ASSERT
		expect(findTab(wrapper, "Media").attributes("aria-selected")).toBe("true");
		expect(document.activeElement).toBe(findTab(wrapper, "Media").element);
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

	it("keeps the decorative toolbar actions out of the tab order (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountInfo();
		const decorative = wrapper.findAll("[aria-hidden='true'] button");

		// ASSERT
		expect(decorative).toHaveLength(3);
		for (const button of decorative) {
			expect(button.attributes("tabindex")).toBe("-1");
		}
	});

	it("does not change tabs for unrelated keys (negative)", async () => {
		// ARRANGE
		const wrapper = await mountInfo({ initialTab: "members" });
		const membersTab = findTab(wrapper, "Members");

		// ACT
		await membersTab.trigger("keydown", { key: "a" });

		// ASSERT
		expect(membersTab.attributes("aria-selected")).toBe("true");
		expect(membersRegion(wrapper).exists()).toBe(true);
	});

	it("shows the empty search copy for media instead of members (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountInfo({ initialTab: "media" });

		// ASSERT
		expect(findTab(wrapper, "Media").attributes("aria-selected")).toBe("true");
		expect(membersRegion(wrapper).exists()).toBe(false);
		expect(wrapper.text()).toContain("Unfortunately, no results were found.");
	});
});
