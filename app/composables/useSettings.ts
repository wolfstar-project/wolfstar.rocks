import type { RemovableRef } from "@vueuse/core";
import type { EffectScope } from "vue";
import type { AppLocaleCode } from "~/utils/is-app-locale";
import { isAppLocaleCode } from "~/utils/is-app-locale";

type ColorModePreference = "system" | "light" | "dark";

export interface AppSettings {
	colorMode: ColorModePreference;
	reduceMotion: boolean;
	selectedLocale: AppLocaleCode | null;
}

const STORAGE_KEY = "wolfstar-settings";
const LEGACY_LOCALE_KEY = "user-prefers-locale";
const LEGACY_REDUCE_MOTION_KEY = "user-prefers-reduced-motion";
const DEFAULT_SETTINGS: AppSettings = {
	colorMode: "system",
	reduceMotion: false,
	selectedLocale: null,
};

let settingsScope: EffectScope | null = null;
let settingsRef: RemovableRef<AppSettings> | null = null;
let legacyMigrationApplied = false;

export function resetSettingsStateForTests() {
	if (!import.meta.test) return;
	settingsScope?.stop();
	settingsScope = null;
	settingsRef = null;
	legacyMigrationApplied = false;
}

function parseStoredColorMode(value: string | null): ColorModePreference | null {
	return value === "system" || value === "light" || value === "dark" ? value : null;
}

function parseStoredReduceMotion(value: string | null): boolean | null {
	if (value === "true") return true;
	if (value === "false") return false;
	return null;
}

function parseStoredLocale(value: string | null): AppLocaleCode | null {
	return value && isAppLocaleCode(value) ? value : null;
}

function applyLegacySettingsMigration(settings: RemovableRef<AppSettings>) {
	if (!import.meta.client || legacyMigrationApplied) return;
	legacyMigrationApplied = true;

	const legacyColorMode = parseStoredColorMode(localStorage.getItem("wolfstar-theme"));
	const legacyReduceMotion = parseStoredReduceMotion(
		localStorage.getItem(LEGACY_REDUCE_MOTION_KEY),
	);
	const legacyLocale = parseStoredLocale(localStorage.getItem(LEGACY_LOCALE_KEY));

	settings.value = {
		colorMode: legacyColorMode ?? DEFAULT_SETTINGS.colorMode,
		reduceMotion: legacyReduceMotion ?? DEFAULT_SETTINGS.reduceMotion,
		selectedLocale: legacyLocale ?? DEFAULT_SETTINGS.selectedLocale,
	};

	localStorage.removeItem(LEGACY_REDUCE_MOTION_KEY);
	localStorage.removeItem(LEGACY_LOCALE_KEY);
}

export function useSettings() {
	// Only migrate while wolfstar-settings has never been persisted. The check must
	// happen before the storage ref is created because useLocalStorage writes the
	// defaults synchronously when the key is absent. Without it, the ever-present
	// wolfstar-theme key (owned by the color-mode module) would re-trigger the
	// migration on every page load and reset the stored preferences to defaults.
	const shouldMigrateLegacySettings =
		import.meta.client &&
		!legacyMigrationApplied &&
		localStorage.getItem(STORAGE_KEY) === null &&
		(localStorage.getItem("wolfstar-theme") !== null ||
			localStorage.getItem(LEGACY_REDUCE_MOTION_KEY) !== null ||
			localStorage.getItem(LEGACY_LOCALE_KEY) !== null);

	if (!settingsRef) {
		// Create the storage ref in a detached effect scope. useLocalStorage
		// registers its persistence watcher in the active scope, so creating it
		// directly in the first consumer's setup would dispose the watcher when
		// that component unmounts and later writes would silently stop reaching
		// localStorage (leaving e.g. colorMode stale on the next page load).
		const scope = effectScope(true);
		const created = scope.run(() =>
			useLocalStorage<AppSettings>(STORAGE_KEY, DEFAULT_SETTINGS, {
				mergeDefaults: true,
			}),
		);
		if (!created) {
			scope.stop();
			throw new Error("Failed to initialize the shared settings state");
		}
		settingsScope = scope;
		settingsRef = created;
	}

	if (shouldMigrateLegacySettings) {
		applyLegacySettingsMigration(settingsRef);
	} else if (import.meta.client) {
		legacyMigrationApplied = true;
	}

	return {
		settings: settingsRef,
	};
}

export function useReduceMotion() {
	const systemPrefersReducedMotion = usePreferredReducedMotion();
	const { settings } = useSettings();

	const reduceMotionEnabled = computed({
		get: () => settings.value.reduceMotion,
		set: (value: boolean) => {
			settings.value.reduceMotion = value;
		},
	});

	const effectiveReduceMotion = computed(
		() => systemPrefersReducedMotion.value === "reduce" || reduceMotionEnabled.value,
	);

	const systemPreferenceActive = computed(() => systemPrefersReducedMotion.value === "reduce");

	function setReduceMotion(value: boolean) {
		settings.value.reduceMotion = value;
	}

	if (import.meta.client) {
		const isDocumentVisible = useDocumentVisibility();

		watchEffect(() => {
			if (isDocumentVisible.value === "visible" || isDocumentVisible.value === "hidden") {
				if (effectiveReduceMotion.value) {
					document.documentElement.setAttribute("data-reduce-motion", "true");
				} else {
					document.documentElement.removeAttribute("data-reduce-motion");
				}
			}
		});
	}

	return {
		effectiveReduceMotion,
		reduceMotionEnabled,
		setReduceMotion,
		systemPreferenceActive,
		systemPrefersReducedMotion,
	};
}

export function usePreferredLocale() {
	const { settings } = useSettings();

	const preferredLocale = computed({
		get: () => settings.value.selectedLocale,
		set: (value: AppLocaleCode | null) => {
			settings.value.selectedLocale = value;
		},
	});

	function setPreferredLocale(code: AppLocaleCode | null) {
		settings.value.selectedLocale = code;
	}

	return {
		preferredLocale,
		setPreferredLocale,
	};
}

export function useAppColorMode() {
	const { settings } = useSettings();
	const colorMode = useColorMode();

	const preference = computed({
		get: () => settings.value.colorMode,
		set: (value: ColorModePreference) => {
			settings.value.colorMode = value;
			colorMode.preference = value;
		},
	});

	function setColorMode(value: ColorModePreference) {
		preference.value = value;
	}

	if (colorMode.preference !== settings.value.colorMode) {
		colorMode.preference = settings.value.colorMode;
	}

	return {
		preference,
		setColorMode,
	};
}
