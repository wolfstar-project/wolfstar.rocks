/**
 * Remap Tolgee pull output (short language tags) into Nuxt locale directories.
 *
 * Reads i18n/.tolgee-pull/{tag}/{namespace}.json → i18n/locales/{nuxtLocale}/{namespace}.json
 */
import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	renameSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { normalizeTolgeeDictionary, withLocaleSchemaPointer } from "./utils/tolgee-dictionary.ts";

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

// Pulls may legitimately contain a subset of the configured languages
// (e.g. `tolgee pull --languages en es it`), so remap only the mapped
// language directories actually present in staging. Absent configured
// languages are reported but do not fail the pull.
const mappedTags = readdirSync(pullRoot).filter((tag) => Boolean(config.tolgeeToLocal[tag]));
if (mappedTags.length === 0) {
	console.error(`No mapped Tolgee language directories found in ${pullRoot}`);
	process.exit(1);
}
const absentTags = Object.keys(config.tolgeeToLocal).filter((tag) => !mappedTags.includes(tag));
if (absentTags.length > 0) {
	console.warn(
		`Configured languages absent from this pull (left untouched): ${absentTags.join(", ")}`,
	);
}

// Validate each present language is complete before touching i18n/locales/,
// so a partial export cannot silently leave some namespaces stale while
// updating others.
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
			const source = readFileSync(join(pullRoot, tag, `${ns}.json`), "utf8");
			const dictionary = normalizeTolgeeDictionary(JSON.parse(source));
			// `$schema` is local editor tooling metadata: restore the
			// repository's own pointer instead of trusting whatever the
			// platform returns (a stale pushed key, or nothing at all).
			const document = withLocaleSchemaPointer(dictionary, ns);
			content = Buffer.from(`${JSON.stringify(document, null, "\t")}\n`);
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

// Stage new content next to each destination first: staging is the only phase
// that writes data, so a persistent filesystem failure (full disk, unwritable
// tree) aborts before any live locale file is touched. Promotion and rollback
// are then rename-only metadata operations, which cannot re-fail from the same
// data-write condition, so a failed promotion cannot strand mixed content.
const NEW_SUFFIX = ".tolgee-new";
const BACKUP_SUFFIX = ".tolgee-backup";

function tryRmSync(path: string): void {
	try {
		rmSync(path, { force: true });
	} catch {
		// Best-effort cleanup; leftover temp files are harmless.
	}
}

try {
	for (const { dest, content } of writes) {
		mkdirSync(dirname(dest), { recursive: true });
		writeFileSync(dest + NEW_SUFFIX, content);
	}
} catch (error) {
	for (const { dest } of writes) tryRmSync(dest + NEW_SUFFIX);
	console.error("Failed to stage pulled locales; live locale files were not touched.");
	console.error(String(error));
	console.error(`Staging directory preserved for inspection: ${pullRoot}`);
	process.exit(1);
}

// Promote via rename; if any rename fails, rename every backup back so the
// live locales never stay in a mixed state.
const backups = new Map<string, string | null>();
try {
	for (const { dest } of writes) {
		if (!backups.has(dest)) {
			if (existsSync(dest)) {
				renameSync(dest, dest + BACKUP_SUFFIX);
				backups.set(dest, dest + BACKUP_SUFFIX);
			} else {
				backups.set(dest, null);
			}
		}
		renameSync(dest + NEW_SUFFIX, dest);
	}
} catch (error) {
	const unrestored: string[] = [];
	for (const [dest, backup] of backups) {
		try {
			if (backup === null) rmSync(dest, { force: true });
			else renameSync(backup, dest);
		} catch {
			unrestored.push(backup === null ? dest : `${dest} (backup preserved at ${backup})`);
		}
	}
	for (const { dest } of writes) tryRmSync(dest + NEW_SUFFIX);
	if (unrestored.length > 0) {
		console.error("Rollback failed for the following files; restore them manually:");
		for (const entry of unrestored) console.error(`  - ${entry}`);
	}
	console.error("Failed to promote pulled locales; previously promoted files were rolled back.");
	console.error(String(error));
	console.error(`Staging directory preserved for inspection: ${pullRoot}`);
	process.exit(1);
}
for (const backup of backups.values()) {
	if (backup !== null) tryRmSync(backup);
}

rmSync(pullRoot, { recursive: true, force: true });
console.log(`Remapped ${writes.length} locale files into i18n/locales/`);
