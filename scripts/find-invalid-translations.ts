import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
/* oxlint-disable no-console */
import process from "node:process";
import { createI18NReport, type I18NItem, type I18NReport } from "vue-i18n-extract";
import { colors } from "./utils/colors.ts";
import {
	LOCALES_DIRECTORY,
	REFERENCE_LOCALE,
	loadMergedLocale,
} from "./utils/i18n-locale-files.ts";

const VUE_FILES_GLOB = "./app/**/*.?(vue|ts|js)";

function printSection(
	title: string,
	items: I18NItem[],
	status: "error" | "warning" | "success",
): void {
	const icon = status === "error" ? "❌" : status === "warning" ? "⚠️" : "✅";
	const colorFn =
		status === "error" ? colors.red : status === "warning" ? colors.yellow : colors.green;

	console.log(`\n${icon} ${colors.bold(title)}: ${colorFn(String(items.length))}`);

	if (items.length === 0) return;

	const groupedByFile = items.reduce<Record<string, string[]>>((acc, item) => {
		const file = item.file ?? "unknown";
		acc[file] ??= [];
		acc[file]!.push(item.path);
		return acc;
	}, {});

	for (const [file, keys] of Object.entries(groupedByFile)) {
		console.log(`  ${colors.dim(file)}`);
		for (const key of keys) {
			console.log(`    ${colors.cyan(key)}`);
		}
	}
}

/**
 * vue-i18n-extract treats each languageFiles basename as a separate "language".
 * Our locales are split across feature files under `en/*.json`, so pass a single
 * merged `en.json` temp file instead of the feature glob.
 */
async function createMergedReferenceReport(): Promise<{
	report: I18NReport;
	cleanup: () => Promise<void>;
}> {
	const tmpDir = await mkdtemp(join(tmpdir(), "i18n-report-"));
	const mergedPath = join(tmpDir, `${REFERENCE_LOCALE}.json`);
	await writeFile(
		mergedPath,
		`${JSON.stringify(loadMergedLocale(REFERENCE_LOCALE), null, "\t")}\n`,
	);

	const report = await createI18NReport({
		vueFiles: VUE_FILES_GLOB,
		languageFiles: mergedPath,
		exclude: ["$schema"],
	});

	return {
		report,
		cleanup: async () => {
			await rm(tmpDir, { recursive: true, force: true });
		},
	};
}

async function run(): Promise<void> {
	console.log(colors.bold("\n🔍 Analyzing i18n translations...\n"));
	console.log(
		colors.dim(`   Reference: ${join(LOCALES_DIRECTORY, REFERENCE_LOCALE)} (merged)\n`),
	);

	const { report, cleanup } = await createMergedReferenceReport();
	try {
		const { missingKeys, unusedKeys, maybeDynamicKeys } = report;

		const hasMissingKeys = missingKeys.length > 0;
		const hasUnusedKeys = unusedKeys.length > 0;
		const hasDynamicKeys = maybeDynamicKeys.length > 0;

		printSection("Missing keys", missingKeys, hasMissingKeys ? "error" : "success");

		// Many catalog keys are built dynamically (auth.errors.*, settings.entries.*), so
		// unused detection is noisy; report them but do not fail the job.
		printSection("Unused keys", unusedKeys, hasUnusedKeys ? "warning" : "success");

		printSection(
			"Dynamic keys (cannot be statically analyzed)",
			maybeDynamicKeys,
			hasDynamicKeys ? "error" : "success",
		);

		console.log(`\n${colors.dim("─".repeat(50))}`);

		const shouldFail = hasMissingKeys || hasDynamicKeys;

		if (shouldFail) {
			console.log(colors.red("\n❌ Build failed: missing or dynamic keys detected"));
			console.log(
				colors.dim("   Fix missing keys by adding them to the locale feature files"),
			);
			console.log(colors.dim("   Fix dynamic keys by using static translation keys\n"));
			process.exit(1);
		} else {
			if (hasUnusedKeys) {
				console.log(
					colors.yellow(
						`\n⚠️  ${unusedKeys.length} unused key(s) reported (dynamic keys may be false positives).`,
					),
				);
				console.log(
					colors.dim(
						"   Review with pnpm run i18n:report:fix if they are truly unused.\n",
					),
				);
			}
			console.log(colors.green("\n✅ All translations are valid!\n"));
		}
	} finally {
		await cleanup();
	}
}

run().catch((error: unknown) => {
	console.error(colors.red("\n❌ Unexpected error:"), error);
	process.exit(1);
});
