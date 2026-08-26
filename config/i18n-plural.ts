import type { PluralFunc } from "nuxt-i18n-micro";

/**
 * Pluralization for locales whose form count differs from the built-in
 * "form index equals count" rule (Czech, Hungarian, Russian, Ukrainian).
 *
 * Returning `null` hands the key back to Nuxt I18n Micro's `defaultPlural`,
 * which is already correct for the English-style `zero | one | other` sources
 * used by every other locale.
 *
 * The module serializes this function with `.toString()` into
 * `.nuxt/i18n.plural.mjs`, so it must stay self-contained: no imports, no
 * references to module-scope bindings.
 */
export const plural: PluralFunc = (key, count, params, locale, getter) => {
	// Intl.PluralRules category → index into the pipe-separated forms.
	const PLURAL_FORM_INDEX = {
		"cs-CZ": { zero: 2, one: 0, two: 1, few: 1, many: 2, other: 2 },
		"hu-HU": { zero: 0, one: 0, two: 1, few: 1, many: 1, other: 1 },
		"ru-RU": { zero: 2, one: 0, two: 1, few: 1, many: 2, other: 3 },
		"uk-UA": { zero: 2, one: 0, two: 1, few: 1, many: 2, other: 3 },
	};

	const source = getter(key, params);
	if (typeof source !== "string") return null;

	const forms = source.split("|").map((form) => form.trim());
	if (forms.length === 0) return null;

	const mapping = PLURAL_FORM_INDEX[locale as keyof typeof PLURAL_FORM_INDEX];
	if (!mapping) return null;

	const category = new Intl.PluralRules(locale).select(count);
	const index = Math.min(mapping[category] ?? 0, forms.length - 1);
	const form = forms[index];

	return form === undefined ? null : form.replaceAll("{count}", count.toString());
};
