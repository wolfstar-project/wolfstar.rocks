import type { NuxtPage } from "nuxt/schema";
import { defineNuxtModule } from "nuxt/kit";

/**
 * Nuxt I18n Micro's `no_prefix` strategy still gives every page `alias` a
 * locale-prefixed twin: `/wolfstar`'s alias `/` becomes a `localized-wolfstar`
 * route at `/:locale(…)`, `/profile`'s `/account` becomes `/:locale(…)/account`.
 * `switchLocale()` prefers that twin, so changing the language on one of those
 * pages navigated to `/it-IT`, a URL the app never meant to have.
 *
 * With `no_prefix` the locale never belongs in the path, so the twins are
 * dropped once the module has added them. The module's own `pages:resolved`
 * hook runs first: local modules are installed after the ones listed in
 * `nuxt.config.ts`.
 */
const MODULE_NAME = "wolfstar:i18n-no-prefix-aliases";
const LOCALIZED_ROUTE_PREFIX = "localized-";

/** Removes the locale-prefixed twins from a page tree, children included. */
export function dropLocalizedAliasPages(pages: NuxtPage[]): void {
	for (let index = pages.length - 1; index >= 0; index--) {
		const page = pages[index];
		if (!page) continue;
		if (page.name?.startsWith(LOCALIZED_ROUTE_PREFIX)) {
			pages.splice(index, 1);
			continue;
		}
		if (page.children) dropLocalizedAliasPages(page.children);
	}
}

export default defineNuxtModule({
	meta: {
		name: MODULE_NAME,
	},
	setup(_, nuxt) {
		nuxt.hook("pages:resolved", (pages) => {
			dropLocalizedAliasPages(pages);
		});
	},
});
