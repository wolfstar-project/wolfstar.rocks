/**
 * Ids of the cookie groups the visitor is asked about. `nuxt-cookie-control`
 * stores the chosen ids in its own cookies (`ncc_c`, `ncc_e`); the consent UI is
 * the app's (`components/consent/`). Kept free of auto-imports: `nuxt.config.ts`
 * (through `config/cookie-control.ts`) and `sentry.client.config.ts` read it too.
 */
export const CONSENT_COOKIE_IDS = {
	/** Better Auth's `wolfstar-session.*` cookies. */
	signIn: "s",
	/** nuxt-skew-protection's `__nkpv` version cookie. */
	version: "v",
	/** The two cookies that remember the choice itself. */
	choice: "c",
	/** Sentry Session Replay: the only group that waits for consent. */
	sessionReplay: "r",
} as const;

/** Separator `nuxt-cookie-control` joins the enabled ids with in its `ncc_e` cookie. */
const ENABLED_IDS_SEPARATOR = "~";

interface ConsentCookieSnapshot {
	/** Value of the module's "consent given" cookie (`ncc_c`). */
	consentGiven: string | null | undefined;
	/** Value of the module's "enabled ids" cookie (`ncc_e`). */
	enabledIds: string | null | undefined;
	/** Every configured cookie id, necessary first, as the module orders them. */
	allIds: readonly string[];
}

/**
 * The ids the visitor turned on, read the way the module's plugin reads them: a
 * choice only counts while `ncc_c` still names every configured id, so adding a
 * cookie group asks the visitor again.
 */
export function readConsentedIds({
	consentGiven,
	enabledIds,
	allIds,
}: ConsentCookieSnapshot): string[] {
	if (!consentGiven || consentGiven !== allIds.join("")) return [];
	return enabledIds ? enabledIds.split(ENABLED_IDS_SEPARATOR) : [];
}

/**
 * A cookie's value as the browser holds it now, outside any Nuxt context.
 * `useCookie()` may have written a string JSON-quoted, which is unwrapped. A
 * value that does not decode counts as no cookie: it is read while Sentry
 * starts, which a malformed cookie must not stop.
 */
export function readDocumentCookie(
	name: string,
	cookies = globalThis.document?.cookie ?? "",
): string | undefined {
	const prefix = `${name}=`;
	const entry = cookies.split("; ").find((part) => part.startsWith(prefix));
	if (entry === undefined) return undefined;
	let value: string;
	try {
		value = decodeURIComponent(entry.slice(prefix.length));
	} catch {
		return undefined;
	}
	if (!value.startsWith('"')) return value;
	try {
		const parsed: unknown = JSON.parse(value);
		return typeof parsed === "string" ? parsed : value;
	} catch {
		return value;
	}
}
