import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { beforeEach } from "vitest";
import { currentLocales } from "../../config/i18n";
import { type LocaleMessages, mergeLocaleMessages } from "../../config/i18n-empty-placeholders";

/**
 * Nuxt I18n Micro does not bundle messages: the client fetches them from
 * `/{apiBaseUrl}/{page}/{locale}/data.json`, a route Nitro owns. Component tests
 * run against `@nuxt/test-utils`' in-browser h3 stub, which answers every
 * unregistered relative URL with a 404 — so without this every mounted component
 * renders raw translation keys instead of copy.
 *
 * The bundles served here are the ones the app ships, merged over `en-US` the
 * way the module's build-time fallback merge does, so tests assert real copy and
 * real fallback behaviour. They load lazily: only a locale a test actually asks
 * for is ever fetched.
 */
const DEFAULT_LOCALE = "en-US";
/** `disablePageLocales` collapses every route onto the single global bundle. */
const PAGE = "index";

const bundles = import.meta.glob<LocaleMessages>("../../i18n/.locales-build/*.json", {
	import: "default",
});

function loadBundle(code: string): Promise<LocaleMessages> {
	return bundles[`../../i18n/.locales-build/${code}.json`]?.() ?? Promise.resolve({});
}

async function resolveMessages(code: string): Promise<LocaleMessages> {
	const messages = await loadBundle(code);
	if (code === DEFAULT_LOCALE) return messages;
	return mergeLocaleMessages(await loadBundle(DEFAULT_LOCALE), messages);
}

// Endpoint registrations and the loaded dictionary both live on the per-test
// Nuxt app, so they have to be re-applied for every test rather than once per
// file. Seeding the dictionary directly is what makes the *first* render
// translated: the plugin's own initial load already ran while the browser entry
// booted the app, before any setup file could register an endpoint.
beforeEach(async () => {
	for (const { code } of currentLocales) {
		registerEndpoint(`/_locales/${PAGE}/${code}/data.json`, () => resolveMessages(code));
	}
	useNuxtApp().$mergeTranslations(await resolveMessages(DEFAULT_LOCALE));
});
