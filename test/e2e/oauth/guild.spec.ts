import { createPage } from "@nuxt/test-utils/e2e";
import { expect, test } from "../test-utils";

test.describe("oauth guild redirect page", async () => {
	test("shows Server Not Found when no guild_id query param is present", async () => {
		const page = await createPage("/oauth/guild");

		await expect(page.getByRole("heading", { name: "Server Not Found" })).toBeVisible();

		await page.close();
	});

	test("shows Redirecting and navigates to guild manage page", async () => {
		const page = await createPage("/oauth/guild?guild_id=123456789012345678");

		await expect(page.getByRole("heading", { name: "Redirecting" })).toBeVisible();

		// guild.vue waits 1.5s then navigates to /guilds/:id/manage
		await page.waitForURL(/\/guilds\/123456789012345678\/manage/, {
			timeout: 10_000,
		});

		await page.close();
	});

	test("shows Server Not Found for the literal value 'undefined'", async () => {
		const page = await createPage("/oauth/guild?guild_id=undefined");

		await expect(page.getByRole("heading", { name: "Server Not Found" })).toBeVisible();

		await page.close();
	});
});
