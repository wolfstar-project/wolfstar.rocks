import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import DiscordScrollbar from "~/components/discord/scrollbar.vue";

type ScrollbarProps = {
	overlay?: boolean;
	autoHide?: boolean;
	themed?: boolean;
	maxThumbHeight?: number;
};

// A 200px scrollbar over 1000px of content.
async function mountTall(props: ScrollbarProps) {
	const wrapper = await mountSuspended(DiscordScrollbar, {
		props,
		slots: { default: '<div class="tall" style="height: 1000px">tall</div>' },
		attachTo: document.body,
	});
	const root = wrapper.element as HTMLElement;
	root.style.height = "200px";
	const parts = {
		wrapper,
		root,
		viewport: wrapper.find(".discord-scrollbar-viewport").element as HTMLElement,
		track: wrapper.find(".discord-scrollbar-track").element as HTMLElement,
		thumb: wrapper.find(".discord-scrollbar-thumb").element as HTMLElement,
		rail: wrapper.find(".discord-scrollbar-thumb-rail").element as HTMLElement,
	};
	await vi.waitFor(() => expect(parts.thumb.style.height).not.toBe("0px"));
	return parts;
}

const pointer = (type: string, clientY: number, target: HTMLElement) =>
	target.dispatchEvent(
		new PointerEvent(type, { bubbles: true, button: 0, clientY, pointerId: 1 }),
	);

describe("DiscordScrollbar", () => {
	it("draws a hidden-from-AT thumb when the content overflows (positive)", async () => {
		// ARRANGE / ACT
		const { wrapper, viewport, track, thumb } = await mountTall({});

		// ASSERT
		expect(viewport.clientHeight).toBe(200);
		expect(track.getAttribute("aria-hidden")).toBe("true");
		expect(getComputedStyle(track).display).not.toBe("none");
		expect(thumb.classList).toContain("rounded-full");
		expect(getComputedStyle(thumb).width).toBe("5px");
		expect(wrapper.find(".tall").text()).toBe("tall");

		wrapper.unmount();
	});

	it("draws no thumb when the content fits (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordScrollbar, {
			slots: { default: "<p>short</p>" },
			attachTo: document.body,
		});

		// ASSERT
		const track = wrapper.find(".discord-scrollbar-track").element as HTMLElement;
		expect(getComputedStyle(track).display).toBe("none");

		wrapper.unmount();
	});

	it("caps the thumb at maxThumbHeight (positive)", async () => {
		// ARRANGE / ACT — the proportional thumb would be about 38px
		const { wrapper, thumb } = await mountTall({ maxThumbHeight: 26 });

		// ASSERT
		expect(thumb.style.height).toBe("26px");

		wrapper.unmount();
	});

	it("floats the thumb over the content and tints it from the theme when asked (positive)", async () => {
		// ARRANGE / ACT
		const { wrapper, root, track } = await mountTall({ overlay: true, themed: true });

		// ASSERT — one column for the content, the track laid over it
		expect(getComputedStyle(root).gridTemplateColumns.split(" ")).toHaveLength(1);
		expect(getComputedStyle(track).position).toBe("absolute");
		expect(getComputedStyle(root).getPropertyValue("--discord-scrollbar-thumb")).toContain(
			"color-mix",
		);

		wrapper.unmount();
	});

	it("keeps a lane for the thumb and newt/ui's grey by default (negative)", async () => {
		// ARRANGE / ACT
		const { wrapper, root } = await mountTall({});

		// ASSERT
		expect(getComputedStyle(root).gridTemplateColumns.split(" ")).toHaveLength(2);
		expect(getComputedStyle(root).getPropertyValue("--discord-scrollbar-thumb")).not.toContain(
			"color-mix",
		);

		wrapper.unmount();
	});

	it("hides the thumb until hover when autoHide is set (positive)", async () => {
		// ARRANGE / ACT
		const { wrapper, thumb } = await mountTall({ autoHide: true });

		// ASSERT — a scroll event while the thumb mounts keeps it shown until the idle delay ends
		await vi.waitFor(() => expect(getComputedStyle(thumb).opacity).toBe("0"), {
			timeout: 3000,
		});

		wrapper.unmount();
	});

	it("scrolls the content when the thumb is dragged, over the content too (positive)", async () => {
		// ARRANGE — the overlay thumb is the only part that takes the pointer
		const { wrapper, viewport, thumb, rail } = await mountTall({ overlay: true });
		expect(getComputedStyle(thumb).pointerEvents).toBe("auto");
		expect(getComputedStyle(rail).pointerEvents).toBe("none");

		// ACT — drag the thumb 40px down
		pointer("pointerdown", 10, thumb);
		pointer("pointermove", 50, thumb);
		pointer("pointerup", 50, thumb);

		// ASSERT — the content moved by more than the pointer did
		expect(viewport.scrollTop).toBeGreaterThan(40);

		wrapper.unmount();
	});

	it("stops scrolling when the pointer is released (negative)", async () => {
		// ARRANGE
		const { wrapper, viewport, thumb } = await mountTall({ overlay: true });
		pointer("pointerdown", 10, thumb);
		pointer("pointerup", 10, thumb);

		// ACT — a move after the release
		pointer("pointermove", 80, thumb);

		// ASSERT
		expect(viewport.scrollTop).toBe(0);

		wrapper.unmount();
	});

	it("moves a page when the rail is clicked beside the thumb (positive)", async () => {
		// ARRANGE — a lane kept for the thumb, so the rail takes clicks
		const { wrapper, viewport, rail } = await mountTall({});
		expect(getComputedStyle(rail).pointerEvents).toBe("auto");

		// ACT — click the rail below the thumb
		pointer("pointerdown", rail.getBoundingClientRect().bottom - 2, rail);

		// ASSERT
		await vi.waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0));

		wrapper.unmount();
	});
});
