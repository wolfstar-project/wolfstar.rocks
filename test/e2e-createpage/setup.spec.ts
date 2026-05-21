import { createPage, setup } from "@nuxt/test-utils/e2e";
import { describe, expect, test } from "vitest";
import { ROOT_DIR, TEST_NUXT_CONFIG } from "./setup";

describe("auth-e2e smoke test", async () => {
	await setup({
		rootDir: ROOT_DIR,
		browser: true,
		browserOptions: { type: "chromium", launch: { headless: true } },
		nuxtConfig: TEST_NUXT_CONFIG,
	});

	test("home page loads", async () => {
		const page = await createPage("/");
		await expect(page).toHaveTitle(/WolfStar/);
		await page.close();
	});
});
