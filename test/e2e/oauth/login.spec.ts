import { createPage } from "@nuxt/test-utils/e2e";
import { stubDiscordAuthorize } from "../helpers/mock-discord-oauth";
import { expect, test } from "../test-utils";

test.describe("oauth login page", async () => {
	test("sets CSRF cookies and redirects to Discord", async () => {
		const page = await createPage();

		// Stub Discord to prevent leaving the test domain
		await stubDiscordAuthorize(page);

		await page.goto("/oauth/login");
		await page.waitForURL(/discord\.com/, { timeout: 15_000 });

		const url = new URL(page.url());
		expect(url.hostname).toBe("discord.com");
		expect(url.pathname).toBe("/oauth2/authorize");
		expect(url.searchParams.get("state")).toBeTruthy();
		expect(url.searchParams.get("client_id")).toBe("test-client-id");
		expect(url.searchParams.get("response_type")).toBe("code");

		const cookies = await page.context().cookies();
		const nonceCookie = cookies.find((c) => c.name === "oauth_nonce");
		expect(nonceCookie).toBeDefined();
		expect(nonceCookie?.httpOnly).toBe(true);

		await page.close();
	});

	test("stores safe ?next param in oauth_redirect cookie", async () => {
		const page = await createPage();

		await stubDiscordAuthorize(page);
		await page.goto("/oauth/login?next=%2Fguilds%2F123456789%2Fmanage");
		await page.waitForURL(/discord\.com/, { timeout: 15_000 });

		const cookies = await page.context().cookies();
		const redirectCookie = cookies.find((c) => c.name === "oauth_redirect");
		expect(redirectCookie?.value).toBe("/guilds/123456789/manage");

		await page.close();
	});

	test("rejects unsafe ?next param and falls back to /", async () => {
		const page = await createPage();

		await stubDiscordAuthorize(page);
		await page.goto("/oauth/login?next=https%3A%2F%2Fevil.com");
		await page.waitForURL(/discord\.com/, { timeout: 15_000 });

		const cookies = await page.context().cookies();
		const redirectCookie = cookies.find((c) => c.name === "oauth_redirect");
		expect(redirectCookie?.value).toBe("/");

		await page.close();
	});

	test("/login alias redirects to Discord", async () => {
		const page = await createPage();

		await stubDiscordAuthorize(page);
		await page.goto("/login");
		await page.waitForURL(/discord\.com/, { timeout: 15_000 });

		expect(page.url()).toContain("discord.com");

		await page.close();
	});
});
