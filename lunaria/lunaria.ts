import type { I18nStatus } from "../shared/types/i18n-status.ts";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { currentLocales, localeSourceDirs } from "../config/i18n.ts";
import config from "../lunaria.config.ts";
import {
	collectMissingKeys,
	countKeys,
	mergeLocaleStrings,
	type NestedRecord,
} from "./locale-strings.ts";

// Skip during git merges — history may be inconsistent.
if (existsSync(".git/MERGE_HEAD")) {
	// eslint-disable-next-line no-console
	console.log("Skipping lunaria: git merge in progress");
	process.exit(0);
}

function loadMergedLocaleDirectory(localeCode: string): NestedRecord {
	const dir = join("i18n/locales", localeCode);
	if (!existsSync(dir)) return {};

	const merged: NestedRecord = {};
	for (const file of readdirSync(dir).filter((name) => name.endsWith(".json"))) {
		const content = JSON.parse(readFileSync(join(dir, file), "utf-8")) as NestedRecord;
		for (const [key, value] of Object.entries(content)) {
			if (key === "$schema") continue;
			merged[key] = value;
		}
	}
	return merged;
}

function buildJsonStatus(): I18nStatus {
	const sourceWithoutMeta = loadMergedLocaleDirectory("en");
	const totalKeys = countKeys(sourceWithoutMeta);

	const { sourceLocale, repository } = config;
	const repoName = repository.name;
	const branch =
		"branch" in repository && typeof repository.branch === "string"
			? repository.branch
			: "main";
	const githubBase = `https://github.com/${repoName}`;

	const appLocales = currentLocales.filter((l) => l.code !== sourceLocale.lang && l.displayName);

	return {
		generatedAt: new Date().toISOString(),
		sourceLocale: {
			lang: sourceLocale.lang,
			label: sourceLocale.label,
			totalKeys,
		},
		locales: appLocales.map((locale) => {
			const localeDirPath = `i18n/locales/${locale.code}`;
			// A regional variant shows its base's strings where it has none of its own.
			const localeWithoutMeta = mergeLocaleStrings(
				(localeSourceDirs[locale.code] ?? [locale.code]).map(loadMergedLocaleDirectory),
			);
			const missingKeys = collectMissingKeys(sourceWithoutMeta, localeWithoutMeta);
			const completedKeys = totalKeys - missingKeys.length;

			return {
				lang: locale.code,
				label: locale.displayName!,
				dir: locale.dir ?? "ltr",
				totalKeys,
				completedKeys,
				missingKeys,
				percentComplete:
					totalKeys > 0 ? Math.round((completedKeys / totalKeys) * 100) : 100,
				githubEditUrl: `${githubBase}/tree/${branch}/${localeDirPath}`,
				githubHistoryUrl: `${githubBase}/commits/${branch}/${localeDirPath}`,
			};
		}),
	};
}

const jsonStatus = buildJsonStatus();
const outDir = "dist/lunaria";
// The whole directory is published, so drop artifacts left by earlier runs (e.g. index.html).
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "status.json"), `${JSON.stringify(jsonStatus, null, 2)}\n`);
// eslint-disable-next-line no-console
console.log("Generated dist/lunaria/status.json");
