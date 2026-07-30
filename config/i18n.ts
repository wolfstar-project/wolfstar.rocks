import type {
	DateTimeFormats,
	NumberFormats,
	PluralizationRule,
	PluralizationRules,
} from "@intlify/core-base";
import type { LocaleObject } from "@nuxtjs/i18n";
import localeFeatures from "../i18n/locale-features.json" with { type: "json" };

interface LocaleObjectData extends LocaleObject {
	numberFormats?: NumberFormats;
	dateTimeFormats?: DateTimeFormats;
	pluralRule?: PluralizationRule;
}

/**
 * Feature message files loaded (and deep-merged) per locale via `files`.
 * Layout: `i18n/locales/{locale}/{feature}.json`
 * Lazy-loading is always on in @nuxtjs/i18n v10 when using `file`/`files`.
 */
const localeFeatureFiles = localeFeatures.features as readonly string[];

function localeFilesFor(localeCode: string): string[] {
	return localeFeatureFiles.map((feature) => `${localeCode}/${feature}`);
}

/**
 * Country / regional variants that inherit from a base language directory.
 * Each variant loads `locales/{base}/*.json` then `locales/{variant}/*.json`.
 *
 * e.g. `en` (US copy) → `en-US` / `en-GB`; `es` (Spain copy) → `es-ES` / `es-419`.
 */
export const countryLocaleVariants: Record<string, (LocaleObjectData & { country?: boolean })[]> = {
	es: [
		// es/ contains es-ES translations
		{ country: true, code: "es-ES", name: "Español (España)" },
		// TODO: Support es-419, if we include spanish country variants remove also fix on utils/language.ts module
		{ code: "es-419", name: "Español (Latinoamérica)" },
	],
	en: [
		// en/ contains en-US translations
		{ country: true, code: "en-US", name: "English (US)" },
		{ code: "en-GB", name: "English (UK)" },
	],
};

function createPluralRule(locale: string, mapping: Record<string, number>) {
	return (choice: number, choicesLength: number) => {
		const name = new Intl.PluralRules(locale).select(choice);
		const plural = mapping[name] || 0;

		// In case translation doesn't have all plural forms, use the last available form
		if (plural > choicesLength - 1) {
			if (import.meta.dev) {
				// oxlint-disable-next-line no-console -- warn logging
				console.warn(
					`Plural form index ${plural} for choice ${choice} exceeds available forms ${choicesLength} for locale ${locale}.`,
				);
			}
			return choicesLength - 1;
		}

		return plural;
	};
}

/**
 * Base locales registered with Nuxt i18n.
 * Codes that appear in `countryLocaleVariants` expand into regional variants
 * and are not themselves selectable.
 *
 * Base codes like `en` / `es` are typed loosely because `@nuxtjs/i18n`
 * generates its Locale union from the *expanded* currentLocales.
 */
