import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { currentLocales } from "../../../config/i18n";
import {
	FEATURE_FILES,
	LOCALES_DIRECTORY,
	REFERENCE_LOCALE,
	listLocaleCodes,
	loadMergedLocale,
	localeFeatureAbsolutePath,
} from "../../../scripts/utils/i18n-locale-files";

type Nested = Record<string, unknown>;

function collectKeys(obj: Nested, prefix = ""): string[] {
	const keys: string[] = [];
	for (const [key, value] of Object.entries(obj)) {
		if (key === "$schema") continue;
		const path = prefix ? `${prefix}.${key}` : key;
		if (typeof value === "object" && value !== null && !Array.isArray(value)) {
			keys.push(...collectKeys(value as Nested, path));
		} else {
			keys.push(path);
		}
	}
	return keys;
}

function collectEntries(obj: Nested, prefix = ""): [string, unknown][] {
	const entries: [string, unknown][] = [];
	for (const [key, value] of Object.entries(obj)) {
		if (key === "$schema") continue;
		const path = prefix ? `${prefix}.${key}` : key;
		if (typeof value === "object" && value !== null && !Array.isArray(value)) {
			entries.push(...collectEntries(value as Nested, path));
		} else {
			entries.push([path, value]);
		}
	}
	return entries;
}

describe("i18n locale files", () => {
	it("has a reference English feature directory", () => {
		expect(existsSync(join(LOCALES_DIRECTORY, REFERENCE_LOCALE))).toBe(true);
		for (const feature of FEATURE_FILES) {
			expect(
				existsSync(localeFeatureAbsolutePath(REFERENCE_LOCALE, feature)),
				`missing ${REFERENCE_LOCALE}/${feature}`,
			).toBe(true);
		}
	});

	it("registers feature files for every currentLocales entry", () => {
		for (const locale of currentLocales) {
			const files = locale.files ?? (locale.file ? [locale.file] : []);
			expect(files.length).toBeGreaterThan(0);
			for (const file of files) {
				const fileName = typeof file === "string" ? file : file.path;
				expect(existsSync(join(LOCALES_DIRECTORY, fileName)), `missing ${fileName}`).toBe(
					true,
				);
			}
		}
	});

	it("keeps non-English locales in sync with English feature keys", () => {
		const referenceKeys = new Set(collectKeys(loadMergedLocale(REFERENCE_LOCALE)));

		for (const locale of listLocaleCodes().filter((code) => code !== REFERENCE_LOCALE)) {
			const keys = new Set(collectKeys(loadMergedLocale(locale)));
			const missing = [...referenceKeys].filter((key) => !keys.has(key));
			const extra = [...keys].filter((key) => !referenceKeys.has(key));
			expect(missing, `${locale} missing keys`).toEqual([]);
			expect(extra, `${locale} extra keys`).toEqual([]);
		}
	});

	it("never bulk-copies the English source into another language", () => {
		// `en-US` / `en-GB` are English variants layered on top of `en/*`, so their
		// values are legitimately identical to the reference.
		const englishVariants = new Set(["en-US", "en-GB"]);
		const reference = loadMergedLocale(REFERENCE_LOCALE) as Nested;
		const referenceValues = new Map(
			collectEntries(reference).map(([key, value]) => [key, value]),
		);

		for (const locale of listLocaleCodes()) {
			if (locale === REFERENCE_LOCALE || englishVariants.has(locale)) continue;

			const entries = collectEntries(loadMergedLocale(locale) as Nested);
			const copied = entries.filter(
				([key, value]) => value !== "" && value === referenceValues.get(key),
			);

			// Untranslated keys belong in the locale file as empty placeholders;
			// a locale whose every value equals `en/*` is a wholesale English copy.
			expect(copied.length, `${locale} duplicates every English source string`).toBeLessThan(
				entries.length,
			);
		}
	});

	it("only contains expected feature files per locale directory", () => {
		const expected = new Set(FEATURE_FILES);
		for (const locale of listLocaleCodes()) {
			const files = readdirSync(join(LOCALES_DIRECTORY, locale)).filter((f) =>
				f.endsWith(".json"),
			);
			expect(new Set(files)).toEqual(expected);
		}
	});
});
