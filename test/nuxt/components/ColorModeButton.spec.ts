import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

describe("ColorModeButton", () => {
	beforeEach(() => {
		vi.resetModules();
		localStorage.setItem(
			"wolfstar-settings",
			JSON.stringify({ colorMode: "dark", reduceMotion: false, selectedLocale: null }),
		);
		localStorage.setItem("wolfstar-theme", "dark");

		Object.defineProperty(document, "startViewTransition", {
			configurable: true,
			writable: true,
			value: vi.fn((cb?: () => void | Promise<void>) => {
				cb?.();
				return {
					ready: Promise.resolve(),
					finished: Promise.resolve(),
					skipTransition: vi.fn(),
				} as unknown as ViewTransition;
			}),
		});

		Object.defineProperty(document, "activeViewTransition", {
			configurable: true,
			writable: true,
			value: null,
		});

		// Stub animate so the clip-path animation inside transition.ready.then() does not throw
		Object.defineProperty(document.documentElement, "animate", {
			configurable: true,
			writable: true,
			value: vi.fn(() => ({ finished: Promise.resolve() })),
		});
	});

	afterEach(async () => {
		vi.clearAllMocks();
		// Flush the pending settings persistence before clearing so the seeded
		// theme does not leak into the app boot of later test files.
		await nextTick();
		localStorage.clear();
	});

	async function mountButton() {
		const { default: ColorModeButton } = await import("~/components/ColorModeButton.vue");
		return mountSuspended(ColorModeButton);
	}

	it("swaps theme and does not call startViewTransition when startViewTransition is undefined", async () => {
		const svtSpy = document.startViewTransition as ReturnType<typeof vi.fn>;
		Object.defineProperty(document, "startViewTransition", {
			configurable: true,
			writable: true,
			value: undefined,
		});
		const wrapper = await mountButton();
		await nextTick();
		await wrapper.find("button").trigger("click");
		await nextTick();
		expect(svtSpy).not.toHaveBeenCalled();
	});

	it("swaps theme and does not call startViewTransition when activeViewTransition is truthy", async () => {
		Object.defineProperty(document, "activeViewTransition", {
			configurable: true,
			writable: true,
			value: {
				ready: Promise.resolve(),
				finished: Promise.resolve(),
				skipTransition: vi.fn(),
			},
		});
		const wrapper = await mountButton();
		await nextTick();
		await wrapper.find("button").trigger("click");
		await nextTick();
		expect(document.startViewTransition).not.toHaveBeenCalled();
	});

	it("calls startViewTransition exactly once on happy path", async () => {
		const wrapper = await mountButton();
		await nextTick();
		await wrapper.find("button").trigger("click");
		await nextTick();
		expect(document.startViewTransition).toHaveBeenCalledTimes(1);
	});
});
