import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";

const mockColorMode = {
	preference: "system" as "system" | "light" | "dark",
	value: "light" as "light" | "dark",
};

mockNuxtImport("useColorMode", () => () => mockColorMode);

describe("useSettings", () => {
	beforeEach(() => {
		vi.resetModules();
		localStorage.clear();
		mockColorMode.preference = "system";
		mockColorMode.value = "light";
	});

	async function setup() {
		const settingsModule = await import("~/composables/useSettings");
		let composable: {
			useAppColorMode: typeof settingsModule.useAppColorMode;
			usePreferredLocale: typeof settingsModule.usePreferredLocale;
			useSettings: typeof settingsModule.useSettings;
		} | undefined;

		const TestComponent = defineComponent({
			setup() {
				composable = {
					useAppColorMode: settingsModule.useAppColorMode,
					usePreferredLocale: settingsModule.usePreferredLocale,
					useSettings: settingsModule.useSettings,
				};
				return () => null;
			},
		});

		await mountSuspended(TestComponent);
		return composable!;
	}

	it("creates default settings", async () => {
		const { useSettings } = await setup();
		const { settings } = useSettings();

		expect(settings.value).toEqual({
			colorMode: "system",
			reduceMotion: false,
			selectedLocale: null,
		});
		expect(JSON.parse(localStorage.getItem("wolfstar-settings") ?? "{}")).toEqual(settings.value);
	});

	it("migrates legacy keys into wolfstar-settings", async () => {
		localStorage.setItem("user-prefers-reduced-motion", "true");
		localStorage.setItem("user-prefers-locale", "it-IT");
		localStorage.setItem("wolfstar-theme", "dark");

		const { useSettings } = await setup();
		const { settings } = useSettings();

		expect(settings.value).toEqual({
			colorMode: "dark",
			reduceMotion: true,
			selectedLocale: "it-IT",
		});
		expect(localStorage.getItem("user-prefers-reduced-motion")).toBeNull();
		expect(localStorage.getItem("user-prefers-locale")).toBeNull();
	});

	it("updates preferred locale through the shared settings object", async () => {
		const { usePreferredLocale, useSettings } = await setup();
		const { preferredLocale, setPreferredLocale } = usePreferredLocale();
		const { settings } = useSettings();

		setPreferredLocale("es-ES");

		expect(preferredLocale.value).toBe("es-ES");
		expect(settings.value.selectedLocale).toBe("es-ES");
	});

	it("syncs color mode preference to Nuxt color mode", async () => {
		const { useAppColorMode, useSettings } = await setup();
		const { preference, setColorMode } = useAppColorMode();
		const { settings } = useSettings();

		setColorMode("dark");

		expect(preference.value).toBe("dark");
		expect(settings.value.colorMode).toBe("dark");
		expect(mockColorMode.preference).toBe("dark");
	});
});
