import { describe, expect, it } from "vitest";
import { normalizeTolgeeDictionary } from "../../../scripts/utils/tolgee-dictionary";

describe("normalizeTolgeeDictionary", () => {
	it("converts recursive null leaves to empty placeholders", () => {
		expect(
			normalizeTolgeeDictionary({
				$schema: "../../schemas/auth.schema.json",
				auth: { title: "Autorizzazione", description: null },
			}),
		).toEqual({
			$schema: "../../schemas/auth.schema.json",
			auth: { title: "Autorizzazione", description: "" },
		});
	});

	it.each([
		["number", { auth: { title: 1 } }],
		["boolean", { auth: { title: false } }],
		["array", { auth: { title: [] } }],
	])("rejects a %s dictionary leaf", (_label, dictionary) => {
		expect(() => normalizeTolgeeDictionary(dictionary)).toThrow(
			"Expected a string or nested dictionary at $.auth.title",
		);
	});

	it("rejects a non-object document root", () => {
		expect(() => normalizeTolgeeDictionary(null)).toThrow(
			"Expected a Tolgee dictionary at the document root",
		);
	});
});
