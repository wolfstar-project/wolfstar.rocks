import type { AppSettings } from "~/composables/useSettings";

type ThemeSnapshot = Pick<AppSettings, "colorMode" | "colorTheme" | "customTheme" | "darkShade">;

/**
 * The custom theme's editor, docked at the right of the window as Discord's
 * is: the settings close so the dashboard shows the theme as it is built.
 *
 * Every change previews at once. Apply keeps them; Back, the close button and
 * leaving the page put back the theme the settings had when the editor opened.
 */
export function useCustomThemePanel() {
	const isOpen = useState("app:custom-theme-panel", () => false);
	const snapshot = useState<ThemeSnapshot | null>("app:custom-theme-panel-snapshot", () => null);
	const { settings } = useSettings();
	const { setColorMode } = useAppColorMode();
	const { selectColorTheme } = useThemeChoice();
	const preferences = usePreferencesDialog();

	function open() {
		const { colorMode, colorTheme, customTheme, darkShade } = settings.value;
		// The settings can open it again while it is open: what it replaced stays the first theme.
		snapshot.value ??= { colorMode, colorTheme, customTheme, darkShade };
		selectColorTheme("custom");
		preferences.isOpen.value = false;
		isOpen.value = true;
	}

	function backToSettings() {
		isOpen.value = false;
		snapshot.value = null;
		preferences.open("appearance");
	}

	function apply() {
		backToSettings();
	}

	function discard() {
		const saved = snapshot.value;
		if (saved) {
			settings.value = {
				...settings.value,
				colorTheme: saved.colorTheme,
				customTheme: saved.customTheme,
				darkShade: saved.darkShade,
			};
			setColorMode(saved.colorMode);
		}
		isOpen.value = false;
		snapshot.value = null;
	}

	function back() {
		discard();
		preferences.open("appearance");
	}

	return { apply, back, discard, isOpen, open };
}
