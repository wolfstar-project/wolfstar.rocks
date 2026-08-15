import type { MockInstance } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";

const mockColorMode = {
	preference: "system" as "system" | "light" | "dark",
	value: "light" as "light" | "dark",
};

mockNuxtImport("useColorMode", () => () => mockColorMode);

const STORAGE_KEY = "wolfstar-settings";

// Vitest browser mode runs test files in parallel same-origin iframes that all
// share one localStorage. StorageEvents coming from those sibling documents are
// always trusted, and VueUse's listenToStorageChanges sync would let them reset
// this file's settings ref mid-test. Same-document sync dispatches synthetic
// (untrusted) events, so it keeps working.
function blockCrossDocumentStorageEvents(event: StorageEvent) {
	if (event.isTrusted) event.stopImmediatePropagation();
}

describe("useSettings", () => {
	let setItemSpy: MockInstance<(key: string, value: string) => void>;

	beforeAll(() => {
		window.addEventListener("storage", blockCrossDocumentStorageEvents, true);
	});

	afterAll(() => {
		window.removeEventListener("storage", blockCrossDocumentStorageEvents, true);
	});

	beforeEach(() => {
		vi.resetModules();
		localStorage.clear();
		setItemSpy = vi.spyOn(Storage.prototype, "setItem");
		mockColorMode.preference = "system";
		mockColorMode.value = "light";
	});

	afterEach(async () => {
		// Flush the pending settings persistence before clearing so stored locale
		// preferences do not leak into the app boot of later test files.
		await nextTick();
		setItemSpy.mockRestore();
		localStorage.clear();
	});

	// Sibling test files can clobber the shared localStorage at any time, so
	// persistence assertions read this document's own writes from the spy
	// instead of reading the storage back.
	function lastPersistedSettings(): unknown {
		const lastWrite = setItemSpy.mock.calls.filter(([key]) => key === STORAGE_KEY).at(-1);
		return lastWrite ? JSON.parse(lastWrite[1]) : undefined;
	}

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
		expect(lastPersistedSettings()).toEqual(settings.value);
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

	it("persists color-mode changes after the first consumer unmounts", async () => {
		const settingsModule = await import("~/composables/useSettings");
		settingsModule.resetSettingsStateForTests();

		// The first consumer creates the shared settings ref, then unmounts. Its
		// disposal must not tear down the localStorage persistence watcher.
		const first = await mountSuspended(
			defineComponent({
				setup() {
					settingsModule.useSettings();
					return () => null;
				},
			}),
		);
		first.unmount();

		let colorMode: ReturnType<typeof settingsModule.useAppColorMode> | undefined;
		await mountSuspended(
			defineComponent({
				setup() {
					colorMode = settingsModule.useAppColorMode();
					return () => null;
				},
			}),
		);

		colorMode!.setColorMode("light");
		await nextTick();

		expect(colorMode!.preference.value).toBe("light");
		expect(lastPersistedSettings()).toMatchObject({ colorMode: "light" });
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

	it("persists midnight when setColorMode runs", async () => {
		const settingsModule = await import("~/composables/useSettings");
		settingsModule.resetSettingsStateForTests();
		let colorModeApi: ReturnType<typeof settingsModule.useAppColorMode> | undefined;

		await mountSuspended(
			defineComponent({
				setup() {
					colorModeApi = settingsModule.useAppColorMode();
					return () => null;
				},
			}),
		);

		colorModeApi!.setColorMode("midnight");
		await nextTick();

		expect(colorModeApi!.preference.value).toBe("midnight");
		expect(lastPersistedSettings()).toMatchObject({ colorMode: "midnight" });
	});
});
