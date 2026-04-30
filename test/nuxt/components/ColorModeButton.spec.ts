import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import ColorModeButton from "~/components/ColorModeButton.vue";

const mockColorMode = {
	preference: "dark",
	value: "dark",
};

const mockEffectiveReduceMotion = ref(false);

vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<typeof import("#imports")>();
	return {
		...actual,
		useColorMode: () => mockColorMode,
		useReduceMotion: () => ({ effectiveReduceMotion: mockEffectiveReduceMotion }),
	};
});

function setActiveViewTransition(value: ViewTransition | null): void {
	Object.defineProperty(document, "activeViewTransition", {
		configurable: true,
		writable: true,
		value,
	});
}

describe("ColorModeButton", () => {
	beforeEach(() => {
		mockColorMode.preference = "dark";
		mockColorMode.value = "dark";
		mockEffectiveReduceMotion.value = false;

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
		setActiveViewTransition(null);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("swaps theme and DOES NOT call startViewTransition when startViewTransition is undefined", async () => {
		const savedSVT = document.startViewTransition;
		Object.defineProperty(document, "startViewTransition", {
			configurable: true,
			writable: true,
			value: undefined,
		});
		const wrapper = await mountSuspended(ColorModeButton);
		await wrapper.find("button").trigger("click");
		expect(mockColorMode.preference).toBe("light");
		Object.defineProperty(document, "startViewTransition", {
			configurable: true,
			writable: true,
			value: savedSVT,
		});
	});

	it("swaps theme and DOES NOT call startViewTransition when activeViewTransition is truthy", async () => {
		setActiveViewTransition({
			ready: Promise.resolve(),
			finished: Promise.resolve(),
			skipTransition: vi.fn(),
		} as unknown as ViewTransition);
		const wrapper = await mountSuspended(ColorModeButton);
		await wrapper.find("button").trigger("click");
		expect(document.startViewTransition).not.toHaveBeenCalled();
		expect(mockColorMode.preference).toBe("light");
	});

	it("swaps theme and DOES NOT call startViewTransition when effectiveReduceMotion is true", async () => {
		mockEffectiveReduceMotion.value = true;
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
