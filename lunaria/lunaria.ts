import process from "node:process";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { currentLocales } from "../config/i18n.ts";
import type { I18nStatus } from "../shared/types/i18n-status.ts";
import config from "../lunaria.config.ts";

// Skip during git merges — history may be inconsistent.
if (existsSync(".git/MERGE_HEAD")) {
	// eslint-disable-next-line no-console
	console.log("Skipping lunaria: git merge in progress");
	process.exit(0);
}

type NestedRecord = Record<string, unknown>;

function countKeys(obj: NestedRecord): number {
	let count = 0;
	for (const key in obj) {
		const value = obj[key];
		if (typeof value === "object" && value !== null && !Array.isArray(value)) {
			count += countKeys(value as NestedRecord);
		} else {
			count++;
		}
	}
	return count;
}

function collectMissingKeys(
	source: NestedRecord,
	target: NestedRecord,
	prefix = "",
): string[] {
	const missing: string[] = [];
	for (const key of Object.keys(source)) {
		const path = prefix ? `${prefix}.${key}` : key;
		const sourceValue = source[key];
		const targetValue = target[key];

		if (typeof sourceValue === "object" && sourceValue !== null && !Array.isArray(sourceValue)) {
			const nextTarget =
				typeof targetValue === "object" && targetValue !== null && !Array.isArray(targetValue)
					? (targetValue as NestedRecord)
					: {};
			missing.push(...collectMissingKeys(sourceValue as NestedRecord, nextTarget, path));
		} else if (!(key in target)) {
			missing.push(path);
		}
	}
	return missing;
}

function buildJsonStatus(): I18nStatus {
	const sourceContent = JSON.parse(readFileSync("i18n/locales/en.json", "utf-8")) as NestedRecord;
	const { $schema: _, ...sourceWithoutMeta } = sourceContent;
	const totalKeys = countKeys(sourceWithoutMeta);

	const { defaultLocale, repository } = config;
	const repoName = repository.name;
	const branch =
		"branch" in repository && typeof repository.branch === "string" ? repository.branch : "main";
	const githubBase = `https://github.com/${repoName}`;

	const appLocales = currentLocales.filter((l) => l.code !== defaultLocale.lang && l.name);

	return {
		generatedAt: new Date().toISOString(),
		sourceLocale: {
			lang: defaultLocale.lang,
			label: defaultLocale.label,
			totalKeys,
		},
		locales: appLocales.map((locale) => {
			const localeFilePath = `i18n/locales/${locale.code}.json`;
			let localeContent: NestedRecord = {};
			if (existsSync(localeFilePath)) {
				localeContent = JSON.parse(readFileSync(localeFilePath, "utf-8")) as NestedRecord;
			}
			const { $schema: __, ...localeWithoutMeta } = localeContent;
			const missingKeys = collectMissingKeys(sourceWithoutMeta, localeWithoutMeta);
			const completedKeys = totalKeys - missingKeys.length;

			return {
				lang: locale.code,
				label: locale.name!,
				dir: locale.dir ?? "ltr",
				totalKeys,
				completedKeys,
				missingKeys,
				percentComplete: totalKeys > 0 ? Math.round((completedKeys / totalKeys) * 100) : 100,
				githubEditUrl: `${githubBase}/blob/${branch}/${localeFilePath}`,
				githubHistoryUrl: `${githubBase}/commits/${branch}/${localeFilePath}`,
			};
		}),
	};
}

function fallbackDashboardHtml(status: I18nStatus): string {
	const rows = status.locales
		.map(
			(locale) => `
      <details class="progress-details">
        <summary>
          <strong>${locale.label} <span class="lang-code">${locale.lang}</span></strong>
          <hr />
          <div class="progress-summary">
            <span>${locale.missingKeys.length ? `${locale.missingKeys.length} missing keys` : "✔"}</span>
            <span>${locale.completedKeys} / ${locale.totalKeys}</span>
          </div>
        </summary>
        <p><a href="${locale.githubEditUrl}">Edit on GitHub</a></p>
        ${
					locale.missingKeys.length
						? `<ul>${locale.missingKeys.map((key) => `<li>${key}</li>`).join("")}</ul>`
						: "<p>This translation is complete.</p>"
				}
      </details>`,
		)
		.join("\n");

	return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WolfStar Translation Status</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 40rem; line-height: 1.5; }
    .progress-details { border: 1px solid #ccc; border-radius: 0.5rem; margin-bottom: 1rem; padding: 1rem; }
    .progress-summary { display: flex; justify-content: space-between; font-size: 0.875rem; }
    .lang-code { margin-left: 0.5rem; opacity: 0.7; }
  </style>
</head>
<body>
  <main>
    <h1>WolfStar Translation Status</h1>
    <p>Fallback dashboard (Lunaria git status unavailable — usually due to uncommitted locale changes).</p>
    <p>Source: ${status.sourceLocale.label} (${status.sourceLocale.lang}) — ${status.sourceLocale.totalKeys} keys</p>
    ${rows}
  </main>
</body>
</html>
`;
}

const jsonStatus = buildJsonStatus();
const outDir = "dist/lunaria";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "status.json"), `${JSON.stringify(jsonStatus, null, 2)}\n`);

// Lunaria calls process.exit(1) on dirty working trees, so run the official
// dashboard build in a child process and keep a fallback HTML if it fails.
try {
	execFileSync(join("node_modules", ".bin", "lunaria"), ["build"], {
		stdio: "inherit",
		cwd: process.cwd(),
	});
	// Preserve our nested-key status.json (CLI build may not write it).
	writeFileSync(join(outDir, "status.json"), `${JSON.stringify(jsonStatus, null, 2)}\n`);
	// eslint-disable-next-line no-console
	console.log("Generated dist/lunaria/index.html and dist/lunaria/status.json");
} catch {
	writeFileSync(join(outDir, "index.html"), fallbackDashboardHtml(jsonStatus));
	// eslint-disable-next-line no-console
	console.warn(
		"Lunaria git dashboard failed; wrote fallback HTML + status.json (commit locale files for the full dashboard).",
	);
}
