import { describe, expect, it } from "vitest";
import {
	mergeLocaleMessages,
	parseLocaleMessages,
	stripEmptyMessages,
} from "../../../config/i18n-empty-placeholders";

describe("stripEmptyMessages", () => {
	it("drops empty-string leaves and keeps translated ones", () => {
		expect(stripEmptyMessages({ a: "Ciao", b: "", c: "Mondo" })).toEqual({
			a: "Ciao",
			c: "Mondo",
		});
	});

	it("prunes objects left empty by the removal", () => {
		expect(
			stripEmptyMessages({ nav: { blog: "", commands: "" }, footer: { legal: "Legale" } }),
		).toEqual({ footer: { legal: "Legale" } });
	});

	it("returns undefined for a fully untranslated file", () => {
		expect(stripEmptyMessages({ nav: { blog: "", nested: { deep: "" } } })).toBeUndefined();
	});

	it("keeps non-string values untouched", () => {
		expect(stripEmptyMessages({ count: 0, enabled: false, list: ["", "x"] })).toEqual({
			count: 0,
			enabled: false,
			list: ["", "x"],
		});
	});
});

describe("parseLocaleMessages", () => {
	it("strips empty placeholders and the $schema pointer", () => {
		expect(
			parseLocaleMessages(
				JSON.stringify({
					$schema: "../../schemas/common.schema.json",
					nav: { blog: "", commands: "Befehle" },
				}),
				"i18n/locales/de-DE/common.json",
				"test",
			),
		).toEqual({ nav: { commands: "Befehle" } });
	});

	it("returns an empty object for a fully untranslated file", () => {
		expect(
			parseLocaleMessages(
				JSON.stringify({ nav: { blog: "" } }),
				"i18n/locales/uk-UA/common.json",
				"test",
			),
		).toEqual({});
	});

	it("reports the locale path when the file is not valid JSON", () => {
		expect(() =>
			parseLocaleMessages("{invalid", "i18n/locales/en/common.json", "test"),
		).toThrowError(/failed to parse locale JSON i18n\/locales\/en\/common\.json/);
	});
});

describe("mergeLocaleMessages", () => {
	it("merges nested objects with later sources winning", () => {
		expect(
			mergeLocaleMessages(
				{ nav: { blog: "Blog", commands: "Comandos" } },
				{ nav: { blog: "Bitácora" }, footer: { legal: "Legal" } },
			),
		).toEqual({
			nav: { blog: "Bitácora", commands: "Comandos" },
			footer: { legal: "Legal" },
		});
	});

	it("keeps a base translation where the variant only had a placeholder", () => {
		// The placeholder is already gone by the time the layers are merged, so
		// the regional variant inherits the base value instead of blanking it.
		const base = parseLocaleMessages(
			JSON.stringify({ nav: { blog: "Bitácora", commands: "Comandos" } }),
			"i18n/locales/es/common.json",
			"test",
		);
		const variant = parseLocaleMessages(
			JSON.stringify({ nav: { blog: "", commands: "Comandos (LatAm)" } }),
			"i18n/locales/es-419/common.json",
			"test",
		);

		expect(mergeLocaleMessages(base, variant)).toEqual({
			nav: { blog: "Bitácora", commands: "Comandos (LatAm)" },
		});
	});

	it("replaces arrays wholesale rather than merging them", () => {
		expect(mergeLocaleMessages({ list: ["a", "b"] }, { list: ["c"] })).toEqual({ list: ["c"] });
	});
});
