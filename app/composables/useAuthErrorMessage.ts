/**
 * Resolve a Better Auth / OAuth error code (or raw message) to a localized string.
 * Prefer `auth.errors.<CODE>` when present; otherwise fall back to the provided message.
 */
export function useAuthErrorMessage() {
	const { t, te } = useI18n();

	function localizeAuthError(
		codeOrMessage: string | null | undefined,
		fallbackKey = "auth.errors.GENERIC",
	): string {
		if (!codeOrMessage) {
			return t(fallbackKey);
		}

		const normalized = codeOrMessage.trim();
		const codeKey = `auth.errors.${normalized}`;
		if (te(codeKey)) {
			return t(codeKey);
		}

		// Some providers pass `error_description` style snake_case already uppercased.
		const upperKey = `auth.errors.${normalized.toUpperCase()}`;
		if (te(upperKey)) {
			return t(upperKey);
		}

		return normalized;
	}

	return { localizeAuthError };
}
