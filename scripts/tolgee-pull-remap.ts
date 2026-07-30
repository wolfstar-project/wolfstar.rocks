/**
 * Remap Tolgee pull output (short language tags) into Nuxt locale directories.
 *
 * Reads i18n/.tolgee-pull/{tag}/{namespace}.json → i18n/locales/{nuxtLocale}/{namespace}.json
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

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

for (const tag of readdirSync(pullRoot)) {
	if (!config.tolgeeToLocal[tag]) console.warn(`Skipping unmapped Tolgee language tag: ${tag}`);
}

// Validate the pull is complete before touching i18n/locales/, so a partial
// pull cannot silently leave some languages or namespaces stale while updating others.
// Every tag configured in tolgeeToLocal must be present with all namespace files.
const mappedTags = Object.keys(config.tolgeeToLocal);
const missing = mappedTags.flatMap((tag) =>
	config.namespaces
		.filter((ns) => !existsSync(join(pullRoot, tag, `${ns}.json`)))
		.map((ns) => `${tag}/${ns}.json`),
);
if (missing.length > 0) {
	console.error("Incomplete Tolgee pull; missing namespace files:");
	for (const file of missing) console.error(`  - ${file}`);
	console.error(`Staging directory preserved for inspection: ${pullRoot}`);
	process.exit(1);
}

// Build and validate the full replacement tree in memory before touching
// i18n/locales/, so an unreadable or invalid staging file cannot leave the
// live locale tree partially updated.
const mirrors: Record<string, string> = { en: "en-US", es: "es-ES" };
const writes: { dest: string; content: Buffer }[] = [];
for (const tag of mappedTags) {
	const localDir = config.tolgeeToLocal[tag];
	if (!localDir) continue;
	for (const ns of config.namespaces) {
		let content: Buffer;
		try {
			content = readFileSync(join(pullRoot, tag, `${ns}.json`));
			JSON.parse(content.toString("utf8"));
		} catch (error) {
			console.error(`Invalid or unreadable staging file: ${tag}/${ns}.json`);
			console.error(String(error));
			console.error(`Staging directory preserved for inspection: ${pullRoot}`);
			process.exit(1);
		}
		writes.push({ dest: join(localesRoot, localDir, `${ns}.json`), content });
		// Keep en-US / es-ES mirrors in sync with base dirs when present.
		const mirrorDir = mirrors[localDir];
		if (mirrorDir && existsSync(join(localesRoot, mirrorDir))) {
			writes.push({ dest: join(localesRoot, mirrorDir, `${ns}.json`), content });
		}
	}
}

// Promote the replacement tree; if any write fails, restore every destination
// already touched so the live locales never stay in a mixed state.
const backups = new Map<string, Buffer | null>();
try {
	for (const { dest, content } of writes) {
		backups.set(dest, existsSync(dest) ? readFileSync(dest) : null);
		mkdirSync(dirname(dest), { recursive: true });
		writeFileSync(dest, content);
	}
} catch (error) {
	for (const [dest, backup] of backups) {
		try {
			if (backup === null) rmSync(dest, { force: true });
			else writeFileSync(dest, backup);
		} catch {
			console.error(`Rollback failed for ${dest}; restore it manually.`);
		}
	}
	console.error("Failed to promote pulled locales; previously written files were rolled back.");
	console.error(String(error));
	console.error(`Staging directory preserved for inspection: ${pullRoot}`);
	process.exit(1);
}

rmSync(pullRoot, { recursive: true, force: true });
console.log(`Remapped ${writes.length} locale files into i18n/locales/`);
