import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const SCRIPT = resolve(__dirname, "../../../scripts/tolgee-pull-remap.ts");
const SENTINEL = '{"sentinel":"kept"}\n';

let cwd: string;

function writeJson(path: string, content: string) {
	mkdirSync(join(path, ".."), { recursive: true });
	writeFileSync(path, content);
}

function stagePull(tag: string, namespaces: string[]) {
	for (const ns of namespaces) {
		writeJson(join(cwd, "i18n/.tolgee-pull", tag, `${ns}.json`), '{"key":"translated"}');
	}
}

function runRemap(): { status: number; stderr: string } {
	try {
		execFileSync("node", [SCRIPT], { cwd, stdio: "pipe" });
		return { status: 0, stderr: "" };
	} catch (error) {
		const failure = error as { status: number; stderr: Buffer };
		return { status: failure.status, stderr: failure.stderr.toString() };
	}
}

describe("tolgee-pull-remap", () => {
	beforeEach(() => {
		cwd = mkdtempSync(join(tmpdir(), "tolgee-remap-"));
		writeJson(join(cwd, "i18n/locales/en/errors.json"), SENTINEL);
		writeJson(join(cwd, "i18n/locales/en/common.json"), SENTINEL);
	});

	afterEach(() => {
		rmSync(cwd, { recursive: true, force: true });
	});

	it("remaps pulled namespaces and leaves unpushed ones untouched", () => {
		stagePull("en", ["common", "auth", "dashboard", "guilds", "profile", "components"]);

		const result = runRemap();

		expect(result.status).toBe(0);
		expect(readFileSync(join(cwd, "i18n/locales/en/errors.json"), "utf8")).toBe(SENTINEL);
		expect(readFileSync(join(cwd, "i18n/locales/en/common.json"), "utf8")).toContain(
			"translated",
		);
	});

	it("fails and writes nothing when an active namespace is missing from a language", () => {
		stagePull("en", ["common", "auth", "dashboard", "guilds", "profile", "components"]);
		stagePull("it", ["common", "auth", "dashboard", "guilds", "profile"]);

		const result = runRemap();

		expect(result.status).toBe(1);
		expect(result.stderr).toContain("it/components.json");
		expect(readFileSync(join(cwd, "i18n/locales/en/common.json"), "utf8")).toBe(SENTINEL);
		expect(existsSync(join(cwd, "i18n/locales/it"))).toBe(false);
	});

	it("fails and writes nothing when a language was pulled with no namespaces", () => {
		mkdirSync(join(cwd, "i18n/.tolgee-pull/en"), { recursive: true });

		const result = runRemap();

		expect(result.status).toBe(1);
		expect(result.stderr).toContain("Incomplete Tolgee pull");
		expect(readFileSync(join(cwd, "i18n/locales/en/common.json"), "utf8")).toBe(SENTINEL);
	});
});
