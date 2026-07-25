import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import localeFeatures from "../../i18n/locale-features.json" with { type: "json" };

export const LOCALES_DIRECTORY = join(import.meta.dirname, "../../i18n/locales");
export const REFERENCE_LOCALE = "en";
export const FEATURE_FILES = localeFeatures.features as readonly string[];

/**
 * Key prefixes resolved dynamically at runtime (e.g. `t(`auth.errors.${code}`)`,
 * `useSettingsEntryI18n()`), so `vue-i18n-extract` cannot see them statically.
 * They must be excluded from the unused-key report to avoid false positives.
 */
export const DYNAMIC_KEY_PREFIXES = ["settings.entries", "auth.errors"] as const;

/** Prefixes excluded from `vue-i18n-extract` reports (`$schema` + dynamic keys). */
export const I18N_REPORT_EXCLUDES = ["$schema", ...DYNAMIC_KEY_PREFIXES] as const;

type NestedObject = Record<string, unknown>;

/** Feature JSON paths for a locale, relative to langDir (`locales/`). */
export function localeFeaturePaths(localeCode: string): string[] {
	return FEATURE_FILES.map((feature) => `${localeCode}/${feature}`);
}

/** Absolute path to a locale feature file. */
export function localeFeatureAbsolutePath(localeCode: string, featureFile: string): string {
	return join(LOCALES_DIRECTORY, localeCode, featureFile);
}

export function listLocaleCodes(): string[] {
	if (!existsSync(LOCALES_DIRECTORY)) return [];
	return readdirSync(LOCALES_DIRECTORY, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.toSorted((a, b) => a.localeCompare(b));
}

export function readFeatureFile(localeCode: string, featureFile: string): NestedObject {
	const filePath = localeFeatureAbsolutePath(localeCode, featureFile);
	return JSON.parse(readFileSync(filePath, "utf-8")) as NestedObject;
}

/** Deep-merge all feature files for a locale into one object (for tooling/status). */
export function loadMergedLocale(localeCode: string): NestedObject {
	const merged: NestedObject = {};
	for (const feature of FEATURE_FILES) {
		const content = readFeatureFile(localeCode, feature);
		for (const [key, value] of Object.entries(content)) {
			if (key === "$schema") continue;
			merged[key] = value;
		}
	}
	return merged;
}

export function withoutSchema(obj: NestedObject): NestedObject {
	const { $schema: _, ...rest } = obj;
	return rest;
}

/**
 * Write the merged reference locale to a single temp `en.json` and return its path.
 *
 * `vue-i18n-extract` derives a "language" from each source filename, so globbing the
 * per-feature files (`en/*.json`) makes it treat every feature as its own language and
 * report a flood of false "missing" keys. Merging into one file avoids that.
 */
export function writeMergedReferenceLocaleFile(localeCode: string = REFERENCE_LOCALE): string {
	const merged = loadMergedLocale(localeCode);
	const directory = mkdtempSync(join(tmpdir(), "wolfstar-i18n-"));
	const filePath = join(directory, `${localeCode}.json`);
	writeFileSync(filePath, JSON.stringify(merged, null, 2), "utf-8");
	return filePath;
}
