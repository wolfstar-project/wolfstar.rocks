import { createPage, setup } from "@nuxt/test-utils/e2e";
import { describe, expect, test } from "vitest";
import { FIXTURE_DISCORD_USER } from "../fixtures/discord-user";
import {
	mockDiscordExchangeFail,
	mockDiscordExchangeSuccess,
	mockVerifyStateFail,
	mockVerifyStateSuccess,
} from "./helpers/mock-discord-oauth";
import { ROOT_DIR, TEST_NUXT_CONFIG } from "./setup";

describe("oauth callback page", async () => {
	await setup({
		rootDir: ROOT_DIR,
		browser: true,
		browserOptions: { type: "chromium", launch: { headless: true } },
		nuxtConfig: TEST_NUXT_CONFIG,
	});

	test("shows Login Required when accessed without a code query param", async () => {
		const page = await createPage("/oauth/callback");

		await expect(page.getByRole("heading", { name: "Login Required" })).toBeVisible();

		await page.close();
	});

	test("shows Sign-In Failed when token exchange returns an error", async () => {
		const page = await createPage();

		await mockDiscordExchangeFail(page);

		await page.goto("/oauth/callback?code=bad-code&state=any-state");

		// The client fetches /api/auth/discord after hydration; wait for error state
		await expect(page.getByRole("heading", { name: "Sign-In Failed" })).toBeVisible({
			timeout: 10_000,
		});

		await page.close();
	});

	test("shows Welcome and redirects to / on successful token exchange", async () => {
		const page = await createPage();

		await mockDiscordExchangeSuccess(page, FIXTURE_DISCORD_USER);
		await mockVerifyStateSuccess(page, "/");

		await page.goto("/oauth/callback?code=ok-code&state=ok-state");

		// callback.vue shows a welcome alert before navigating
		await expect(page.getByRole("heading", { name: /Welcome.*testuser/i })).toBeVisible({
			timeout: 10_000,
		});

		// callback.vue waits 2s then navigates to redirectUrl
		await page.waitForURL("/", { timeout: 15_000 });

		await page.close();
	});

	test("falls back to / when CSRF state verification fails", async () => {
		const page = await createPage();

		await mockDiscordExchangeSuccess(page, FIXTURE_DISCORD_USER);
		await mockVerifyStateFail(page);

		await page.goto("/oauth/callback?code=ok-code&state=tampered-state");

		// Even when verify-state returns 400, code catches the error and redirects to /
		await page.waitForURL("/", { timeout: 15_000 });

		await page.close();
	});
});
