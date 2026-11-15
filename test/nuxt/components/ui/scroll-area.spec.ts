import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { h } from "vue";
import { ScrollArea } from "~/components/ui/scrollbar";

/**
 * The overlay ScrollArea the console lists use: the sidebar, the direct
 * messages and the server rail. A 200px area over 1000px of content, with a
 * small box on the left that a drag can end on.
 */
async function mountTall(props: { autoHide?: boolean } = {}) {
	const wrapper = await mountSuspended(ScrollArea, {
		props: { variant: "overlay", style: { height: "200px", width: "240px" }, ...props },
		slots: {
			default: () =>
				h("div", { style: "position: relative; height: 1000px" }, [
					h("div", {
						"data-testid": "drop",
						"style":
							"position: absolute; top: 130px; left: 0; width: 20px; height: 20px",
					}),
				]),
		},
		attachTo: document.body,
	});
	const track = wrapper.get("[data-scrollbar-track]").element as HTMLElement;
	const parts = {
		wrapper,
		root: wrapper.element as HTMLElement,
		viewport: track.previousElementSibling as HTMLElement,
		track,
		thumb: track.firstElementChild as HTMLElement,
		drop: wrapper.get("[data-testid='drop']").element as HTMLElement,
	};
	await vi.waitFor(() => expect(parts.track.hidden).toBe(false));
	return parts;
}

describe("ScrollArea (overlay)", () => {
	it("draws a thumb over the content when the content overflows (positive)", async () => {
		// ARRANGE / ACT
		const { wrapper, viewport, track, thumb } = await mountTall();

		// ASSERT: the content keeps the full width, and the thumb is out of the tree
		expect(viewport.clientWidth).toBe(240);
		expect(track.getAttribute("aria-hidden")).toBe("true");
		expect(thumb.getBoundingClientRect().height).toBeGreaterThan(0);

		wrapper.unmount();
	});

	it("draws no thumb when the content fits (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(ScrollArea, {
			props: { variant: "overlay", style: { height: "200px" } },
			slots: { default: () => h("p", "short") },
			attachTo: document.body,
		});

		// ASSERT
		const track = wrapper.get("[data-scrollbar-track]").element as HTMLElement;
		await vi.waitFor(() => expect(track.hidden).toBe(true));

		wrapper.unmount();
	});

	it("scrolls the content when the thumb is dragged (positive)", async () => {
		// ARRANGE
		const { wrapper, viewport, thumb, drop } = await mountTall();

		// ACT: a real pointer drag from the thumb about 100px down
		await userEvent.dragAndDrop(thumb, drop);

		// ASSERT: the content moved by more than the pointer did
		await vi.waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(100));

		wrapper.unmount();
	});

	it("stops scrolling once the pointer is released (negative)", async () => {
		// ARRANGE
		const { wrapper, viewport, thumb, drop } = await mountTall();
		await userEvent.dragAndDrop(thumb, drop);
		await vi.waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0));
		const released = viewport.scrollTop;

		// ACT: the pointer moves on with no button pressed
		await userEvent.hover(thumb);
		await userEvent.unhover(thumb);

		// ASSERT
		expect(viewport.scrollTop).toBe(released);

		wrapper.unmount();
	});

	it("hides the thumb until hover, and shows it while the content scrolls (positive)", async () => {
		// ARRANGE: move the real pointer off the area, so `:hover` is recomputed
		const { wrapper, root, viewport, track } = await mountTall({ autoHide: true });
		await userEvent.unhover(root);
		await vi.waitFor(() => expect(getComputedStyle(track).visibility).toBe("hidden"));

		// ACT: scroll with no pointer over the area, as a new message would
		viewport.scrollTop = 120;

		// ASSERT: shown while it scrolls, hidden again once it stops
		await vi.waitFor(() => expect(getComputedStyle(track).visibility).toBe("visible"));
		await vi.waitFor(() => expect(getComputedStyle(track).visibility).toBe("hidden"), {
			timeout: 3000,
		});

		// ACT: hover it
		await userEvent.hover(root);

		// ASSERT
		await vi.waitFor(() => expect(getComputedStyle(track).visibility).toBe("visible"));

		wrapper.unmount();
	});

	it("keeps the thumb visible with no auto-hide (negative)", async () => {
		// ARRANGE
		const { wrapper, root, track } = await mountTall();

		// ACT
		await userEvent.unhover(root);

		// ASSERT
		expect(getComputedStyle(track).visibility).toBe("visible");

		wrapper.unmount();
	});
});
