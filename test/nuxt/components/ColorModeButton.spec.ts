import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import ColorModeButton from "~/components/ColorModeButton.vue";

interface TestDocument extends Document {
	startViewTransition: ((callback?: () => void | Promise<void>) => ViewTransition) | undefined;
	activeViewTransition: ViewTransition | null;
}

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

describe("ColorModeButton", () => {
	let doc: TestDocument;

	beforeEach(() => {
		mockColorMode.preference = "dark";
		mockColorMode.value = "dark";
		mockEffectiveReduceMotion.value = false;

		doc = document as unknown as TestDocument;
		doc.startViewTransition = vi.fn((cb?: () => void | Promise<void>) => {
			cb?.();
			return {
				ready: Promise.resolve(),
				finished: Promise.resolve(),
				skipTransition: vi.fn(),
			} as unknown as ViewTransition;
		});
		doc.activeViewTransition = null;
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("swaps theme and DOES NOT call startViewTransition when startViewTransition is undefined", async () => {
		const savedSVT = doc.startViewTransition;
		doc.startViewTransition = undefined;
		const wrapper = await mountSuspended(ColorModeButton);
		await wrapper.find("button").trigger("click");
		expect(mockColorMode.preference).toBe("light");
		doc.startViewTransition = savedSVT;
	});

	it("swaps theme and DOES NOT call startViewTransition when activeViewTransition is truthy", async () => {
		doc.activeViewTransition = {
			ready: Promise.resolve(),
			finished: Promise.resolve(),
			skipTransition: vi.fn(),
		} as unknown as ViewTransition;
		const wrapper = await mountSuspended(ColorModeButton);
		await wrapper.find("button").trigger("click");
		expect(doc.startViewTransition).not.toHaveBeenCalled();
		expect(mockColorMode.preference).toBe("light");
	});

	it("swaps theme and DOES NOT call startViewTransition when effectiveReduceMotion is true", async () => {
		mockEffectiveReduceMotion.value = true;
		const wrapper = await mountSuspended(ColorModeButton);
		await wrapper.find("button").trigger("click");
		expect(doc.startViewTransition).not.toHaveBeenCalled();
		expect(mockColorMode.preference).toBe("light");
	});

	it("calls startViewTransition exactly once on happy path", async () => {
		const wrapper = await mountSuspended(ColorModeButton);
		await wrapper.find("button").trigger("click");
		expect(doc.startViewTransition).toHaveBeenCalledTimes(1);
		expect(mockColorMode.preference).toBe("light");
	});
});
