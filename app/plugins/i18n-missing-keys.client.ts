/**
 * `nuxt-seo-utils` looks up an optional `pages.<route>.title` for its fallback
 * title, passing vue-i18n's `{ missingWarn: false }`, which Nuxt I18n Micro
 * does not read: every page warned about a key nobody is meant to add. Those
 * lookups stay quiet; any other missing key still warns as before, in dev.
 */
const OPTIONAL_PAGE_TITLE_KEY = /^pages\.[^.]+\.title$/;

export default defineNuxtPlugin({
	enforce: "post",
	env: { islands: false },
	setup(nuxtApp) {
		if (!import.meta.dev) return;

		nuxtApp.$setMissingHandler((locale, key, routeName) => {
			if (OPTIONAL_PAGE_TITLE_KEY.test(key)) return;
			console.warn(`[i18n] Missing key '${key}' in '${locale}' for route '${routeName}'`);
		});
	},
});
