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
 * The Nuxt UI locale pack for an app locale, for `UApp`, so the library's own
 * strings (menus, search fields, close buttons) follow the language on screen.
 * Falls back to the English pack, under the app's code and name, when Nuxt UI
 * ships none for it.
 */
export function getNuxtUiLocale(code: string): NuxtUiLocale {
	const pack = nuxtUiLocaleByCode[code];
	if (pack) return pack;
	const appLocale = currentLocales.find((entry) => entry.code === code);
	return Object.assign({}, en, { code, name: appLocale?.displayName ?? code });
}
