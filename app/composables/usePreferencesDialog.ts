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
 * Open state of the preferences dialog (theme, language, reduced motion).
 *
 * The dialog is mounted once in `app/app.vue` and opened from wherever a
 * "Preferences" control lives: the header for guests and signed-in users, and
 * the account card and the gear of the dashboard sidebar. A caller may ask for
 * a page; the dialog otherwise opens on its first one.
 */
export function usePreferencesDialog() {
	const isOpen = useState("app:preferences-dialog", () => false);
	const requestedSection = useState<PreferencesSection | null>(
		"app:preferences-dialog-section",
		() => null,
	);

	function open(section?: PreferencesSection) {
		requestedSection.value = section ?? null;
		isOpen.value = true;
	}

	return { isOpen, open, requestedSection };
}
