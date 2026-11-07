import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
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
		// ARRANGE / ACT — attach to the document so getComputedStyle resolves the
		// scoped tokens; a detached element reports empty computed styles.
		const wrapper = await mountSuspended(DiscordScrollbar, {
			props: { alwaysShowTrack: true },
			slots: { default: "<p>content</p>" },
			attachTo: document.body,
		});
		const root = wrapper.find(".discord-scrollbar").element as HTMLElement;
		const styles = getComputedStyle(root);

		// ASSERT — matches Discord dark thumb geometry from reference crops
		expect(styles.getPropertyValue("--discord-scrollbar-thumb-width").trim()).toBe("5px");
		expect(styles.getPropertyValue("--discord-scrollbar-edge-inset").trim()).toBe("3px");
		expect(styles.getPropertyValue("--discord-scrollbar-end-inset").trim()).toBe("4px");
		expect(wrapper.find(".discord-scrollbar-thumb").classes()).toContain("rounded-full");

		wrapper.unmount();
	});

	it("floats the thumb over the content and tints it from the theme when asked (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordScrollbar, {
			props: { alwaysShowTrack: true, overlay: true, themed: true },
			slots: { default: "<p>content</p>" },
			attachTo: document.body,
		});
		const root = wrapper.find(".discord-scrollbar").element as HTMLElement;

		// ASSERT — one column for the content, the track laid over it
		expect(root.classList).toContain("discord-scrollbar-overlay");
		expect(root.classList).toContain("discord-scrollbar-themed");
		expect(getComputedStyle(root).gridTemplateColumns.split(" ")).toHaveLength(1);
		const track = wrapper.find(".discord-scrollbar-track").element as HTMLElement;
		expect(getComputedStyle(track).position).toBe("absolute");
		expect(getComputedStyle(root).getPropertyValue("--discord-scrollbar-thumb")).toContain(
			"color-mix",
		);

		wrapper.unmount();
	});

	it("keeps a lane for the thumb and Discord's grey by default (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordScrollbar, {
			props: { alwaysShowTrack: true },
			slots: { default: "<p>content</p>" },
			attachTo: document.body,
		});
		const root = wrapper.find(".discord-scrollbar").element as HTMLElement;

		// ASSERT
		expect(root.classList).not.toContain("discord-scrollbar-overlay");
		expect(getComputedStyle(root).gridTemplateColumns.split(" ")).toHaveLength(2);
		expect(getComputedStyle(root).getPropertyValue("--discord-scrollbar-thumb")).not.toContain(
			"color-mix",
		);

		wrapper.unmount();
	});

	it("scrolls the content when the thumb is dragged, and a page when the rail is clicked (positive)", async () => {
		// ARRANGE — a 200px viewport over 1000px of content
		const wrapper = await mountSuspended(DiscordScrollbar, {
			props: { overlay: true },
			slots: { default: '<div style="height: 1000px">tall</div>' },
			attachTo: document.body,
		});
		(wrapper.element as HTMLElement).style.height = "200px";
		const viewport = wrapper.find(".discord-scrollbar-viewport").element as HTMLElement;
		const thumb = wrapper.find(".discord-scrollbar-thumb").element as HTMLElement;
		const rail = wrapper.find(".discord-scrollbar-thumb-rail").element as HTMLElement;
		await vi.waitFor(() => expect(thumb.style.height).not.toBe("0px"));

		// ACT — drag the thumb 40px down
		const at = (type: string, clientY: number, target: HTMLElement) =>
			target.dispatchEvent(
				new PointerEvent(type, { bubbles: true, button: 0, clientY, pointerId: 1 }),
			);
		at("pointerdown", 10, thumb);
		at("pointermove", 50, thumb);
		at("pointerup", 50, thumb);

		// ASSERT — the content moved by more than the pointer did
		expect(viewport.scrollTop).toBeGreaterThan(40);

		// ACT — click the rail above the thumb
		const before = viewport.scrollTop;
		at("pointerdown", rail.getBoundingClientRect().top + 1, rail);

		// ASSERT
		await vi.waitFor(() => expect(viewport.scrollTop).toBeLessThan(before));

		wrapper.unmount();
	});
});
