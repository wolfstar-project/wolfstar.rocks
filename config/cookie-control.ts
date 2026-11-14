import type { ModuleOptions } from "@dargmuesli/nuxt-cookie-control";
import { CONSENT_COOKIE_IDS } from "../app/utils/consent.ts";

/** How long a cookie choice is kept before the visitor is asked again: six months. */
const CHOICE_LIFETIME_MS = 1000 * 60 * 60 * 24 * 182;

/**
 * `nuxt-cookie-control` keeps the visitor's choice and writes its two cookies.
 * Its own bar, modal and stylesheet stay off: the banner and the dialog are the
 * app's (`app/components/consent/`), built from Nuxt UI so they follow the design
 * tokens and keep focus inside the dialog. The names and descriptions below are
 * the module's required fields; the UI shows the translated ones from the locale
 * files.
 */
export const cookieControl: ModuleOptions = {
	isCssEnabled: false,
	colors: false,
	isControlButtonEnabled: false,
	isIframeBlocked: false,
	cookieExpiryOffsetMs: CHOICE_LIFETIME_MS,
	cookieOptions: { path: "/", sameSite: "lax" },
	locales: ["en"],
	cookies: {
		necessary: [
			{
				id: CONSENT_COOKIE_IDS.signIn,
				name: "Sign-in",
				description: "Keeps you signed in with Discord.",
				targetCookieIds: [
					"wolfstar-session.session_token",
					"wolfstar-session.session_data",
					"wolfstar-session.account_data",
					"wolfstar-session.oauth_state",
				],
			},
			{
				id: CONSENT_COOKIE_IDS.version,
				name: "Site version",
				description: "Tells the server which version of the site a tab runs.",
				targetCookieIds: ["__nkpv"],
			},
			{
				id: CONSENT_COOKIE_IDS.choice,
				name: "Cookie choices",
				description: "Remembers the choice made in this dialog.",
				targetCookieIds: ["ncc_c", "ncc_e"],
			},
		],
		optional: [
			{
				id: CONSENT_COOKIE_IDS.sessionReplay,
				name: "Session replay",
				description:
					"Lets Sentry record a masked replay of a sample of dashboard sessions.",
			},
		],
	},
};
