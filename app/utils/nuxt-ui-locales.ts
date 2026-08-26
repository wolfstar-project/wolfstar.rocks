import {
	cs,
	da,
	de,
	el,
	en,
	en_gb,
	es,
	fi,
	fr,
	hi,
	hr,
	hu,
	id,
	it,
	ko,
	lt,
	nl,
	pt,
	ro,
	ru,
	tr,
	uk,
} from "@nuxt/ui/locale";
import { currentLocales } from "~~/config/i18n";

type NuxtUiLocale = typeof en;

/** Map app locale codes → Nuxt UI locale packs (codes remapped to match i18n). */
const nuxtUiLocaleByCode: Record<string, NuxtUiLocale> = {
	"cs-CZ": { ...cs, code: "cs-CZ" },
	"da-DK": { ...da, code: "da-DK" },
	"de-DE": { ...de, code: "de-DE" },
	"el-GR": { ...el, code: "el-GR" },
	"en-GB": { ...en_gb, code: "en-GB" },
	"en-US": { ...en, code: "en-US" },
	"es-419": { ...es, code: "es-419" },
	"es-ES": { ...es, code: "es-ES" },
	"fi-FI": { ...fi, code: "fi-FI" },
	"fr-FR": { ...fr, code: "fr-FR" },
	"hi-IN": { ...hi, code: "hi-IN" },
	"hr-HR": { ...hr, code: "hr-HR" },
	"hu-HU": { ...hu, code: "hu-HU" },
	"id-ID": { ...id, code: "id-ID" },
	"it-IT": { ...it, code: "it-IT" },
	"ko-KR": { ...ko, code: "ko-KR" },
	"lt-LT": { ...lt, code: "lt-LT" },
	"nl-NL": { ...nl, code: "nl-NL" },
	"pt-PT": { ...pt, code: "pt-PT" },
	"ro-RO": { ...ro, code: "ro-RO" },
	"ru-RU": { ...ru, code: "ru-RU" },
	"tr-TR": { ...tr, code: "tr-TR" },
	"uk-UA": { ...uk, code: "uk-UA" },
};

/**
 * Locale packs for `ULocaleSelect`, covering every app locale from i18n config.
 * Falls back to the English pack with the app locale code/name when Nuxt UI
 * does not ship a matching pack.
 */
export function getNuxtUiLocales(): NuxtUiLocale[] {
	return currentLocales.map((appLocale) => {
		const pack = nuxtUiLocaleByCode[appLocale.code];
		if (pack) return pack;
		return Object.assign({}, en, {
			code: appLocale.code,
			name: appLocale.displayName ?? appLocale.code,
		});
	});
}
