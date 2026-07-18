/** localStorage key for the user's preferred UI locale (not guild bot language). */
const PREFERRED_LOCALE_KEY = "user-prefers-locale";

/**
 * Persist and restore the user's preferred UI locale.
 * Kept separate from guild bot-response language settings.
 */
export function usePreferredLocale() {
	const preferredLocale = useLocalStorage<string | null>(PREFERRED_LOCALE_KEY, null);

	function setPreferredLocale(code: string | null) {
		preferredLocale.value = code;
	}

	return {
		preferredLocale,
		setPreferredLocale,
	};
}
