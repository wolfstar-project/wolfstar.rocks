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
