import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { defineNuxtModule } from "nuxt/kit";
import { localeFeatureFiles, localeSourceDirs } from "../config/i18n";
import {
	type LocaleMessages,
	mergeLocaleMessages,
	parseLocaleMessages,
} from "../config/i18n-empty-placeholders";

/**
 * Nuxt I18n Micro loads exactly one global message file per locale
 * (`{translationDir}/{locale}.json`), while this repository keeps translations
 * split into per-feature files under `i18n/locales/{dir}/{feature}.json` so
 * Tolgee, Lunaria and the `i18n:*` scripts have a stable, reviewable layout.
 *
 * This module bridges the two: for every configured locale it merges the
 * feature files of its source directories (base language first, regional
 * variant last — `es-419` merges `es/*` then `es-419/*`) and writes the result
 * to `i18n/.locales-build/{locale}.json`, which is what `i18n.translationDir`
 * points at. Empty-string placeholders are dropped per source file *before*
 * merging, so an untranslated key in a variant keeps the base translation
 * instead of blanking it, and a key missing everywhere falls back to
 * `fallbackLocale` at runtime.
 */
const MODULE_NAME = "wolfstar:i18n-locale-bundles";
const SOURCE_DIR = "i18n/locales";
const BOM_RE = /^\uFEFF/;

/** Kept in sync with `i18n.translationDir` in `nuxt.config.ts`. */
export const LOCALE_BUNDLES_DIR = "i18n/.locales-build";

function readFeatureFile(sourceDir: string, dir: string, feature: string): LocaleMessages | null {
	const path = join(sourceDir, dir, feature);
	let raw: string;
	try {
		raw = readFileSync(path, "utf8");
	} catch (error) {
		// A locale legitimately may not carry every feature file yet.
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
		throw error;
	}
	return parseLocaleMessages(raw.replace(BOM_RE, ""), path, MODULE_NAME);
}

export function buildLocaleBundle(sourceDir: string, code: string): LocaleMessages {
	const dirs = localeSourceDirs[code];
	if (!dirs) {
		throw new Error(`[${MODULE_NAME}] locale "${code}" has no source directories configured.`);
	}

	const layers: LocaleMessages[] = [];
	for (const dir of dirs) {
		for (const feature of localeFeatureFiles) {
			const messages = readFeatureFile(sourceDir, dir, feature);
			if (messages) layers.push(messages);
		}
	}

	if (layers.length === 0) {
		throw new Error(
			`[${MODULE_NAME}] locale "${code}" resolved to no message files under ${join(sourceDir, dirs[0] ?? code)}.`,
		);
	}

	return mergeLocaleMessages(...layers);
}

function writeLocaleBundle(sourceDir: string, outDir: string, code: string): void {
	writeFileSync(
		join(outDir, `${code}.json`),
		JSON.stringify(buildLocaleBundle(sourceDir, code)),
		"utf8",
	);
}

/** Locale codes whose bundle includes the given `i18n/locales/` directory. */
function localesUsingDir(dir: string): string[] {
	return Object.entries(localeSourceDirs)
		.filter(([, dirs]) => dirs.includes(dir))
		.map(([code]) => code);
}

export default defineNuxtModule({
	meta: {
		name: MODULE_NAME,
	},
	setup(_, nuxt) {
		const sourceDir = resolve(nuxt.options.rootDir, SOURCE_DIR);
		const outDir = resolve(nuxt.options.rootDir, LOCALE_BUNDLES_DIR);
		const codes = Object.keys(localeSourceDirs);

		// Stale bundles left behind by a removed locale would still be served.
		rmSync(outDir, { recursive: true, force: true });
		mkdirSync(outDir, { recursive: true });
		for (const code of codes) {
			writeLocaleBundle(sourceDir, outDir, code);
		}

		if (!nuxt.options.dev) return;

		// Locale sources live outside srcDir, so they need an explicit watch entry
		// to reach `builder:watch` and refresh the bundles on edit.
		nuxt.options.watch.push(join(sourceDir, "**/*.json"));
		nuxt.hook("builder:watch", (_event, path) => {
			const absolute = isAbsolute(path) ? path : resolve(nuxt.options.rootDir, path);
			if (!absolute.startsWith(sourceDir) || !absolute.endsWith(".json")) return;

			const [dir] = relative(sourceDir, absolute).split(/[/\\]/);
			if (!dir) return;
			for (const code of localesUsingDir(dir)) {
				writeLocaleBundle(sourceDir, outDir, code);
			}
		});
	},
});
