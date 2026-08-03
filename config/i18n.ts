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
 * Non-regional codes match wolfstar-project/wolfstar `src/languages/` (`de`,
 * `it`, `pt-BR`, …). Base codes like `en` / `es` are typed loosely because
 * `@nuxtjs/i18n` generates its Locale union from the *expanded* currentLocales.
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
		code: "it",
		files: localeFilesFor("it"),
		name: "Italiano",
		language: "it",
	},
	{
		code: "cs",
		files: localeFilesFor("cs"),
		name: "Čeština",
		language: "cs",
		pluralRule: createPluralRule("cs", {
			zero: 2,
			one: 0,
			two: 1,
			few: 1,
			many: 2,
			other: 2,
		}),
	},
	{
		code: "da",
		files: localeFilesFor("da"),
		name: "Dansk",
		language: "da",
	},
	{
		code: "de",
		files: localeFilesFor("de"),
		name: "Deutsch",
		language: "de",
	},
	{
		code: "el",
		files: localeFilesFor("el"),
		name: "Ελληνικά",
		language: "el",
	},
	{
		code: "fi",
		files: localeFilesFor("fi"),
		name: "Suomi",
		language: "fi",
	},
	{
		code: "fr",
		files: localeFilesFor("fr"),
		name: "Français",
		language: "fr",
	},
	{
		code: "hi",
		files: localeFilesFor("hi"),
		name: "हिंदी",
		language: "hi",
	},
	{
		code: "hr",
		files: localeFilesFor("hr"),
		name: "Hrvatski",
		language: "hr",
	},
	{
		code: "hu",
		files: localeFilesFor("hu"),
		name: "Magyar",
		language: "hu",
		pluralRule: createPluralRule("hu", {
			zero: 0,
			one: 0,
			two: 1,
			few: 1,
			many: 1,
			other: 1,
		}),
	},
	{
		code: "id",
		files: localeFilesFor("id"),
		name: "Indonesia",
		language: "id",
	},
	{
		code: "ko",
		files: localeFilesFor("ko"),
		name: "한국어",
		language: "ko",
	},
	{
		code: "lt",
		files: localeFilesFor("lt"),
		name: "Lietuvių",
		language: "lt",
	},
	{
		code: "nl",
		files: localeFilesFor("nl"),
		name: "Nederlands",
		language: "nl",
	},
	{
		code: "pt-BR",
		files: localeFilesFor("pt-BR"),
		name: "Português (Brasil)",
		language: "pt-BR",
	},
	{
		code: "ro",
		files: localeFilesFor("ro"),
		name: "Română",
		language: "ro",
	},
	{
		code: "ru",
		files: localeFilesFor("ru"),
		name: "Русский",
		language: "ru",
		pluralRule: createPluralRule("ru", {
			zero: 2,
			one: 0,
			two: 1,
			few: 1,
			many: 2,
			other: 3,
		}),
	},
	{
		code: "tr",
		files: localeFilesFor("tr"),
		name: "Türkçe",
		language: "tr",
	},
	{
		code: "uk",
		files: localeFilesFor("uk"),
		name: "Українська",
		language: "uk",
		pluralRule: createPluralRule("uk", {
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
