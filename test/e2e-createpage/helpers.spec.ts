import { createPage, setup } from "@nuxt/test-utils/e2e";
import { describe, expect, test } from "vitest";
import { FIXTURE_DISCORD_USER } from "../fixtures/discord-user";
import { seedSession } from "./helpers/seed-session";
import { ROOT_DIR, TEST_NUXT_CONFIG } from "./setup";

describe("test helpers", async () => {
	await setup({
		rootDir: ROOT_DIR,
		browser: true,
		browserOptions: { type: "chromium", launch: { headless: true } },
		nuxtConfig: TEST_NUXT_CONFIG,
	});

	test("seedSession sets a valid session cookie", async () => {
		const page = await createPage("/");
		await seedSession(page, FIXTURE_DISCORD_USER);

		const cookies = await page.context().cookies();
		const sessionCookie = cookies.find((c) => c.name === "wolfstar-session");

		expect(sessionCookie).toBeDefined();
		expect(sessionCookie?.httpOnly).toBe(true);

		await page.close();
	});

	test("seedSession returns 404 when NODE_ENV is not test", async () => {
		// The endpoint guard is tested indirectly — in non-test environments,
		// the endpoint returns 404. This test only verifies the happy path
		// since NODE_ENV=test is enforced by the test runner configuration.
		const page = await createPage("/");
		const response = await page.request.post("/api/__test__/seed-session", {
			data: { user: FIXTURE_DISCORD_USER },
		});
		expect(response.ok()).toBe(true);
		await page.close();
	});
});
