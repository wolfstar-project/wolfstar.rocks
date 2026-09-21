import { isAppLocaleCode } from "~/utils/is-app-locale";

/**
 * `wolfstar-settings` (localStorage) is the source of truth for the user's
 * locale choice, while Nuxt I18n Micro renders SSR from its own
 * `wolfstar-locale` cookie. Replay the stored preference on the client so a
 * choice made before the cookie existed — or in another tab — still wins.
 */
export default defineNuxtPlugin({
	enforce: "post",
	env: { islands: false },
	async setup() {
		const { getLocale, switchLocale } = useI18n();
		const { preferredLocale } = usePreferredLocale();
		const storedLocale = preferredLocale.value;

		if (storedLocale && isAppLocaleCode(storedLocale) && storedLocale !== getLocale()) {
			await switchLocale(storedLocale);
		}
	},
});
