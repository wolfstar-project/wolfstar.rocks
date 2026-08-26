import type { Locale } from "nuxt-i18n-micro";
import { isAppLocaleCode } from "~/utils/is-app-locale";

/**
 * Reactive view of the active locale on top of Nuxt I18n Micro, whose runtime
 * API exposes plain getters (`$getLocale()`, `$getLocales()`) rather than refs.
 * Every getter reads the shared locale state, so wrapping them in `computed()`
 * is what makes templates re-render on a locale switch.
 *
 * `selectLocale()` also persists the choice to `wolfstar-settings`, which is
 * what `app/plugins/i18n-locale.client.ts` replays on the next visit.
 */
export function useAppLocale() {
	const { getLocale, getLocales, switchLocale } = useI18n();
	const { setPreferredLocale } = usePreferredLocale();

	const locale = computed<string>(() => getLocale());
	const locales = computed<Locale[]>(() => getLocales());

	async function selectLocale(code: string): Promise<void> {
		if (!isAppLocaleCode(code) || code === locale.value) return;
		setPreferredLocale(code);
		await switchLocale(code);
	}

	function localeLabel(entry: Locale): string {
		return entry.displayName ?? entry.code;
	}

	return { locale, locales, localeLabel, selectLocale };
}
