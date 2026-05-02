import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import ColorModeButton from "~/components/ColorModeButton.vue";

const mockColorMode = { preference: "dark", value: "dark" };
const mockEffectiveReduceMotion = ref(false);

mockNuxtImport("useColorMode", () => () => mockColorMode);
mockNuxtImport("useReduceMotion", () => () => ({
	effectiveReduceMotion: mockEffectiveReduceMotion,
}));

describe("ColorModeButton", () => {
	beforeEach(() => {
		mockColorMode.preference = "dark";
		mockColorMode.value = "dark";
		mockEffectiveReduceMotion.value = false;
		localStorage.removeItem("user-prefers-reduced-motion");

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

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("swaps theme and does not call startViewTransition when startViewTransition is undefined", async () => {
		const svtSpy = document.startViewTransition as ReturnType<typeof vi.fn>;
		Object.defineProperty(document, "startViewTransition", {
			configurable: true,
			writable: true,
			value: undefined,
		});
		const wrapper = await mountSuspended(ColorModeButton);
		await wrapper.find("button").trigger("click");
		expect(svtSpy).not.toHaveBeenCalled();
		expect(mockColorMode.preference).toBe("light");
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
		const wrapper = await mountSuspended(ColorModeButton);
		await wrapper.find("button").trigger("click");
		expect(document.startViewTransition).not.toHaveBeenCalled();
		expect(mockColorMode.preference).toBe("light");
	});

	it("swaps theme and does not call startViewTransition when effectiveReduceMotion is true", async () => {
		mockEffectiveReduceMotion.value = true;
		// Also set localStorage so the real composable returns true if mockNuxtImport doesn't intercept
		localStorage.setItem("user-prefers-reduced-motion", "true");
		const wrapper = await mountSuspended(ColorModeButton);
		await wrapper.find("button").trigger("click");
		expect(document.startViewTransition).not.toHaveBeenCalled();
		expect(mockColorMode.preference).toBe("light");
	});

	it("calls startViewTransition exactly once on happy path", async () => {
		const wrapper = await mountSuspended(ColorModeButton);
		await wrapper.find("button").trigger("click");
		expect(document.startViewTransition).toHaveBeenCalledTimes(1);
		expect(mockColorMode.preference).toBe("light");
	});
});