const locales: (LocaleObjectData | (Omit<LocaleObjectData, "code"> & { code: string }))[] = [
	{
		code: "en",
		files: localeFilesFor("en"),
		name: "English",
		language: "en-US",
	},
	{
		code: "es",
		files: localeFilesFor("es"),
		name: "Español",
		language: "es-ES",
	},
	{
		code: "it-IT",
		files: localeFilesFor("it-IT"),
		name: "Italiano",
		language: "it-IT",
	},
	{
		code: "cs-CZ",
		files: localeFilesFor("cs-CZ"),
		name: "Čeština",
		language: "cs-CZ",
		pluralRule: createPluralRule("cs-CZ", {
			zero: 2,
			one: 0,
			two: 1,
			few: 1,
			many: 2,
			other: 2,
		}),
	},
	{
		code: "da-DK",
		files: localeFilesFor("da-DK"),
		name: "Dansk",
		language: "da-DK",
	},
	{
		code: "de-DE",
		files: localeFilesFor("de-DE"),
		name: "Deutsch",
		language: "de-DE",
	},
	{
		code: "el-GR",
		files: localeFilesFor("el-GR"),
		name: "Ελληνικά",
		language: "el-GR",
	},
	{
		code: "fi-FI",
		files: localeFilesFor("fi-FI"),
		name: "Suomi",
		language: "fi-FI",
	},
	{
		code: "fr-FR",
		files: localeFilesFor("fr-FR"),
		name: "Français",
		language: "fr-FR",
	},
	{
		code: "hi-IN",
		files: localeFilesFor("hi-IN"),
		name: "हिंदी",
		language: "hi-IN",
	},
	{
		code: "hr-HR",
		files: localeFilesFor("hr-HR"),
		name: "Hrvatski",
		language: "hr-HR",
	},
	{
		code: "hu-HU",
		files: localeFilesFor("hu-HU"),
		name: "Magyar",
		language: "hu-HU",
		pluralRule: createPluralRule("hu-HU", {
			zero: 0,
			one: 0,
			two: 1,
			few: 1,
			many: 1,
			other: 1,
		}),
	},
	{
		code: "id-ID",
		files: localeFilesFor("id-ID"),
		name: "Indonesia",
		language: "id-ID",
	},
	{
		code: "ko-KR",
		files: localeFilesFor("ko-KR"),
		name: "한국어",
		language: "ko-KR",
	},
	{
		code: "lt-LT",
		files: localeFilesFor("lt-LT"),
		name: "Lietuvių",
		language: "lt-LT",
	},
	{
		code: "nl-NL",
		files: localeFilesFor("nl-NL"),
		name: "Nederlands",
		language: "nl-NL",
	},
	{
		code: "pt-PT",
		files: localeFilesFor("pt-PT"),
		name: "Português (Portugal)",
		language: "pt-PT",
	},
	{
		code: "ro-RO",
		files: localeFilesFor("ro-RO"),
		name: "Română",
		language: "ro-RO",
	},
	{
		code: "ru-RU",
		files: localeFilesFor("ru-RU"),
		name: "Русский",
		language: "ru-RU",
		pluralRule: createPluralRule("ru-RU", {
			zero: 2,
			one: 0,
			two: 1,
			few: 1,
			many: 2,
			other: 3,
		}),
	},
	{
		code: "tr-TR",
		files: localeFilesFor("tr-TR"),
		name: "Türkçe",
		language: "tr-TR",
	},
	{
		code: "uk-UA",
		files: localeFilesFor("uk-UA"),
		name: "Українська",
		language: "uk-UA",
		pluralRule: createPluralRule("uk-UA", {
			zero: 2,
			one: 0,
			two: 1,
			few: 1,
			many: 2,
			other: 3,
		}),
	},
];

/**
 * Expand base locales into country variants:
 * `[...baseFeatures, ...variantFeatures]`.
 */
function buildLocales() {
	const useLocales = locales.reduce((acc, data) => {
		const localeVariants = countryLocaleVariants[data.code];
		if (localeVariants) {
			const baseFiles = localeFilesFor(data.code);
			for (const variant of localeVariants) {
				const entry: LocaleObjectData = {
					...data,
					code: variant.code,
					name: variant.name,
					language: variant.code,
					files: [...baseFiles, ...localeFilesFor(variant.code)],
				};
				delete entry.file;
				acc.push(entry);
			}
		} else {
			acc.push(data as LocaleObjectData);
		}
		return acc;
	}, [] as LocaleObjectData[]);

	return useLocales.toSorted((a, b) => a.code.localeCompare(b.code));
}

export const currentLocales = buildLocales();

export const datetimeFormats = Object.values(currentLocales).reduce((acc, data) => {
	const dateTimeFormats = data.dateTimeFormats;
	if (dateTimeFormats) {
		acc[data.code] = { ...dateTimeFormats };
		delete data.dateTimeFormats;
	} else {
		acc[data.code] = {
			shortDate: {
				dateStyle: "short",
			},
			short: {
				dateStyle: "short",
				timeStyle: "short",
			},
			long: {
				dateStyle: "long",
				timeStyle: "medium",
			},
		};
	}

	return acc;
}, {} as DateTimeFormats);

export const numberFormats = Object.values(currentLocales).reduce((acc, data) => {
	const numberFormatsArray = data.numberFormats;
	if (numberFormatsArray) {
		acc[data.code] = { ...numberFormatsArray };
		delete data.numberFormats;
	} else {
		acc[data.code] = {
			percentage: {
				style: "percent",
				maximumFractionDigits: 1,
			},
			smallCounting: {
				style: "decimal",
				maximumFractionDigits: 0,
			},
			kiloCounting: {
				notation: "compact",
				compactDisplay: "short",
				maximumFractionDigits: 1,
			},
			millionCounting: {
				notation: "compact",
				compactDisplay: "short",
				maximumFractionDigits: 2,
			},
		};
	}

	return acc;
}, {} as NumberFormats);

export const pluralRules = Object.values(currentLocales).reduce((acc, data) => {
	const pluralRule = data.pluralRule;
	if (pluralRule) {
		acc[data.code] = pluralRule;
		delete data.pluralRule;
	}

	return acc;
}, {} as PluralizationRules);
