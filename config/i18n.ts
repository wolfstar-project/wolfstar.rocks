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
export const localeFeatureFiles = localeFeatures.features as readonly string[];

export function localeFilesFor(localeCode: string): string[] {
	return localeFeatureFiles.map((feature) => `${localeCode}/${feature}`);
}

/**
 * Country / regional variants that inherit from a base language file.
 * e.g. `en` → `en-US` / `en-GB`, mirroring npmx.dev's merge model.
 * Keep empty until a base language gains regional overrides.
 */
export const countryLocaleVariants: Record<string, (LocaleObjectData & { country?: boolean })[]> = {
	// Example for future expansion:
	// en: [
	// 	{ country: true, code: "en-US", name: "English (US)" },
	// 	{ code: "en-GB", name: "English (UK)" },
	// ],
};

const locales: LocaleObjectData[] = [
	{
		code: "en",
		files: localeFilesFor("en"),
		name: "English",
		language: "en-US",
	},
	{
		// Matches WolfStar/Skyra bot language keys (e.g. guild settings `language`)
		code: "es-ES",
		files: localeFilesFor("es-ES"),
		name: "Español",
		language: "es-ES",
	},
	{
		code: "it-IT",
		files: localeFilesFor("it-IT"),
		name: "Italiano",
		language: "it-IT",
	},
];

function buildLocales() {
	const useLocales = locales.reduce((acc, data) => {
		const localeVariants = countryLocaleVariants[data.code];
		if (localeVariants) {
			for (const variant of localeVariants) {
				const baseFiles = (data.files ?? []).map((file) =>
					typeof file === "string" ? file : file.path,
				);
				const entry: LocaleObjectData = {
					...data,
					code: variant.code,
					name: variant.name,
					files: [...baseFiles, `${variant.code}.json`],
				};
				delete entry.file;
				acc.push(entry);
			}
		} else {
			acc.push(data);
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
