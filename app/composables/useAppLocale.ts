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
 * Guards rapid re-selection, where several switches can be in flight at once
 * and settle (resolve or reject) in any order: the persisted preference must
 * always end up matching the most recently *requested* switch that actually
 * succeeded, ignoring both older successes it supersedes and newer failures
 * that never took effect.
 *
 * Each call gets a monotonic `requestId` and records its own outcome once
 * `switchLocale()` settles. `reconcile()` then walks outcomes from the
 * newest `requestId` down: the first pending (not-yet-settled) id it meets
 * means the true winner isn't known yet, so it stops and waits — a still
 * in-flight newer request could still succeed and supersede everything
 * below it. The first *settled* id it meets that succeeded is the winner
 * (everything newer than it already failed, or there was nothing newer),
 * and gets persisted, at most once. This naturally covers a newer request
 * failing either before or after an older one resolves, without special-
 * casing either order.
 *
 * A settled call's outcome is decided by comparing `getLocale()` to its own
 * attempted code, not by whether its promise resolved or rejected: a switch
 * can apply the new locale and only then have a later step in the same async
 * chain throw (e.g. a follow-up persistence call), in which case the page is
 * genuinely showing the new locale even though `switchLocale()` rejected.
 * Trusting the promise alone there would persist a stale, previously-applied
 * locale instead of the one actually on screen.
 */
export function createLocaleSelector({
	getLocale,
	switchLocale,
	setPreferredLocale,
}: LocaleSelectorDeps) {
	let latestRequestId = 0;
	let lastPersistedRequestId = 0;
	const attemptedCode = new Map<number, string>();
	const outcome = new Map<number, "success" | "failure">();

	function reconcile() {
		for (let id = latestRequestId; id >= 1; id--) {
			const result = outcome.get(id);
			if (result === undefined) return;
			if (result === "success") {
				if (id > lastPersistedRequestId) {
					lastPersistedRequestId = id;
					const code = attemptedCode.get(id);
					if (code !== undefined) setPreferredLocale(code);
				}
				return;
			}
		}
	}

	return async function selectLocale(code: string): Promise<void> {
		if (!isAppLocaleCode(code) || code === getLocale()) return;
		const requestId = ++latestRequestId;
		attemptedCode.set(requestId, code);
		let caughtError: { value: unknown } | undefined;
		try {
			await switchLocale(code);
		} catch (error) {
			caughtError = { value: error };
		}
		outcome.set(requestId, getLocale() === code ? "success" : "failure");
		reconcile();
		if (caughtError) throw caughtError.value;
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
