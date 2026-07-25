/* oxlint-disable no-console */
import { existsSync, writeFileSync } from "node:fs";
import * as process from "node:process";
import { COLORS } from "./utils/colors.ts";
import {
	FEATURE_FILES,
	REFERENCE_LOCALE,
	listLocaleCodes,
	loadMergedLocale,
	localeFeatureAbsolutePath,
	readFeatureFile,
	withoutSchema,
} from "./utils/i18n-locale-files.ts";

type NestedObject = { [key: string]: unknown };

type SyncStats = {
	missing: string[];
	extra: string[];
	referenceKeys: string[];
	feature: string;
	locale: string;
};

const isNested = (val: unknown): val is NestedObject =>
	val !== null && typeof val === "object" && !Array.isArray(val);

const syncLocaleData = (
	reference: NestedObject,
	target: NestedObject,
	stats: SyncStats,
	fix: boolean,
	prefix = "",
): NestedObject => {
	const result: NestedObject = {};

	for (const key of Object.keys(reference)) {
		if (key === "$schema") continue;
		const propertyPath = prefix ? `${prefix}.${key}` : key;
		const refValue = reference[key];
		stats.referenceKeys.push(propertyPath);

		if (isNested(refValue)) {
			const nextTarget = isNested(target[key]) ? target[key] : {};
			const data = syncLocaleData(refValue, nextTarget, stats, fix, propertyPath);
			if (fix && Object.keys(data).length === 0) {
				continue;
			}
			result[key] = data;
			continue;
		}

		if (!(key in target)) {
			stats.missing.push(propertyPath);
			if (fix) {
				result[key] = refValue;
			}
		} else {
			result[key] = target[key];
		}
	}

	for (const key of Object.keys(target)) {
		if (key === "$schema") continue;
		const propertyPath = prefix ? `${prefix}.${key}` : key;
		if (!(key in reference)) {
			stats.extra.push(propertyPath);
		}
	}

	return result;
};

const logSection = (title: string, keys: string[], color: string, emptyMessage: string): void => {
	console.log(`\n${color}${title}${COLORS.reset}`);
	if (keys.length === 0) {
		console.log(`  ${COLORS.green}${emptyMessage}${COLORS.reset}`);
		return;
	}
	for (const key of keys) {
		console.log(`  - ${key}`);
	}
};

function processFeature(locale: string, feature: string, fix: boolean): SyncStats {
	const reference = withoutSchema(readFeatureFile(REFERENCE_LOCALE, feature));
	const targetRaw = readFeatureFile(locale, feature);
	const { $schema: targetSchema, ...target } = targetRaw;

	const stats: SyncStats = {
		missing: [],
		extra: [],
		referenceKeys: [],
		feature,
		locale,
	};

	const newContent = syncLocaleData(reference, target, stats, fix);
	if (stats.extra.length > 0 || fix) {
		const output = targetSchema ? { $schema: targetSchema, ...newContent } : newContent;
		writeFileSync(
			localeFeatureAbsolutePath(locale, feature),
			`${JSON.stringify(output, null, "\t")}\n`,
			"utf-8",
		);
	}

	return stats;
}

function processLocale(locale: string, fix: boolean): SyncStats[] {
	return FEATURE_FILES.map((feature) => processFeature(locale, feature, fix));
}

