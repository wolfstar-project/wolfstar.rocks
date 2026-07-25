import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
/* oxlint-disable no-console */
import process from "node:process";
import { createI18NReport, type I18NItem } from "vue-i18n-extract";
import { colors } from "./utils/colors.ts";
import {
	FEATURE_FILES,
	REFERENCE_LOCALE,
	listLocaleCodes,
	loadMergedLocale,
	localeFeatureAbsolutePath,
} from "./utils/i18n-locale-files.ts";

const VUE_FILES_GLOB = "./app/**/*.?(vue|ts|js)";

type NestedObject = Record<string, unknown>;

/** Removes a key path (e.g. "foo.bar.baz") from a nested object. Cleans up empty parents. */
function removeKey(obj: NestedObject, path: string): boolean {
	const parts = path.split(".");
	if (parts.length === 1) {
		if (path in obj) {
			delete obj[path];
			return true;
		}
		return false;
	}
	const [first, ...rest] = parts;
	if (!first) return false;
	const child = obj[first];
	if (child && typeof child === "object" && !Array.isArray(child)) {
		const removed = removeKey(child as NestedObject, rest.join("."));
		if (removed && Object.keys(child as object).length === 0) {
			delete obj[first];
		}
		return removed;
	}
	return false;
}

/** Removes multiple keys from a nested object. Sorts by depth (deepest first) to avoid parent/child conflicts. */
function removeKeysFromObject(obj: NestedObject, keys: string[]): number {
	const sortedKeys = [...keys].toSorted((a, b) => b.split(".").length - a.split(".").length);
	let removed = 0;
	for (const key of sortedKeys) {
		if (removeKey(obj, key)) removed++;
	}
	return removed;
}

async function run(): Promise<void> {
	console.log(colors.bold("\n🔍 Removing unused i18n translations...\n"));

	// vue-i18n-extract keys catalogs by basename; merge feature files into one en.json.
	const tmpDir = await mkdtemp(join(tmpdir(), "i18n-unused-"));
	const mergedPath = join(tmpDir, `${REFERENCE_LOCALE}.json`);
	await writeFile(
		mergedPath,
		`${JSON.stringify(loadMergedLocale(REFERENCE_LOCALE), null, "\t")}\n`,
	);

	try {
		const { unusedKeys } = await createI18NReport({
			vueFiles: VUE_FILES_GLOB,
			languageFiles: mergedPath,
			exclude: ["$schema"],
		});

		if (unusedKeys.length === 0) {
			console.log(colors.green("✅ No unused translations found. Nothing to remove.\n"));
			return;
		}

		const uniquePaths = [...new Set(unusedKeys.map((item: I18NItem) => item.path))];
		const locales = listLocaleCodes();
		let totalRemoved = 0;

		for (const locale of locales) {
			for (const feature of FEATURE_FILES) {
				const filePath = localeFeatureAbsolutePath(locale, feature);
				const content = JSON.parse(await readFile(filePath, "utf-8")) as NestedObject;
				const removed = removeKeysFromObject(content, uniquePaths);
				if (removed > 0) {
					await writeFile(filePath, `${JSON.stringify(content, null, "\t")}\n`, "utf-8");
					console.log(
						colors.yellow(`  ${locale}/${feature}: removed ${removed} unused key(s)`),
					);
					totalRemoved += removed;
				}
			}
		}

		console.log(
			colors.green(
				`\n✅ Removed ${totalRemoved} unused translation entr(y/ies) across locale feature files.\n`,
			),
		);
	} finally {
		await rm(tmpDir, { recursive: true, force: true });
	}
}

run().catch((error: unknown) => {
	console.error(colors.red("\n❌ Unexpected error:"), error);
	process.exit(1);
});
