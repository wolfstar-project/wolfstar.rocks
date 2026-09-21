import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { defineNuxtModule } from "nuxt/kit";
import { stripEmptyLocaleJson } from "../config/i18n-empty-placeholders";

/**
 * @nuxtjs/i18n v10 keeps plain-JSON locale files out of the bundlers entirely
 * (`experimental.optimizeMessageBundling`, on by default): it reads them from
 * disk, copies them out as Nitro server assets and serves them from the
 * `/_i18n/**` messages route, which is where the browser gets its messages in
 * production. The Vite transform in `config/i18n-empty-placeholders.ts` never
 * sees those reads, so untranslated `""` placeholders survived into the
 * delivered messages and vue-i18n rendered them verbatim instead of falling
 * back to `en-US` — every partially translated locale showed blank labels.
 *
 * Rather than patching each of the module's read paths, this generates a
 * placeholder-free mirror of `i18n/locales/` and points `i18n.langDir` at it
 * (see `nuxt.config.ts`), so every consumer — bundler, server asset, generated
 * types — only ever sees files whose untranslated keys are genuinely absent.
 * `i18n/locales/` stays the translator-facing source of truth with its full key
 * set intact for Tolgee and Lunaria.
 */
const MODULE_NAME = "wolfstar:i18n-strip-empty-messages";
const SOURCE_DIR = "i18n/locales";
const BOM_RE = /^\uFEFF/;

/** Kept in sync with `i18n.langDir` in `nuxt.config.ts`, relative to `i18n/`. */
export const STRIPPED_LOCALES_DIR = "i18n/.locales-build";

function localeFilesIn(dir: string): string[] {
	return readdirSync(dir, { recursive: true, encoding: "utf8" }).filter((entry) =>
		entry.endsWith(".json"),
	);
}

function writeStrippedFile(sourceDir: string, outDir: string, entry: string): void {
	const source = join(sourceDir, entry);
	const target = join(outDir, entry);
	mkdirSync(dirname(target), { recursive: true });
	writeFileSync(
		target,
		stripEmptyLocaleJson(readFileSync(source, "utf8").replace(BOM_RE, ""), source, MODULE_NAME),
		"utf8",
	);
}

export default defineNuxtModule({
	meta: {
		name: MODULE_NAME,
	},
	setup(_, nuxt) {
		const sourceDir = resolve(nuxt.options.rootDir, SOURCE_DIR);
		const outDir = resolve(nuxt.options.rootDir, STRIPPED_LOCALES_DIR);
		const entries = localeFilesIn(sourceDir);
		if (entries.length === 0) {
			throw new Error(
				`[${MODULE_NAME}] no locale JSON files found in ${sourceDir}; \`i18n.langDir\` points at a mirror that would be empty.`,
			);
		}

		// Stale locales left behind by a renamed or deleted source file would keep
		// being merged into the delivered messages.
		rmSync(outDir, { recursive: true, force: true });
		for (const entry of entries) {
			writeStrippedFile(sourceDir, outDir, entry);
		}

		if (!nuxt.options.dev) return;

		// Locale files live outside srcDir, so they need an explicit watch entry to
		// reach `builder:watch` and refresh the mirror on edit.
		nuxt.options.watch.push(join(sourceDir, "**/*.json"));
		nuxt.hook("builder:watch", (event, path) => {
			const absolute = isAbsolute(path) ? path : resolve(nuxt.options.rootDir, path);
			if (!absolute.startsWith(sourceDir) || !absolute.endsWith(".json")) return;

			const entry = relative(sourceDir, absolute);
			if (event === "unlink") {
				rmSync(join(outDir, entry), { force: true });
				return;
			}
			writeStrippedFile(sourceDir, outDir, entry);
		});
	},
});
