import type { RemovableRef } from "@vueuse/core";
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

let settingsRef: RemovableRef<AppSettings> | null = null;
let legacyMigrationApplied = false;

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

	if (localStorage.getItem(STORAGE_KEY)) return;

	const legacyColorMode = parseStoredColorMode(localStorage.getItem("wolfstar-theme"));
	const legacyReduceMotion = parseStoredReduceMotion(localStorage.getItem(LEGACY_REDUCE_MOTION_KEY));
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
	if (!settingsRef) {
		settingsRef = useLocalStorage<AppSettings>(STORAGE_KEY, DEFAULT_SETTINGS, {
			mergeDefaults: true,
		});
	}

	applyLegacySettingsMigration(settingsRef);

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
