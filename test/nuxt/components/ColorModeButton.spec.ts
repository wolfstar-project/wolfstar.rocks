import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import ColorModeButton from "~/components/ColorModeButton.vue";

const mockColorModePreference = ref<"system" | "light" | "dark">("dark");
const mockEffectiveReduceMotion = ref(false);

mockNuxtImport("useAppColorMode", () => () => ({
	preference: mockColorModePreference,
	setColorMode(value: "system" | "light" | "dark") {
		mockColorModePreference.value = value;
	},
}));
mockNuxtImport("useReduceMotion", () => () => ({
	effectiveReduceMotion: mockEffectiveReduceMotion,
}));

describe("ColorModeButton", () => {
	beforeEach(() => {
		mockColorModePreference.value = "dark";
		mockEffectiveReduceMotion.value = false;
		localStorage.clear();

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
		expect(mockColorModePreference.value).toBe("light");
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
		expect(mockColorModePreference.value).toBe("light");
	});

	it("swaps theme and does not call startViewTransition when effectiveReduceMotion is true", async () => {
		mockEffectiveReduceMotion.value = true;
		// Also set localStorage so the real composable returns true if mockNuxtImport doesn't intercept
		localStorage.setItem(
			"wolfstar-settings",
			JSON.stringify({ colorMode: "dark", reduceMotion: true, selectedLocale: null }),
		);
		const wrapper = await mountSuspended(ColorModeButton);
		await wrapper.find("button").trigger("click");
		expect(document.startViewTransition).not.toHaveBeenCalled();
		expect(mockColorModePreference.value).toBe("light");
	});

	it("calls startViewTransition exactly once on happy path", async () => {
		const wrapper = await mountSuspended(ColorModeButton);
		await wrapper.find("button").trigger("click");
		expect(document.startViewTransition).toHaveBeenCalledTimes(1);
		expect(mockColorModePreference.value).toBe("light");
	});
});
