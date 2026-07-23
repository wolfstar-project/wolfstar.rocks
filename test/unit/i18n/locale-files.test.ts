import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { currentLocales } from "../../../config/i18n";

const LOCALES_DIR = join(process.cwd(), "i18n/locales");
const REFERENCE = "en.json";

type Nested = Record<string, unknown>;

function collectKeys(obj: Nested, prefix = ""): string[] {
	const keys: string[] = [];
	for (const [key, value] of Object.entries(obj)) {
		if (key === "$schema") continue;
		const path = prefix ? `${prefix}.${key}` : key;
		if (typeof value === "object" && value !== null && !Array.isArray(value)) {
			keys.push(...collectKeys(value as Nested, path));
		} else {
			keys.push(path);
		}
	}
	return keys;
}

describe("i18n locale files", () => {
	it("has a reference en.json", () => {
		expect(existsSync(join(LOCALES_DIR, REFERENCE))).toBe(true);
	});

	it("registers a locale file for every currentLocales entry", () => {
		for (const locale of currentLocales) {
			const file = locale.file ?? `${locale.code}.json`;
			const fileName = typeof file === "string" ? file : file.path;
			expect(existsSync(join(LOCALES_DIR, fileName)), `missing ${fileName}`).toBe(true);
		}
	});

	it("keeps non-English locales in sync with en.json keys", () => {
		const reference = JSON.parse(readFileSync(join(LOCALES_DIR, REFERENCE), "utf-8")) as Nested;
		const referenceKeys = new Set(collectKeys(reference));

		const localeFiles = readdirSync(LOCALES_DIR).filter(
			(file) => file.endsWith(".json") && file !== REFERENCE,
		);

		for (const file of localeFiles) {
			const content = JSON.parse(readFileSync(join(LOCALES_DIR, file), "utf-8")) as Nested;
			const keys = new Set(collectKeys(content));
			const missing = [...referenceKeys].filter((key) => !keys.has(key));
			const extra = [...keys].filter((key) => !referenceKeys.has(key));
			expect(missing, `${file} missing keys`).toEqual([]);
			expect(extra, `${file} extra keys`).toEqual([]);
		}
	});
});
