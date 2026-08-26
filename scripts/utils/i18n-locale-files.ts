import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import localeFeatures from "../../i18n/locale-features.json" with { type: "json" };

export const LOCALES_DIRECTORY = join(import.meta.dirname, "../../i18n/locales");
export const REFERENCE_LOCALE = "en";
export const FEATURE_FILES = localeFeatures.features as readonly string[];

type NestedObject = Record<string, unknown>;

/** Feature JSON paths for a locale, relative to `i18n/locales/`. */
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
