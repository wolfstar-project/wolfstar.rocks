import { describe, expect, it } from "vitest";
import {
	localeSchemaPointer,
	normalizeTolgeeDictionary,
	withLocaleSchemaPointer,
	withoutSchemaPointer,
} from "../../../scripts/utils/tolgee-dictionary";

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

describe("withoutSchemaPointer", () => {
	it("drops the $schema pointer before a document is pushed", () => {
		expect(
			withoutSchemaPointer({
				$schema: "../../schemas/auth.schema.json",
				auth: { title: "Authorization" },
			}),
		).toEqual({ auth: { title: "Authorization" } });
	});

	it("leaves a document without a pointer untouched", () => {
		expect(withoutSchemaPointer({ auth: { title: "Authorization" } })).toEqual({
			auth: { title: "Authorization" },
		});
	});
});

describe("withLocaleSchemaPointer", () => {
	it("restores the local pointer for a pulled document that has none", () => {
		const document = withLocaleSchemaPointer({ auth: { title: "Autorizzazione" } }, "auth");

		expect(document).toEqual({
			$schema: localeSchemaPointer("auth"),
			auth: { title: "Autorizzazione" },
		});
		expect(Object.keys(document)[0]).toBe("$schema");
	});

	it("overwrites a stale pointer returned by the platform", () => {
		expect(
			withLocaleSchemaPointer(
				{ $schema: "translated by mistake", auth: { title: "Autorizzazione" } },
				"auth",
			),
		).toEqual({
			$schema: "../../schemas/auth.schema.json",
			auth: { title: "Autorizzazione" },
		});
	});
});
