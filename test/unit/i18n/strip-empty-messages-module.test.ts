import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import stripEmptyMessagesModule, {
	STRIPPED_LOCALES_DIR,
} from "../../../modules/i18n-strip-empty-messages";

type WatchHandler = (event: string, path: string) => void;

interface FakeNuxt {
	options: { rootDir: string; dev: boolean; watch: string[] };
	hook: (name: string, handler: WatchHandler) => void;
}

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

function writeLocaleFile(locale: string, feature: string, contents: object): string {
	const dir = join(sourceDir, locale);
	mkdirSync(dir, { recursive: true });
	const path = join(dir, feature);
	writeFileSync(path, JSON.stringify(contents), "utf8");
	return path;
}

function readMirror(locale: string, feature: string): unknown {
	return JSON.parse(readFileSync(join(outDir, locale, feature), "utf8"));
}

// The module is only ever called by Nuxt with a real instance; the fake carries
// the handful of fields `setup()` touches.
async function runModule(nuxt: FakeNuxt): Promise<void> {
	await (
		stripEmptyMessagesModule as unknown as (options: object, nuxt: FakeNuxt) => Promise<void>
	)({}, nuxt);
}

beforeEach(() => {
	rootDir = mkdtempSync(join(tmpdir(), "wolfstar-i18n-"));
	sourceDir = join(rootDir, "i18n", "locales");
	outDir = join(rootDir, STRIPPED_LOCALES_DIR);
	mkdirSync(sourceDir, { recursive: true });
});

afterEach(() => {
	rmSync(rootDir, { recursive: true, force: true });
});

describe("i18n-strip-empty-messages module", () => {
	it("mirrors locale files without placeholders or the $schema pointer", async () => {
		writeLocaleFile("it-IT", "common.json", {
			$schema: "../../schemas/common.schema.json",
			nav: { home: "Home", blog: "" },
			footer: { legal: "" },
		});
		const { nuxt } = createNuxt();

		await runModule(nuxt);

		expect(readMirror("it-IT", "common.json")).toEqual({ nav: { home: "Home" } });
	});

	it("drops mirrored files that no longer exist in the sources", async () => {
		writeLocaleFile("it-IT", "common.json", { nav: { home: "Home" } });
		const removed = writeLocaleFile("it-IT", "legacy.json", { old: "Vecchio" });
		await runModule(createNuxt().nuxt);
		expect(existsSync(join(outDir, "it-IT", "legacy.json"))).toBe(true);

		rmSync(removed);
		await runModule(createNuxt().nuxt);

		expect(existsSync(join(outDir, "it-IT", "legacy.json"))).toBe(false);
		expect(existsSync(join(outDir, "it-IT", "common.json"))).toBe(true);
	});

	it("refreshes the mirror when a locale file changes in dev", async () => {
		const path = writeLocaleFile("it-IT", "common.json", { nav: { home: "" } });
		const { nuxt, watchers } = createNuxt();
		await runModule(nuxt);
		expect(readMirror("it-IT", "common.json")).toEqual({});
		expect(nuxt.options.watch).toHaveLength(1);

		writeFileSync(path, JSON.stringify({ nav: { home: "Casa" } }), "utf8");
		for (const watcher of watchers) watcher("change", path);

		expect(readMirror("it-IT", "common.json")).toEqual({ nav: { home: "Casa" } });
	});

	it("removes the mirrored file when its source is unlinked in dev", async () => {
		const path = writeLocaleFile("it-IT", "common.json", { nav: { home: "Casa" } });
		const { nuxt, watchers } = createNuxt();
		await runModule(nuxt);

		rmSync(path);
		for (const watcher of watchers) watcher("unlink", path);

		expect(existsSync(join(outDir, "it-IT", "common.json"))).toBe(false);
	});

	it("registers no watcher outside dev", async () => {
		writeLocaleFile("it-IT", "common.json", { nav: { home: "Casa" } });
		const { nuxt, watchers } = createNuxt(false);

		await runModule(nuxt);

		expect(watchers).toHaveLength(0);
		expect(nuxt.options.watch).toHaveLength(0);
	});

	it("fails loudly when no locale files exist", async () => {
		rmSync(sourceDir, { recursive: true, force: true });
		mkdirSync(sourceDir, { recursive: true });

		await expect(runModule(createNuxt().nuxt)).rejects.toThrow(/no locale JSON files found/);
	});
});
