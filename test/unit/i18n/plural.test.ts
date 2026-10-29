import { describe, expect, it } from "vitest";
import { plural } from "../../../config/i18n-plural";

/** Mirrors how Nuxt I18n Micro calls the plural function from `tc()`. */
function select(locale: string, forms: string, count: number): string | null {
	return plural("key", count, {}, locale, () => forms);
}

const EN_FORMS = "No missing keys | 1 missing key | {count} missing keys";
// one | few | many | other
const RU_FORMS = "{count} ключ | {count} ключа | {count} ключей | {count} ключа";

describe("plural", () => {
	it("defers to the built-in rules for locales without a custom mapping", () => {
		expect(select("en-US", EN_FORMS, 0)).toBeNull();
		expect(select("de-DE", EN_FORMS, 5)).toBeNull();
	});

	it("picks the Russian form by Intl plural category, not by count", () => {
		expect(select("ru-RU", RU_FORMS, 1)).toBe("1 ключ");
		expect(select("ru-RU", RU_FORMS, 2)).toBe("2 ключа");
		expect(select("ru-RU", RU_FORMS, 5)).toBe("5 ключей");
		expect(select("ru-RU", RU_FORMS, 21)).toBe("21 ключ");
	});

	it("collapses Hungarian onto its singular/plural pair", () => {
		// Intl reports `other` for every Hungarian count, including 0.
		expect(select("hu-HU", "{count} kulcs | {count} kulcsok", 0)).toBe("0 kulcsok");
		expect(select("hu-HU", "{count} kulcs | {count} kulcsok", 7)).toBe("7 kulcsok");
	});

	it("clamps to the last form when the translation carries fewer than the rule expects", () => {
		// `many` maps to index 2, but this string only has two forms.
		expect(select("ru-RU", "{count} ключ | {count} ключа", 5)).toBe("5 ключа");
	});

	// A locale that has not translated the key inherits the English source,
	// whose forms are `zero | one | other`. Its own categories would read one
	// match as the first form ("No missing keys"), so the source is left to the
	// built-in rule it was written for.
	it("leaves an untranslated English source to the built-in rules", () => {
		for (const locale of ["cs-CZ", "hu-HU", "ru-RU", "uk-UA"]) {
			for (const count of [0, 1, 5]) {
				expect(select(locale, EN_FORMS, count)).toBeNull();
			}
		}
	});

	it("picks the Czech form among its four categories", () => {
		// one | few | many | other
		const forms = "{count} klíč | {count} klíče | {count} klíče | {count} klíčů";
		expect(select("cs-CZ", forms, 1)).toBe("1 klíč");
		expect(select("cs-CZ", forms, 3)).toBe("3 klíče");
		expect(select("cs-CZ", forms, 5)).toBe("5 klíčů");
	});

	it("falls back to the built-in rules when the key does not resolve to a string", () => {
		expect(plural("key", 1, {}, "ru-RU", () => ({ nested: "value" }))).toBeNull();
	});
});
