/**
 * Stage locale files for `tolgee push` with the `$schema` pointer stripped.
 *
 * `$schema` is editor tooling metadata, not a translatable message. Pushing the
 * locale files directly turns it into a real platform key that translators can
 * see and edit, and that a later pull would write back over the local pointer.
 * The Tolgee config therefore pushes `i18n/.tolgee-push/{locale}/{namespace}.json`
 * — a mirror this script rebuilds from `i18n/locales/` on every push.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { withoutSchemaPointer } from "./utils/tolgee-dictionary.ts";

const require = createRequire(import.meta.url);
const config = require("../.tolgeerc.cjs") as {
	pushStaging: { path: string; files: { source: string; path: string }[] };
};

const fromRepoRoot = (path: string): string => join(process.cwd(), path.replace(/^\.\//, ""));
const stagingRoot = fromRepoRoot(config.pushStaging.path);

const missing = config.pushStaging.files.filter(({ source }) => !existsSync(fromRepoRoot(source)));
if (missing.length > 0) {
	console.error("Missing locale files configured for push:");
	for (const { source } of missing) console.error(`  - ${source}`);
	console.error("Run `pnpm vp run i18n:check` to find the drift.");
	process.exit(1);
}

// Build every staged file in memory first: a namespace that fails to parse must
// not leave a half-written mirror that `tolgee push` would then upload.
const staged: { dest: string; content: Buffer }[] = [];
for (const { source, path } of config.pushStaging.files) {
	let messages: Record<string, unknown>;
	try {
		const parsed: unknown = JSON.parse(readFileSync(fromRepoRoot(source), "utf8"));
		if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
			throw new TypeError("Expected a JSON object at the document root");
		}
		messages = withoutSchemaPointer(parsed as Record<string, unknown>);
	} catch (error) {
		console.error(`Invalid locale file: ${source}`);
		console.error(String(error));
		process.exit(1);
	}
	staged.push({
		dest: fromRepoRoot(path),
		content: Buffer.from(`${JSON.stringify(messages, null, "\t")}\n`),
	});
}

// Rebuild from scratch so a language or namespace dropped from the config
// cannot linger in staging and be pushed again.
rmSync(stagingRoot, { recursive: true, force: true });
for (const { dest, content } of staged) {
	mkdirSync(dirname(dest), { recursive: true });
	writeFileSync(dest, content);
}

console.log(`Staged ${staged.length} locale files for push in ${config.pushStaging.path}/`);
