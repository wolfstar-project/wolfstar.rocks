import { createPage } from "@nuxt/test-utils/e2e";
import { FIXTURE_DISCORD_USER } from "../../fixtures/discord-user";
import { seedSession } from "../helpers/seed-session";
import { expect, test } from "../test-utils";

test.describe("authenticated state", async () => {
	test("unauthenticated user is redirected to login when accessing protected route", async () => {
		const page = await createPage();

		// Stub Discord to prevent leaving the test domain
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

	test("authenticated user sees their name on the profile page", async () => {
		const page = await createPage("/");
		await seedSession(page, FIXTURE_DISCORD_USER);

		await page.goto("/profile");

		// Profile page shows globalName ?? username in an h2
		await expect(
			page.getByRole("heading", {
				name: FIXTURE_DISCORD_USER.globalName ?? FIXTURE_DISCORD_USER.username,
				level: 2,
			}),
		).toBeVisible();

		await page.close();
	});

	test("authenticated user is not redirected from protected route", async () => {
		const page = await createPage("/");
		await seedSession(page, FIXTURE_DISCORD_USER);

		// Mock guild APIs to prevent API errors from obscuring the auth check
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

		// Give the router middleware time to run; if auth fails it redirects away
		await page.waitForTimeout(2_000);

		// Should still be on the guild page, not redirected to login
		expect(page.url()).toMatch(/\/guilds\/123456789012345678\/manage/);

		await page.close();
	});
});
