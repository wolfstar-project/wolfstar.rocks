/**
 * A Better Auth failure as it reaches the UI: either the normalized
 * `AuthActionError` from `useSignIn()`/`useAuthClientAction()`, or the raw
 * `?error=` query value Better Auth appends when redirecting to an
 * `errorCallbackURL`.
 */
export type AuthErrorInput =
	| string
	| { code?: string; message?: string }
	// Vue Router's `LocationQueryValue[]`, for a provider that repeats `?error=`.
	| (string | null)[]
	| null
	| undefined;

const AUTH_ERROR_CODE_MISMATCHES: ReadonlyMap<string, string> = new Map([
	["INVALID_CODE", "INVALID_CALLBACK_REQUEST"],
]);

/**
 * Better Auth reports a machine-readable `code` alongside a human message.
 * The code is the stable translation key; the message is only a fallback for
 * failures that carry no code (provider errors, network failures).
 */
function toCandidates(input: AuthErrorInput): string[] {
	if (!input) {
		return [];
	}
	if (typeof input === "string") {
		return [input];
	}
	if (Array.isArray(input)) {
		const [first] = input;
		return typeof first === "string" ? [first] : [];
	}

	return [input.code, input.message].filter((value): value is string => Boolean(value));
}

/**
 * Resolve a Better Auth / OAuth error to a localized string.
 * Prefer `auth.errors.<CODE>` when present; otherwise fall back to the message.
 */
export function useAuthErrorMessage() {
	const { ts: t, has: te } = useI18n();

	function localizeAuthError(error: AuthErrorInput, fallbackKey = "auth.errors.GENERIC"): string {
		const candidates = toCandidates(error);
		if (candidates.length === 0) {
			return t(fallbackKey);
		}

		for (const candidate of candidates) {
			const normalized = candidate.trim();
			if (!normalized) {
				continue;
			}

			const codeKey = `auth.errors.${normalized}`;
			if (te(codeKey)) {
				return t(codeKey);
			}

			// Some providers pass `error_description` style snake_case already uppercased.
			const upperCode = normalized.toUpperCase();
			const localizedCode = AUTH_ERROR_CODE_MISMATCHES.get(upperCode) ?? upperCode;
			const upperKey = `auth.errors.${localizedCode}`;
			if (te(upperKey)) {
				return t(upperKey);
			}
		}

		// Nothing matched a translation key: show the most human-readable value,
		// which is the last candidate (the message) when one was supplied.
		return candidates[candidates.length - 1]?.trim() || t(fallbackKey);
	}

	return { localizeAuthError };
}