const runSingleLocale = (locale: string, fix = false): void => {
	const localeCode = locale.replace(/\.json$/, "");
	const dirOk = existsSync(localeFeatureAbsolutePath(localeCode, FEATURE_FILES[0]!));
	if (!dirOk) {
		console.error(
			`${COLORS.red}Error: Locale directory not found: i18n/locales/${localeCode}/${COLORS.reset}`,
		);
		process.exit(1);
	}

	const results = processLocale(localeCode, fix);
	const referenceKeys = loadMergedLocale(REFERENCE_LOCALE);
	const referenceKeyCount = Object.keys(JSON.stringify(referenceKeys)).length;

	console.log(
		`${COLORS.cyan}=== Missing keys for ${localeCode}${fix ? " (with --fix)" : ""} ===${COLORS.reset}`,
	);
	console.log(`Reference: ${REFERENCE_LOCALE}/* (${FEATURE_FILES.length} feature files)`);

	const missing = results.flatMap((r) => r.missing);
	const extra = results.flatMap((r) => r.extra);

	if (missing.length > 0) {
		if (fix) {
			console.log(
				`\n${COLORS.green}Added ${missing.length} missing key(s) with EN placeholder:${COLORS.reset}`,
			);
		} else {
			console.log(`\n${COLORS.yellow}Missing ${missing.length} key(s):${COLORS.reset}`);
		}
		for (const key of missing) {
			console.log(`  - ${key}`);
		}
	} else {
		console.log(`\n${COLORS.green}No missing keys!${COLORS.reset}`);
	}

	if (extra.length > 0) {
		console.log(`\n${COLORS.magenta}Removed ${extra.length} extra key(s):${COLORS.reset}`);
		for (const key of extra) {
			console.log(`  - ${key}`);
		}
	}

	void referenceKeyCount;
	console.log("");
};

const runAllLocales = (fix = false): void => {
	const locales = listLocaleCodes().filter((code) => code !== REFERENCE_LOCALE);
	const results: SyncStats[] = [];

	let totalMissing = 0;
	let totalRemoved = 0;
	let totalAdded = 0;

	for (const locale of locales) {
		const localeStats = processLocale(locale, fix);
		results.push(...localeStats);
		for (const stats of localeStats) {
			if (fix) {
				if (stats.missing.length > 0) totalAdded += stats.missing.length;
			} else if (stats.missing.length > 0) {
				totalMissing += stats.missing.length;
			}
			if (stats.extra.length > 0) totalRemoved += stats.extra.length;
		}
	}

	console.log(
		`${COLORS.cyan}=== Translation Audit${fix ? " (with --fix)" : ""} ===${COLORS.reset}`,
	);
	console.log(`Reference: i18n/locales/${REFERENCE_LOCALE}/{feature}.json`);
	console.log(
		`Checking ${locales.length} locale(s) × ${FEATURE_FILES.length} feature file(s)...`,
	);

	const byLocale = new Map<string, SyncStats[]>();
	for (const res of results) {
		const list = byLocale.get(res.locale) ?? [];
		list.push(res);
		byLocale.set(res.locale, list);
	}

	for (const [locale, localeResults] of byLocale) {
		const missing = localeResults.flatMap((r) => r.missing);
		const extra = localeResults.flatMap((r) => r.extra);
		if (missing.length === 0 && extra.length === 0) continue;

		console.log(`\n${COLORS.cyan}--- ${locale} ---${COLORS.reset}`);
		if (missing.length > 0) {
			if (fix) {
				logSection("ADDED MISSING KEYS (with EN placeholder)", missing, COLORS.green, "");
			} else {
				logSection(
					"MISSING KEYS (in en/* but not in this locale)",
					missing,
					COLORS.yellow,
					"",
				);
			}
		}
		if (extra.length > 0) {
			logSection(
				"REMOVED EXTRA KEYS (were in this locale but not in en/*)",
				extra,
				COLORS.magenta,
				"",
			);
		}
	}

	console.log(`\n${COLORS.cyan}=== Summary ===${COLORS.reset}`);
	if (totalAdded > 0) {
		console.log(
			`${COLORS.green}  Added missing keys (EN placeholder): ${totalAdded}${COLORS.reset}`,
		);
	}
	if (totalMissing > 0) {
		console.log(
			`${COLORS.yellow}  Missing keys across all locales: ${totalMissing}${COLORS.reset}`,
		);
	}
	if (totalRemoved > 0) {
		console.log(`${COLORS.magenta}  Removed extra keys: ${totalRemoved}${COLORS.reset}`);
	}
	if (totalMissing === 0 && totalRemoved === 0 && totalAdded === 0) {
		console.log(`${COLORS.green}  All locales are in sync!${COLORS.reset}`);
	}
	console.log("");
};

const main = async (): Promise<void> => {
	const args = process.argv.slice(2);
	const fix = args.includes("--fix");
	const localeArg = args.find((arg) => arg !== "--fix");

	if (localeArg) {
		runSingleLocale(localeArg, fix);
	} else {
		runAllLocales(fix);
	}
};

await main();
