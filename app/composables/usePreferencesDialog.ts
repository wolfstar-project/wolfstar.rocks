/**
 * Open state of the preferences dialog (theme, language, reduced motion).
 *
 * The dialog is mounted once in `app/app.vue` and opened from wherever a
 * "Preferences" control lives: the header for guests and signed-in users, and
 * the user menu of the dashboard.
 */
export function usePreferencesDialog() {
	const isOpen = useState("app:preferences-dialog", () => false);

	function open() {
		isOpen.value = true;
	}

	return { isOpen, open };
}
