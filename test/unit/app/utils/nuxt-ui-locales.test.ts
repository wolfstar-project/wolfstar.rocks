import { describe, expect, it } from "vitest";
import { getNuxtUiLocale } from "~/utils/nuxt-ui-locales";
import { currentLocales } from "~~/config/i18n";

describe("getNuxtUiLocale", () => {
	it("has a pack under every configured app locale code", () => {
		for (const { code } of currentLocales) {
			expect(getNuxtUiLocale(code).code).toBe(code);
		}
	});

	it("gives Italian its own strings", () => {
		expect(getNuxtUiLocale("it-IT").messages.selectMenu.search).not.toBe(
			getNuxtUiLocale("en-US").messages.selectMenu.search,
		);
	});
});
