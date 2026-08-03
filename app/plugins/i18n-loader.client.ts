import { isAppLocaleCode } from "~/utils/is-app-locale";

/**
 * Map legacy UI locale codes onto wolfstar-aligned names.
 * Users may still have the old value in `user-prefers-locale`.
 * (`en` / `es` stay valid as base dirs but are not selectable UI codes.)
 */
const LEGACY_LOCALE_ALIASES: Record<string, string> = {
	"cs-CZ": "cs",
	"da-DK": "da",
	"de-DE": "de",
	"el-GR": "el",
	"fi-FI": "fi",
	"fr-FR": "fr",
	"hi-IN": "hi",
	"hr-HR": "hr",
	"hu-HU": "hu",
	"id-ID": "id",
	"it-IT": "it",
	"ko-KR": "ko",
	"lt-LT": "lt",
	"nl-NL": "nl",
	"pt-PT": "pt-BR",
	"ro-RO": "ro",
	"ru-RU": "ru",
	"tr-TR": "tr",
	"uk-UA": "uk",
};

function resolveStoredLocale(stored: string): string {
	return LEGACY_LOCALE_ALIASES[stored] ?? stored;
}

export default defineNuxtPlugin({
	enforce: "post",
	env: { islands: false },
	setup() {
		const { $i18n } = useNuxtApp();
		const { locale, setLocale } = $i18n;
		const { preferredLocale, setPreferredLocale } = usePreferredLocale();
		const storedLocale = preferredLocale.value;

		if (!storedLocale) return;

		const resolved = resolveStoredLocale(storedLocale);
		if (resolved !== storedLocale) {
			setPreferredLocale(resolved);
		}

		if (isAppLocaleCode(resolved) && resolved !== locale.value) {
			void setLocale(resolved);
		}
	},
});
