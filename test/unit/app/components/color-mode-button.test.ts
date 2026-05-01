// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import ColorModeButton from "~/components/ColorModeButton.vue";

const mockColorMode = { preference: "dark", value: "dark" };
const mockEffectiveReduceMotion = ref(false);

vi.mock("#imports", async () => {
	const vue = await import("vue");
	return {
		...vue,
		useColorMode: () => mockColorMode,
		useReduceMotion: () => ({ effectiveReduceMotion: mockEffectiveReduceMotion }),
	};
});

function mountButton() {
	return mount(ColorModeButton, {
		global: {
			stubs: {
				ClientOnly: { template: "<slot/>" },
				UButton: {
					inheritAttrs: false,
					template:
						'<button v-bind="$attrs" @click="$emit(\'click\', $event)">btn</button>',
					emits: ["click"],
				},
			},
		},
	});
}

describe("ColorModeButton", () => {
	beforeEach(() => {
		mockColorMode.preference = "dark";
		mockColorMode.value = "dark";
		mockEffectiveReduceMotion.value = false;

		// Stub animate so the clip-path animation inside transition.ready.then() does not throw
		Object.defineProperty(document.documentElement, "animate", {
			configurable: true,
			writable: true,
			value: vi.fn(() => ({ finished: Promise.resolve() })),
		});

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
		const wrapper = mountButton();
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
		const wrapper = mountButton();
		await wrapper.find("button").trigger("click");
		expect(document.startViewTransition).not.toHaveBeenCalled();
		expect(mockColorMode.preference).toBe("light");
	});

	it("swaps theme and does not call startViewTransition when effectiveReduceMotion is true", async () => {
		mockEffectiveReduceMotion.value = true;
		const wrapper = mountButton();
		await wrapper.find("button").trigger("click");
		expect(document.startViewTransition).not.toHaveBeenCalled();
		expect(mockColorMode.preference).toBe("light");
	});

	it("calls startViewTransition exactly once on happy path", async () => {
		const wrapper = mountButton();
		await wrapper.find("button").trigger("click");
		expect(document.startViewTransition).toHaveBeenCalledTimes(1);
		expect(mockColorMode.preference).toBe("light");
	});
});
