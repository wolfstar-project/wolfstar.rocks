import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

describe("ColorModeButton", () => {
	beforeEach(async () => {
		vi.resetModules();
		localStorage.setItem(
			"wolfstar-settings",
			JSON.stringify({ colorMode: "dark", reduceMotion: false, selectedLocale: null }),
		);
		localStorage.setItem("wolfstar-theme", "dark");

		const { resetSettingsStateForTests } = await import("~/composables/useSettings");
		resetSettingsStateForTests();

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

	afterEach(async () => {
		vi.clearAllMocks();
		await nextTick();
		localStorage.clear();
		const { resetSettingsStateForTests } = await import("~/composables/useSettings");
		resetSettingsStateForTests();
	});

	async function mountButton(props?: Record<string, unknown>) {
		const { default: ColorModeButton } = await import("~/components/ColorModeButton.vue");
		return mountSuspended(ColorModeButton, { props });
	}

	it("renders a theme menu trigger with the current preference label", async () => {
		const wrapper = await mountButton();
		await nextTick();
		const trigger = wrapper.get('button[aria-label="Choose color theme"]');
		expect(trigger.text()).toContain("Dark");
		expect(trigger.attributes("aria-haspopup")).toBe("menu");
	});

	it("can render an icon-only trigger when showLabel is false", async () => {
		const wrapper = await mountButton({ showLabel: false });
		await nextTick();
		const trigger = wrapper.get('button[aria-label="Choose color theme"]');
		expect(trigger.text()).not.toContain("Dark");
	});

	it("persists midnight when selected via useAppColorMode", async () => {
		await mountButton();
		await nextTick();

		const { useAppColorMode } = await import("~/composables/useSettings");
		const { setColorMode, preference } = useAppColorMode();
		setColorMode("midnight");
		await nextTick();

		expect(preference.value).toBe("midnight");
		expect(JSON.parse(localStorage.getItem("wolfstar-settings") ?? "{}")).toMatchObject({
			colorMode: "midnight",
		});
	});
});
