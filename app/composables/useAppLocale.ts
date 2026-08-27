import type { Locale } from "nuxt-i18n-micro";
import { isAppLocaleCode } from "~/utils/is-app-locale";

export interface LocaleSelectorDeps {
	getLocale: () => string;
	// Nuxt I18n Micro's own type declarations disagree with its runtime
	// behavior here: `useI18n().switchLocale` is typed as returning `void`,
	// but the implementation is async and genuinely worth awaiting (it drives
	// the loaded chunk before resolving). `await` accepts a non-promise value
	// as already-resolved, so the wider signature stays correct either way.
	switchLocale: (code: string) => void | Promise<void>;
	setPreferredLocale: (code: string) => void;
}

/**
 * Pure `selectLocale()` implementation, factored out of `useAppLocale()` so it
 * can be unit-tested without a Nuxt app instance: Nuxt I18n Micro injects
 * `useI18n()`'s properties as non-configurable getters
 * (`Object.defineProperty(nuxtApp, "$switchLocale", { get: () => value })`),
 * so a mounted-component test has no way to substitute `switchLocale` and
 * control its timing.
 *
 * Guards two races on rapid re-selection: a switch that resolves after a newer
 * one was already requested must not overwrite the newer choice, and a switch
 * that fails must not persist the locale it was attempting. `requestId`
 * captures which call was the most recently issued; only that call is allowed
 * to write to `wolfstar-settings` once (and if) its own switch settles.
 *
 * A failing newest request still needs to reconcile: an older, already-
 * resolved request may have changed the active locale while this one was in
 * flight, and that change was skipped above (its `requestId` was stale by
 * then). Re-reading `getLocale()` after the newest request rejects — and
 * persisting it only if it moved from the locale seen when this call
 * started — picks that up without re-persisting on a lone, unaccompanied
 * failure.
 */
export function createLocaleSelector({
	getLocale,
	switchLocale,
	setPreferredLocale,
}: LocaleSelectorDeps) {
	let latestRequestId = 0;

	return async function selectLocale(code: string): Promise<void> {
		const localeBeforeSwitch = getLocale();
		if (!isAppLocaleCode(code) || code === localeBeforeSwitch) return;
		const requestId = ++latestRequestId;
		try {
			await switchLocale(code);
		} catch (error) {
			if (requestId === latestRequestId) {
				const active = getLocale();
				if (active !== localeBeforeSwitch && isAppLocaleCode(active)) {
					setPreferredLocale(active);
				}
			}
			throw error;
		}
		if (requestId !== latestRequestId) return;
		setPreferredLocale(code);
	};
}

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

	const selectLocale = createLocaleSelector({
		getLocale: () => locale.value,
		switchLocale,
		setPreferredLocale,
	});

	function localeLabel(entry: Locale): string {
		return entry.displayName ?? entry.code;
	}

	return { locale, locales, localeLabel, selectLocale };
}
