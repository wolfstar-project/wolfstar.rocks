import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordScrollbar from "~/components/discord/scrollbar.vue";

describe("DiscordScrollbar", () => {
	it("renders viewport, track, and slotted content (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordScrollbar, {
			props: { alwaysShowTrack: true },
			slots: { default: "<p class='scroll-item'>Tall content</p>" },
		});

		// ASSERT
		expect(wrapper.find(".discord-scrollbar").exists()).toBe(true);
		expect(wrapper.find(".discord-scrollbar-viewport").exists()).toBe(true);
		expect(wrapper.find(".discord-scrollbar-track").exists()).toBe(true);
		expect(wrapper.find(".discord-scrollbar-track").attributes("aria-hidden")).toBe("true");
		expect(wrapper.find(".scroll-item").text()).toBe("Tall content");
	});

	it("shows arrow controls when showArrows is enabled (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordScrollbar, {
			props: { showArrows: true, alwaysShowTrack: true },
			slots: { default: "<div style='height: 400px'>overflow</div>" },
		});

		// ASSERT
		expect(wrapper.find(".discord-scrollbar-with-arrows").exists()).toBe(true);
		expect(wrapper.find(".discord-scrollbar-arrow-up").exists()).toBe(true);
		expect(wrapper.find(".discord-scrollbar-arrow-down").exists()).toBe(true);
		expect(wrapper.find(".discord-scrollbar-arrow-up").attributes("aria-hidden")).toBe("true");
	});

	it("omits arrow controls by default (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordScrollbar, {
			slots: { default: "<p>short</p>" },
		});

		// ASSERT
		expect(wrapper.find(".discord-scrollbar-with-arrows").exists()).toBe(false);
		expect(wrapper.find(".discord-scrollbar-arrow-up").exists()).toBe(false);
		expect(wrapper.find(".discord-scrollbar-arrow-down").exists()).toBe(false);
	});

	it("applies auto-hide class and renders below-viewport slot (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordScrollbar, {
			props: { autoHide: true },
			slots: {
				"default": "<p>list</p>",
				"below-viewport": "<nav class='rail'>rail</nav>",
			},
		});

		// ASSERT
		expect(wrapper.find(".discord-scrollbar-auto-hide").exists()).toBe(true);
		expect(wrapper.find(".discord-scrollbar-with-below-viewport").exists()).toBe(true);
		expect(wrapper.find(".discord-scrollbar-below-viewport .rail").text()).toBe("rail");
	});

	it("does not render a below-viewport region when that slot is empty (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordScrollbar, {
			slots: { default: "<p>only viewport</p>" },
		});

		// ASSERT
		expect(wrapper.find(".discord-scrollbar-below-viewport").exists()).toBe(false);
		expect(wrapper.find(".discord-scrollbar-with-below-viewport").exists()).toBe(false);
	});

	it("exposes Discord floating-pill scrollbar tokens (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordScrollbar, {
			props: { alwaysShowTrack: true },
			slots: { default: "<p>content</p>" },
		});
		const root = wrapper.find(".discord-scrollbar").element as HTMLElement;
		const styles = getComputedStyle(root);

		// ASSERT — matches Discord dark thumb geometry from reference crops
		expect(styles.getPropertyValue("--discord-scrollbar-thumb-width").trim()).toBe("5px");
		expect(styles.getPropertyValue("--discord-scrollbar-edge-inset").trim()).toBe("3px");
		expect(styles.getPropertyValue("--discord-scrollbar-end-inset").trim()).toBe("4px");
		expect(wrapper.find(".discord-scrollbar-thumb").classes()).toContain("rounded-full");
	});
});
