import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordButton from "~/components/discord/button.vue";

describe("DiscordButton", () => {
	it("renders the label and the launch icon for link buttons, hidden from assistive technology (positive)", async () => {
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
		expect(button.text()).toContain("Open docs");
		expect(button.find("svg").exists()).toBe(true);
		expect(button.attributes("aria-hidden")).toBe("true");
		// Chrome, never a control: nothing to focus, nothing to follow.
		expect(button.element.tagName).toBe("SPAN");
		expect(button.attributes("href")).toBeUndefined();
	});

	it("draws the launch icon on any button with a url (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordButton, {
			props: { label: "Watch", variant: "secondary", url: "https://example.com" },
		});

		// ASSERT
		expect(wrapper.find("svg").exists()).toBe(true);
	});

	it("takes no pointer by default and draws no launch icon without a url (negative)", async () => {
		// ARRANGE / ACT — default `disabled` is true for showcase chrome
		const wrapper = await mountSuspended(DiscordButton, {
			props: { label: "Muted", variant: "primary" },
		});

		// ASSERT
		const button = wrapper.find(".discord-button");
		expect(button.classes()).toContain("pointer-events-none");
		expect(button.find("svg").exists()).toBe(false);
	});

	it("takes the pointer when it is not disabled (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordButton, {
			props: { label: "Hover me", disabled: false },
		});

		// ASSERT
		expect(wrapper.find(".discord-button").classes()).not.toContain("pointer-events-none");
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
		const img = wrapper.find("img");
		expect(img.attributes("alt")).toBe("wave");
		expect(img.attributes("src")).toBe("/emojis/wave.png");
	});

	it("is 32px high, as a button in a message is (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordButton, {
			props: { label: "Confirm", variant: "primary" },
			attachTo: document.body,
		});

		// ASSERT
		expect(wrapper.find(".discord-button").element.getBoundingClientRect().height).toBe(32);

		wrapper.unmount();
	});

	it("keeps a gap between the icon and the label (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordButton, {
			props: { label: "Stop", variant: "danger", icon: "ph:stop-fill" },
			attachTo: document.body,
		});

		// ASSERT
		const button = wrapper.find(".discord-button").element;
		const [icon, label] = Array.from(button.children, (child) => child.getBoundingClientRect());
		expect(label!.left - icon!.right).toBeGreaterThanOrEqual(8);

		wrapper.unmount();
	});

	it("centres the icon of a button with no label (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordButton, {
			props: { icon: "twemoji:counterclockwise-arrows-button" },
			attachTo: document.body,
		});

		// ASSERT: no empty label box pushes the icon off centre.
		const button = wrapper.find(".discord-button").element;
		expect(button.textContent?.trim()).toBe("");
		const box = button.getBoundingClientRect();
		const icon = button.firstElementChild!.getBoundingClientRect();
		expect(
			Math.abs(icon.left + icon.width / 2 - (box.left + box.width / 2)),
		).toBeLessThanOrEqual(1);

		wrapper.unmount();
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
		expect(wrapper.find("img").exists()).toBe(false);
		expect(wrapper.text()).toContain("Gear");
	});
});
