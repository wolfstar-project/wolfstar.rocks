import type { Locale } from "nuxt-i18n-micro";
import localeFeatures from "../i18n/locale-features.json" with { type: "json" };

/**
 * Feature message files that make up one locale.
 * Layout: `i18n/locales/{sourceDir}/{feature}.json`
 *
 * Nuxt I18n Micro loads a single `{locale}.json` per locale, so
 * `modules/i18n-locale-bundles.ts` merges these feature files (and the base
 * directory of a regional variant) into that one file at build time.
 */
export const localeFeatureFiles = localeFeatures.features as readonly string[];

interface BaseLocaleDefinition {
	/** Directory under `i18n/locales/` holding this locale's feature files. */
	sourceDir: string;
	displayName: string;
	iso: string;
	dir?: Locale["dir"];
}

/**
 * Country / regional variants that inherit from a base language directory.
 * Each variant merges `locales/{base}/*.json` then `locales/{variant}/*.json`,
 * so an untranslated key in the variant keeps the base translation.
 *
 * e.g. `en` (US copy) → `en-US` / `en-GB`; `es` (Spain copy) → `es-ES` / `es-419`.
 */
export const countryLocaleVariants: Record<string, { code: string; displayName: string }[]> = {
	es: [
		// es/ contains es-ES translations
		{ code: "es-ES", displayName: "Español (España)" },
		// TODO: Support es-419, if we include spanish country variants remove also fix on utils/language.ts module
		{ code: "es-419", displayName: "Español (Latinoamérica)" },
	],
	en: [
		// en/ contains en-US translations
		{ code: "en-US", displayName: "English (US)" },
		{ code: "en-GB", displayName: "English (UK)" },
	],
};

/**
 * Base locales. Codes that appear in `countryLocaleVariants` expand into
 * regional variants and are not themselves selectable.
 */
const baseLocales: BaseLocaleDefinition[] = [
	{ sourceDir: "en", displayName: "English", iso: "en-US" },
	{ sourceDir: "es", displayName: "Español", iso: "es-ES" },
	{ sourceDir: "it-IT", displayName: "Italiano", iso: "it-IT" },
	{ sourceDir: "cs-CZ", displayName: "Čeština", iso: "cs-CZ" },
	{ sourceDir: "da-DK", displayName: "Dansk", iso: "da-DK" },
	{ sourceDir: "de-DE", displayName: "Deutsch", iso: "de-DE" },
	{ sourceDir: "el-GR", displayName: "Ελληνικά", iso: "el-GR" },
	{ sourceDir: "fi-FI", displayName: "Suomi", iso: "fi-FI" },
	{ sourceDir: "fr-FR", displayName: "Français", iso: "fr-FR" },
	{ sourceDir: "hi-IN", displayName: "हिंदी", iso: "hi-IN" },
	{ sourceDir: "hr-HR", displayName: "Hrvatski", iso: "hr-HR" },
	{ sourceDir: "hu-HU", displayName: "Magyar", iso: "hu-HU" },
	{ sourceDir: "id-ID", displayName: "Indonesia", iso: "id-ID" },
	{ sourceDir: "ko-KR", displayName: "한국어", iso: "ko-KR" },
	{ sourceDir: "lt-LT", displayName: "Lietuvių", iso: "lt-LT" },
	{ sourceDir: "nl-NL", displayName: "Nederlands", iso: "nl-NL" },
	{ sourceDir: "pt-PT", displayName: "Português (Portugal)", iso: "pt-PT" },
	{ sourceDir: "ro-RO", displayName: "Română", iso: "ro-RO" },
	{ sourceDir: "ru-RU", displayName: "Русский", iso: "ru-RU" },
	{ sourceDir: "tr-TR", displayName: "Türkçe", iso: "tr-TR" },
	{ sourceDir: "uk-UA", displayName: "Українська", iso: "uk-UA" },
];

interface BuiltLocales {
	locales: Locale[];
	/** Locale code → source directories to merge, in precedence order. */
	sourceDirs: Record<string, string[]>;
}

function buildLocales(): BuiltLocales {
	const locales: Locale[] = [];
	const sourceDirs: Record<string, string[]> = {};

	for (const base of baseLocales) {
		const variants = countryLocaleVariants[base.sourceDir];
		if (variants) {
			for (const variant of variants) {
				locales.push({
					code: variant.code,
					displayName: variant.displayName,
					iso: variant.code,
					...(base.dir ? { dir: base.dir } : {}),
				});
				sourceDirs[variant.code] = [base.sourceDir, variant.code];
			}
			continue;
		}

		locales.push({
			code: base.sourceDir,
			displayName: base.displayName,
			iso: base.iso,
			...(base.dir ? { dir: base.dir } : {}),
		});
		sourceDirs[base.sourceDir] = [base.sourceDir];
	}

	return {
		locales: locales.toSorted((a, b) => a.code.localeCompare(b.code)),
		sourceDirs,
	};
}

const built = buildLocales();

export const currentLocales = built.locales;

/**
 * Locale code → the `i18n/locales/` directories merged into its bundle, in
 * precedence order (base first, regional variant last).
 */
export const localeSourceDirs = built.sourceDirs;

const DEFAULT_DATETIME_FORMATS: Record<string, Intl.DateTimeFormatOptions> = {
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

const DEFAULT_NUMBER_FORMATS: Record<string, Intl.NumberFormatOptions> = {
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

export const datetimeFormats: Record<
	string,
	Record<string, Intl.DateTimeFormatOptions>
> = Object.fromEntries(
	currentLocales.map((locale) => [locale.code, { ...DEFAULT_DATETIME_FORMATS }]),
);

export const numberFormats: Record<
	string,
	Record<string, Intl.NumberFormatOptions>
> = Object.fromEntries(
	currentLocales.map((locale) => [locale.code, { ...DEFAULT_NUMBER_FORMATS }]),
);
