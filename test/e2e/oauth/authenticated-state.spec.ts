import { createPage, setup } from "@nuxt/test-utils/e2e";
import { expect } from "@playwright/test";
import { FIXTURE_DISCORD_USER } from "../../fixtures/discord-user";
import { seedSession } from "../helpers/seed-session";
import { ROOT_DIR, TEST_NUXT_CONFIG } from "./setup";

describe("authenticated state", async () => {
	await setup({
		rootDir: ROOT_DIR,
		browser: true,
		browserOptions: { type: "chromium", launch: { headless: true } },
		nuxtConfig: TEST_NUXT_CONFIG,
	});

	it("unauthenticated user is redirected to login when accessing protected route", async () => {
		const page = await createPage();

		await page.route("https://discord.com/oauth2/authorize**", (route) =>
			route.fulfill({
				status: 200,
				contentType: "text/html",
				body: "<html><body>Discord stub</body></html>",
			}),
		);

		await page.goto("/guilds/123456789012345678/manage");
		await page.waitForURL(/\/oauth\/login|\/login|discord\.com/, {
			timeout: 10_000,
		});

		const currentUrl = page.url();
		const isRedirectedToLogin =
			currentUrl.includes("/oauth/login") ||
			currentUrl.includes("/login") ||
			currentUrl.includes("discord.com");

		expect(isRedirectedToLogin).toBe(true);

		await page.close();
	});

	it("authenticated user sees their name on the profile page", async () => {
		const page = await createPage("/");
		await seedSession(page, FIXTURE_DISCORD_USER);

		await page.goto("/profile");

		await expect(
			page.getByRole("heading", {
				name: FIXTURE_DISCORD_USER.globalName ?? FIXTURE_DISCORD_USER.username,
				level: 2,
			}),
		).toBeVisible();

		await page.close();
	});

	it("authenticated user is not redirected from protected route", async () => {
		const page = await createPage("/");
		await seedSession(page, FIXTURE_DISCORD_USER);

		await page.route("**/api/guilds/**", (route) =>
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					id: "123456789012345678",
					name: "Test Guild",
					icon: null,
				}),
			}),
		);

		await page.goto("/guilds/123456789012345678/manage");

		await page.waitForURL(/\/guilds\/123456789012345678\/manage/, { timeout: 10_000 });

		expect(page.url()).toMatch(/\/guilds\/123456789012345678\/manage/);

		await page.close();
	});
});
