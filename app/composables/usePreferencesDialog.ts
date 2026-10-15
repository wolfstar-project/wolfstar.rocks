/**
 * Open state of the preferences dialog (theme, language, reduced motion).
 *
 * The dialog is mounted once in `app/app.vue` and opened from wherever a
 * "Preferences" control lives: the header for guests and signed-in users, and
 * the account card and the gear of the dashboard sidebar.
 */
export function usePreferencesDialog() {
	const isOpen = useState("app:preferences-dialog", () => false);

	function open() {
		isOpen.value = true;
	}

	return { isOpen, open };
}
