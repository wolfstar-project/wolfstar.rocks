import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordButton from "~/components/discord/button.vue";

describe("DiscordButton", () => {
	it("renders the label, variant class, and launch icon for link buttons (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordButton, {
			props: {
				label: "Open docs",
				variant: "link",
				url: "https://example.com",
				disabled: false,
			},
		});

		// ASSERT
		const button = wrapper.find(".discord-button");
		expect(button.exists()).toBe(true);
		expect(button.classes()).toContain("discord-button-link");
		expect(button.classes()).toContain("discord-button-hoverable");
		expect(button.classes()).not.toContain("discord-button-disabled");
		expect(button.text()).toContain("Open docs");
		expect(wrapper.find(".discord-button-launch").exists()).toBe(true);
		expect(button.attributes("aria-hidden")).toBe("true");
	});

	it("marks the button as disabled by default and ignores interactive styling (negative)", async () => {
		// ARRANGE / ACT — default `disabled` is true for showcase chrome
		const wrapper = await mountSuspended(DiscordButton, {
			props: { label: "Muted", variant: "primary" },
		});

		// ASSERT
		const button = wrapper.find(".discord-button");
		expect(button.classes()).toContain("discord-button-primary");
		expect(button.classes()).toContain("discord-button-disabled");
		expect(button.classes()).not.toContain("discord-button-hoverable");
		expect(wrapper.find(".discord-button-launch").exists()).toBe(false);
	});

	it("prefers slot content over the label prop (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordButton, {
			props: { label: "Fallback", disabled: false },
			slots: { default: "Slotted label" },
		});

		// ASSERT
		expect(wrapper.text()).toContain("Slotted label");
		expect(wrapper.text()).not.toContain("Fallback");
	});

	it("renders an image emoji when emoji is a path or URL (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordButton, {
			props: {
				label: "React",
				emoji: "/emojis/wave.png",
				emojiName: "wave",
				disabled: false,
			},
		});

		// ASSERT
		const img = wrapper.find("img.discord-button-emoji");
		expect(img.exists()).toBe(true);
		expect(img.attributes("alt")).toBe("wave");
		expect(img.attributes("src")).toBe("/emojis/wave.png");
	});

	it("does not treat a plain Iconify name as an image emoji (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordButton, {
			props: {
				label: "Gear",
				icon: "ph:gear-six-fill",
				emoji: "ph:gear-six-fill",
				disabled: false,
			},
		});

		// ASSERT
		expect(wrapper.find("img.discord-button-emoji").exists()).toBe(false);
		expect(wrapper.text()).toContain("Gear");
	});
});
