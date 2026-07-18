import { currentLocales } from "~~/config/i18n";

export type AppLocaleCode = (typeof currentLocales)[number]["code"];

const APP_LOCALE_CODES = new Set<string>(currentLocales.map((locale) => locale.code));

export function isAppLocaleCode(value: string): value is AppLocaleCode {
	return APP_LOCALE_CODES.has(value);
}
