import { describe, expect, it } from "vitest";
import { collectMissingKeys, mergeLocaleStrings } from "../../../lunaria/locale-strings.ts";

const source = {
	home: { title: "Home", subtitle: "Welcome" },
	save: "Save",
};

describe("collectMissingKeys", () => {
	it("counts an empty string as untranslated", () => {
		const target = { home: { title: "Pagina iniziale", subtitle: "" }, save: "" };

		expect(collectMissingKeys(source, target)).toEqual(["home.subtitle", "save"]);
	});

	it("counts a key the locale lacks as untranslated", () => {
		expect(collectMissingKeys(source, { home: { title: "Pagina iniziale" } })).toEqual([
			"home.subtitle",
			"save",
		]);
	});

	it("finds nothing missing when every key has a string", () => {
		const target = { home: { title: "Startseite", subtitle: "Willkommen" }, save: "Speichern" };

		expect(collectMissingKeys(source, target)).toEqual([]);
	});
});

describe("mergeLocaleStrings", () => {
	it("keeps the base's string where the variant's is empty", () => {
		const base = { home: { title: "Inicio", subtitle: "Bienvenido" }, save: "Guardar" };
		const variant = { home: { title: "", subtitle: "Bienvenida" }, save: "" };

		const merged = mergeLocaleStrings([base, variant]);

		expect(merged).toEqual({
			home: { title: "Inicio", subtitle: "Bienvenida" },
			save: "Guardar",
		});
		expect(collectMissingKeys(source, merged)).toEqual([]);
	});

	it("leaves a key untranslated when neither the base nor the variant has it", () => {
		const merged = mergeLocaleStrings([{ save: "" }, { save: "" }]);

		expect(collectMissingKeys({ save: "Save" }, merged)).toEqual(["save"]);
	});
});
