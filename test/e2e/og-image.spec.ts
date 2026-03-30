import { expect, test } from "./test-utils";

/**
 * OG image snapshot tests (Takumi templates).
 *
 * Each entry tests a different visual edge case to catch layout/overflow regressions:
 * - Static pages (Page.takumi)
 */
const testCases = [
	// Default OG image template
	{ path: "/", label: "home page" },
	{ path: "/commands", label: "commands page" },
	{ path: "/staryl", label: "staryl page" },
	{ path: "/profile", label: "profile page" },
] as const;

for (const { path, label } of testCases) {
	test.describe(`${label} (${path})`, () => {
		test(`og image snapshot`, async ({ page, goto, baseURL }) => {
			await goto(path, { waitUntil: "domcontentloaded" });

			const ogImageUrl = await page
				.locator('meta[property="og:image"]')
				.first()
				.getAttribute("content");
			expect(ogImageUrl).toBeTruthy();

			const ogImagePath = new URL(ogImageUrl!, baseURL).pathname;
			const localUrl = baseURL?.endsWith("/")
				? `${baseURL}${ogImagePath.slice(1)}`
				: `${baseURL}${ogImagePath}`;
			const response = await page.request.get(localUrl);

			expect(response.status()).toBe(200);
			expect(response.headers()["content-type"]).toContain("image/png");

			const imageBuffer = await response.body();
			expect(imageBuffer).toMatchSnapshot({
				name: `og-image-${path.replace(/\//g, "-").replace(/^-/, "") || "home"}.png`,
				maxDiffPixelRatio: 0.25,
			});
		});
	});
}
