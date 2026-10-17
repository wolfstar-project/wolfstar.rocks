/** A page of the preferences dialog. */
export type PreferencesSection =
	| "account"
	| "appearance"
	| "accessibility"
	| "notifications"
	| "language"
	| "connections"
	| "report";

/**
 * Which dialog opens: the dashboard's two-pane settings, or the compact one of
 * the pages around it (theme, language and reduced motion on a single page).
 */
export type PreferencesVariant = "console" | "quick";

/**
 * Open state of the preferences dialog (theme, language, reduced motion).
 *
 * The dialogs are mounted once in `app/app.vue` and opened from wherever a
 * "Preferences" control lives: the dashboard's account card and sidebar gear
 * open the two-pane one with `open()`, the header of every other page opens the
 * compact one with `openQuick()`. A caller of `open()` may ask for a page; the
 * dialog otherwise opens on its first one.
 */
export function usePreferencesDialog() {
	const isOpen = useState("app:preferences-dialog", () => false);
	const variant = useState<PreferencesVariant>("app:preferences-dialog-variant", () => "console");
	const requestedSection = useState<PreferencesSection | null>(
		"app:preferences-dialog-section",
		() => null,
	);

	function open(section?: PreferencesSection) {
		variant.value = "console";
		requestedSection.value = section ?? null;
		isOpen.value = true;
	}

	function openQuick() {
		variant.value = "quick";
		requestedSection.value = null;
		isOpen.value = true;
	}

	return { isOpen, open, openQuick, requestedSection, variant };
}
