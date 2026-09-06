import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { localeFeatureFiles, localeSourceDirs } from "../../../config/i18n";
import localeBundlesModule, { LOCALE_BUNDLES_DIR } from "../../../modules/i18n-locale-bundles";

type WatchHandler = (event: string, path: string) => void;

interface FakeNuxt {
	options: { rootDir: string; dev: boolean; watch: string[] };
	hook: (name: string, handler: WatchHandler) => void;
}

/** Every `i18n/locales/` directory the configured locales are built from. */
const SOURCE_DIRS = [...new Set(Object.values(localeSourceDirs).flat())];
const FIRST_FEATURE = localeFeatureFiles[0]!;

let rootDir: string;
let sourceDir: string;
let outDir: string;

function createNuxt(dev = true): { nuxt: FakeNuxt; watchers: WatchHandler[] } {
	const watchers: WatchHandler[] = [];
	return {
		watchers,
		nuxt: {
			options: { rootDir, dev, watch: [] },
			hook(name, handler) {
				if (name === "builder:watch") watchers.push(handler);
			},
		},
	};
}

function writeLocaleFile(dir: string, feature: string, contents: object): string {
	const target = join(sourceDir, dir);
	mkdirSync(target, { recursive: true });
	const path = join(target, feature);
	writeFileSync(path, JSON.stringify(contents), "utf8");
	return path;
}

function readBundle(code: string): unknown {
	return JSON.parse(readFileSync(join(outDir, `${code}.json`), "utf8"));
}

// The module is only ever called by Nuxt with a real instance; the fake carries
// the handful of fields `setup()` touches.
async function runModule(nuxt: FakeNuxt): Promise<void> {
	await (localeBundlesModule as unknown as (options: object, nuxt: FakeNuxt) => Promise<void>)(
		{},
		nuxt,
	);
}

beforeEach(() => {
	rootDir = mkdtempSync(join(tmpdir(), "wolfstar-i18n-"));
	sourceDir = join(rootDir, "i18n", "locales");
	outDir = join(rootDir, LOCALE_BUNDLES_DIR);
	// Every configured locale needs at least one message file, or the module
	// (correctly) refuses to emit an empty bundle for it.
	for (const dir of SOURCE_DIRS) {
		writeLocaleFile(dir, FIRST_FEATURE, { nav: { home: `home-${dir}` } });
	}
});

afterEach(() => {
	rmSync(rootDir, { recursive: true, force: true });
});

describe("i18n-locale-bundles module", () => {
	it("writes one bundle per configured locale", async () => {
		await runModule(createNuxt().nuxt);

		for (const code of Object.keys(localeSourceDirs)) {
			expect(existsSync(join(outDir, `${code}.json`)), `missing ${code}.json`).toBe(true);
		}
	});

	it("merges feature files without placeholders or the $schema pointer", async () => {
		writeLocaleFile("it-IT", FIRST_FEATURE, {
			$schema: "../../schemas/common.schema.json",
			nav: { home: "Home", blog: "" },
			footer: { legal: "" },
		});
		writeLocaleFile("it-IT", localeFeatureFiles[1]!, { errors: { generic: "Errore" } });

		await runModule(createNuxt().nuxt);

		expect(readBundle("it-IT")).toEqual({
			nav: { home: "Home" },
			errors: { generic: "Errore" },
		});
	});

	it("layers a regional variant on top of its base language", async () => {
		writeLocaleFile("es", FIRST_FEATURE, {
			nav: { home: "Inicio", blog: "Bitácora" },
		});
		writeLocaleFile("es-419", FIRST_FEATURE, {
			// Untranslated in the variant: the base value has to survive the merge.
			nav: { home: "", blog: "Blog" },
		});

		await runModule(createNuxt().nuxt);

		expect(readBundle("es-419")).toEqual({ nav: { home: "Inicio", blog: "Blog" } });
	});

	it("drops bundles left behind by a removed locale", async () => {
		mkdirSync(outDir, { recursive: true });
		writeFileSync(join(outDir, "zz-ZZ.json"), "{}", "utf8");

		await runModule(createNuxt().nuxt);

		expect(existsSync(join(outDir, "zz-ZZ.json"))).toBe(false);
	});

	it("rebuilds every locale that layers a changed source directory in dev", async () => {
		const path = writeLocaleFile("es", FIRST_FEATURE, { nav: { home: "" } });
		writeLocaleFile("es-ES", FIRST_FEATURE, { nav: { home: "" } });
		writeLocaleFile("es-419", FIRST_FEATURE, { nav: { home: "" } });
		const { nuxt, watchers } = createNuxt();
		await runModule(nuxt);
		expect(readBundle("es-ES")).toEqual({});
		expect(nuxt.options.watch).toHaveLength(1);

		writeFileSync(path, JSON.stringify({ nav: { home: "Inicio" } }), "utf8");
		for (const watcher of watchers) watcher("change", path);

		expect(readBundle("es-ES")).toEqual({ nav: { home: "Inicio" } });
		expect(readBundle("es-419")).toEqual({ nav: { home: "Inicio" } });
	});

	it("registers no watcher outside dev", async () => {
		const { nuxt, watchers } = createNuxt(false);

		await runModule(nuxt);

		expect(watchers).toHaveLength(0);
		expect(nuxt.options.watch).toHaveLength(0);
	});

	it("fails loudly when a locale has no message files", async () => {
		rmSync(join(sourceDir, "it-IT"), { recursive: true, force: true });

		await expect(runModule(createNuxt().nuxt)).rejects.toThrow(
			/locale "it-IT" resolved to no message files/,
		);
	});
});
