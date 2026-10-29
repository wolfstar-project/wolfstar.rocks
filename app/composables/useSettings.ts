import type { RemovableRef } from "@vueuse/core";
import type { EffectScope } from "vue";
import type { CustomColorTheme } from "~/utils/color-themes";
import type { AppLocaleCode } from "~/utils/is-app-locale";
import { customColorTheme, DEFAULT_CUSTOM_THEME, findColorTheme } from "~/utils/color-themes";
import { isAppLocaleCode } from "~/utils/is-app-locale";

export type ColorModePreference = "system" | "light" | "dark" | "midnight";

/** How the log tables lay their rows out: roomy with avatars, or one tight line. */
export type LogDensity = "cozy" | "compact";

/** How times read: as the language writes them, or always on a 12- or 24-hour clock. */
export type TimeFormat = "auto" | "12h" | "24h";

/** Which of Discord's two dark themes the dark mode draws: Ash, or the darker Dark. */
export type DarkShade = "ash" | "dark";

export interface AppSettings {
	colorMode: ColorModePreference;
	/** A colour theme painted over the dashboard (`utils/color-themes.ts`), or none. */
	colorTheme: string | null;
	customTheme: CustomColorTheme;
	darkShade: DarkShade;
	logDensity: LogDensity;
	reduceMotion: boolean;
	selectedLocale: AppLocaleCode | null;
	timeFormat: TimeFormat;
}

export const COLOR_MODE_PREFERENCES = [
	"system",
	"light",
	"dark",
	"midnight",
] as const satisfies readonly ColorModePreference[];

const STORAGE_KEY = "wolfstar-settings";
const LEGACY_LOCALE_KEY = "user-prefers-locale";
const LEGACY_REDUCE_MOTION_KEY = "user-prefers-reduced-motion";
const DEFAULT_SETTINGS: AppSettings = {
	colorMode: "system",
	colorTheme: null,
	customTheme: DEFAULT_CUSTOM_THEME,
	darkShade: "ash",
	logDensity: "cozy",
	reduceMotion: false,
	selectedLocale: null,
	timeFormat: "auto",
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
	return value === "system" || value === "light" || value === "dark" || value === "midnight"
		? value
		: null;
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
		colorTheme: DEFAULT_SETTINGS.colorTheme,
		customTheme: DEFAULT_SETTINGS.customTheme,
		darkShade: DEFAULT_SETTINGS.darkShade,
		logDensity: DEFAULT_SETTINGS.logDensity,
		reduceMotion: legacyReduceMotion ?? DEFAULT_SETTINGS.reduceMotion,
		selectedLocale: legacyLocale ?? DEFAULT_SETTINGS.selectedLocale,
		timeFormat: DEFAULT_SETTINGS.timeFormat,
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
				deep: true,
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

/** The log tables' row density, kept with the other preferences of this browser. */
export function useLogDensity() {
	const { settings } = useSettings();

	return computed<LogDensity>({
		// Settings stored before the preference existed have no value for it.
		get: () => settings.value.logDensity ?? DEFAULT_SETTINGS.logDensity,
		set: (value) => {
			// Replace the object so useLocalStorage reliably persists nested updates.
			settings.value = { ...settings.value, logDensity: value };
		},
	});
}

/** The clock times are read on, kept with the other preferences of this browser. */
export function useTimeFormat() {
	const { settings } = useSettings();

	return computed<TimeFormat>({
		// Settings stored before the preference existed have no value for it.
		get: () => settings.value.timeFormat ?? DEFAULT_SETTINGS.timeFormat,
		set: (value) => {
			settings.value = { ...settings.value, timeFormat: value };
		},
	});
}

/** The themes Discord lists first: its four bases and following the device. */
export type BaseThemeChoice = "light" | "ash" | "dark" | "onyx" | "system";

const BASE_THEMES: Record<BaseThemeChoice, { mode: ColorModePreference; shade: DarkShade }> = {
	ash: { mode: "dark", shade: "ash" },
	dark: { mode: "dark", shade: "dark" },
	light: { mode: "light", shade: "ash" },
	onyx: { mode: "midnight", shade: "ash" },
	system: { mode: "system", shade: "ash" },
};

/**
 * The theme picker of the settings, as Discord's: one of the base themes, or a
 * colour theme (a preset or the custom one) on its light or dark base.
 */
export function useThemeChoice() {
	const { settings } = useSettings();
	const { setColorMode } = useAppColorMode();

	const colorTheme = computed(() => settings.value.colorTheme ?? null);
	const customTheme = computed(() => settings.value.customTheme ?? DEFAULT_CUSTOM_THEME);
	const baseTheme = computed<BaseThemeChoice | null>(() => {
		if (colorTheme.value) return null;
		const mode = settings.value.colorMode;
		if (mode === "light") return "light";
		if (mode === "midnight") return "onyx";
		if (mode === "system") return "system";
		return (settings.value.darkShade ?? "ash") === "dark" ? "dark" : "ash";
	});

	function selectBase(choice: BaseThemeChoice) {
		const { mode, shade } = BASE_THEMES[choice];
		settings.value = { ...settings.value, colorTheme: null, darkShade: shade };
		setColorMode(mode);
	}

	function selectColorTheme(id: string) {
		const theme = id === "custom" ? customColorTheme(customTheme.value) : findColorTheme(id);
		if (!theme) return;
		settings.value = { ...settings.value, colorTheme: id, darkShade: "ash" };
		setColorMode(theme.base === "light" ? "light" : "dark");
	}

	function updateCustomTheme(patch: Partial<CustomColorTheme>) {
		const next = { ...customTheme.value, ...patch };
		settings.value = { ...settings.value, colorTheme: "custom", customTheme: next };
		setColorMode(next.base === "light" ? "light" : "dark");
	}

	return { baseTheme, colorTheme, customTheme, selectBase, selectColorTheme, updateCustomTheme };
}

export function useReduceMotion() {
	const systemPrefersReducedMotion = usePreferredReducedMotion();
	const { settings } = useSettings();

	const reduceMotionEnabled = computed({
		get: () => settings.value.reduceMotion,
		set: (value: boolean) => {
			settings.value = { ...settings.value, reduceMotion: value };
		},
	});

	const effectiveReduceMotion = computed(
		() => systemPrefersReducedMotion.value === "reduce" || reduceMotionEnabled.value,
	);

	const systemPreferenceActive = computed(() => systemPrefersReducedMotion.value === "reduce");

	function setReduceMotion(value: boolean) {
		settings.value = { ...settings.value, reduceMotion: value };
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
			settings.value = { ...settings.value, selectedLocale: value };
		},
	});

	function setPreferredLocale(code: AppLocaleCode | null) {
		settings.value = { ...settings.value, selectedLocale: code };
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
			// Replace the object so useLocalStorage reliably persists nested updates.
			settings.value = { ...settings.value, colorMode: value };
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
