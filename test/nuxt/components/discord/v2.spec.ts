import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordV2Separator from "~/components/discord/v2/separator.vue";
import DiscordV2TextDisplay from "~/components/discord/v2/text-display.vue";
import DiscordV2Thumbnail from "~/components/discord/v2/thumbnail.vue";

describe("DiscordV2TextDisplay", () => {
	it("keeps the line breaks of the message text (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordV2TextDisplay, {
			// A render function: a template string would condense the line break.
			slots: { default: () => "Currently at: Root\nUse the menu below." },
			attachTo: document.body,
		});

		// ASSERT
		expect((wrapper.element as HTMLElement).textContent).toBe(
			"Currently at: Root\nUse the menu below.",
		);

		wrapper.unmount();
	});

	it("renders a heading size as a heading when asked (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordV2TextDisplay, {
			props: { size: "heading-3", as: "h3" },
			slots: { default: "Core Configurations" },
		});

		// ASSERT
		expect(wrapper.find("h3").text()).toBe("Core Configurations");
	});

	it("stays a plain block without a size (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordV2TextDisplay, {
			slots: { default: "Plain text" },
		});

		// ASSERT
		expect(wrapper.element.tagName).toBe("DIV");
	});
});

describe("DiscordV2Separator", () => {
	it("spaces a large separator 8px from its neighbours (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordV2Separator, {
			props: { spacing: "large" },
			attachTo: document.body,
		});

		// ASSERT
		const style = getComputedStyle(wrapper.element);
		expect(style.marginTop).toBe("8px");
		expect(style.marginBottom).toBe("8px");

		wrapper.unmount();
	});

	it("spaces a small separator 4px from its neighbours (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordV2Separator, {
			attachTo: document.body,
		});

		// ASSERT
		expect(getComputedStyle(wrapper.element).marginTop).toBe("4px");
		expect(wrapper.attributes("role")).toBe("separator");

		wrapper.unmount();
	});
});

describe("DiscordV2Thumbnail", () => {
	it("draws an 85px square, as Discord does (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordV2Thumbnail, {
			props: { src: "/avatars/stella.png", alt: "Stella" },
			attachTo: document.body,
		});

		// ASSERT
		const image = wrapper.find("img");
		expect(image.attributes("alt")).toBe("Stella");
		const box = image.element.getBoundingClientRect();
		expect(box.width).toBe(85);
		expect(box.height).toBe(85);

		wrapper.unmount();
	});
});
