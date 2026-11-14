import { describe, expect, it } from "vitest";
import { localeFlagSrc } from "~/utils/locale-flags";

describe("localeFlagSrc", () => {
	it("uses the locale's own flag when a language is split by country", () => {
		expect(localeFlagSrc("en-GB")).toBe("/flags/en-GB.svg");
		expect(localeFlagSrc("es-419")).toBe("/flags/es-419.svg");
		expect(localeFlagSrc("pt-BR")).toBe("/flags/pt-BR.svg");
	});

	it("falls back to the language's flag", () => {
		expect(localeFlagSrc("it-IT")).toBe("/flags/it.svg");
		expect(localeFlagSrc("hi-Latn-IN")).toBe("/flags/hi.svg");
		expect(localeFlagSrc("nb-NO")).toBe("/flags/no.svg");
	});

	it("has no flag for a language without one", () => {
		expect(localeFlagSrc("fa-IR")).toBeUndefined();
	});
});
