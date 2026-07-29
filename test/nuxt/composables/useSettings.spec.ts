import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";

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

	async function setupSettings() {
		const settingsModule = await import("~/composables/useSettings");
		settingsModule.resetSettingsStateForTests();
		let composable: ReturnType<typeof settingsModule.useSettings> | undefined;

		const TestComponent = defineComponent({
			setup() {
				composable = settingsModule.useSettings();
				return () => null;
			},
		});

		await mountSuspended(TestComponent);
		return composable!;
	}

	it("creates default settings", async () => {
		const { settings } = await setupSettings();

		expect(settings.value).toEqual({
			colorMode: "system",
			reduceMotion: false,
			selectedLocale: null,
		});
		await nextTick();
		expect(JSON.parse(localStorage.getItem("wolfstar-settings") ?? "{}")).toEqual(
			settings.value,
		);
	});

	it("migrates legacy keys into wolfstar-settings", async () => {
		localStorage.setItem("user-prefers-reduced-motion", "true");
		localStorage.setItem("user-prefers-locale", "it-IT");
		localStorage.setItem("wolfstar-theme", "dark");

		const { settings } = await setupSettings();

		expect(settings.value).toEqual({
			colorMode: "dark",
			reduceMotion: true,
			selectedLocale: "it-IT",
		});
		expect(localStorage.getItem("user-prefers-reduced-motion")).toBeNull();
		expect(localStorage.getItem("user-prefers-locale")).toBeNull();
	});

	it("updates preferred locale through the shared settings object", async () => {
		const settingsModule = await import("~/composables/useSettings");
		settingsModule.resetSettingsStateForTests();
		let composable:
			| {
					preferredLocale: ReturnType<typeof settingsModule.usePreferredLocale>;
					settings: ReturnType<typeof settingsModule.useSettings>;
			  }
			| undefined;

		const TestComponent = defineComponent({
			setup() {
				composable = {
					preferredLocale: settingsModule.usePreferredLocale(),
					settings: settingsModule.useSettings(),
				};
				return () => null;
			},
		});

		await mountSuspended(TestComponent);

		composable!.preferredLocale.setPreferredLocale("es-ES");

		expect(composable!.preferredLocale.preferredLocale.value).toBe("es-ES");
		expect(composable!.settings.settings.value.selectedLocale).toBe("es-ES");
	});
});
