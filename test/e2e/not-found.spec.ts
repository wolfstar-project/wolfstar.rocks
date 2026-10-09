import { expect, test } from "./test-utils.ts";

/**
 * `experimental.early404` rejects paths no page or alias can match before the
 * Vue app, plugins and middleware are created; `inlineErrorRendering` (a
 * `compatibilityVersion: 5` default) then renders `app/error.vue` in the same
 * request. Cover that path end to end, since component tests never exercise the
 * server response or the plugins `useI18n()` depends on.
 */
test.describe("Unknown routes", () => {
	test("respond 404 with the translated error page", async ({ page, goto }) => {
		const response = await goto("/this-page-does-not-exist", {
			waitUntil: "networkidle",
		});

		expect(response).not.toBeNull();
		expect(response!.status()).toBe(404);
		await expect(page).toHaveTitle(/page not found/i);
		await expect(page.locator("#error-page-title")).toHaveText("Page not found");
	});

	test("link back to the home page", async ({ page, goto }) => {
		// The preview server resizes `/.netlify/images` requests on the fly (Netlify's
		// CDN does in production), which can starve the home page chunk that
		// `<Suspense>` waits on before swapping out the error page.
		await page.route("**/.netlify/images**", (route) => route.fulfill({ status: 404 }));
		await goto("/this-page-does-not-exist", { waitUntil: "networkidle" });

		await page.getByRole("button", { name: "Back to home" }).click();
		await page.waitForURL((url) => url.pathname === "/");

		await expect(
			page.getByRole("heading", { name: /moderation, with a paper trail/i, level: 1 }),
		).toBeVisible();
	});

	test("are case-sensitive", async ({ goto }) => {
		const response = await goto("/Privacy", { waitUntil: "domcontentloaded" });

		expect(response).not.toBeNull();
		expect(response!.status()).toBe(404);
	});
});
