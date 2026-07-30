/**
 * Remap Tolgee pull output (short language tags) into Nuxt locale directories.
 *
 * Reads i18n/.tolgee-pull/{tag}/{namespace}.json → i18n/locales/{nuxtLocale}/{namespace}.json
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const config = require("../.tolgeerc.cjs") as {
	tolgeeToLocal: Record<string, string>;
	namespaces: string[];
	pull: { path: string };
};

const pullRoot = join(process.cwd(), config.pull.path.replace(/^\.\//, ""));
const localesRoot = join(process.cwd(), "i18n/locales");

if (!existsSync(pullRoot)) {
	console.error(`Missing pull directory: ${pullRoot}`);
	console.error("Run `pnpm exec tolgee pull` first.");
	process.exit(1);
}

let copied = 0;
for (const tag of readdirSync(pullRoot)) {
	const localDir = config.tolgeeToLocal[tag];
	if (!localDir) {
		console.warn(`Skipping unmapped Tolgee language tag: ${tag}`);
		continue;
	}
	const srcDir = join(pullRoot, tag);
	const destDir = join(localesRoot, localDir);
	mkdirSync(destDir, { recursive: true });
	for (const ns of config.namespaces) {
		const src = join(srcDir, `${ns}.json`);
		if (!existsSync(src)) continue;
		copyFileSync(src, join(destDir, `${ns}.json`));
		copied++;
	}
	// Keep en-US / es-ES mirrors in sync with base dirs when present.
	if (localDir === "en" && existsSync(join(localesRoot, "en-US"))) {
		for (const ns of config.namespaces) {
			const src = join(destDir, `${ns}.json`);
			if (existsSync(src)) copyFileSync(src, join(localesRoot, "en-US", `${ns}.json`));
		}
	}
	if (localDir === "es" && existsSync(join(localesRoot, "es-ES"))) {
		for (const ns of config.namespaces) {
			const src = join(destDir, `${ns}.json`);
			if (existsSync(src)) copyFileSync(src, join(localesRoot, "es-ES", `${ns}.json`));
		}
	}
}

rmSync(pullRoot, { recursive: true, force: true });
console.log(`Remapped ${copied} locale files into i18n/locales/`);
