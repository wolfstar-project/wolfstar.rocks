import { describe, expect, it } from "vitest";
import { getNuxtUiLocales } from "~/utils/nuxt-ui-locales";
import { currentLocales } from "~~/config/i18n";

describe("getNuxtUiLocales", () => {
	it("covers every configured app locale code", () => {
		const uiLocales = getNuxtUiLocales();
		const codes = uiLocales.map((locale) => locale.code);

		expect(codes).toEqual(currentLocales.map((locale) => locale.code));
		expect(codes).toContain("de-DE");
		expect(codes).toContain("fr-FR");
		expect(codes.length).toBeGreaterThan(3);
	});
});
