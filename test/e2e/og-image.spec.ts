import { expect, test } from "./test-utils";

const paths = ["/", "/commands", "/staryl"];

for (const path of paths) {
	test.describe(path, () => {
		test(`og image for ${path}`, async ({ page, goto, baseURL }) => {
			await goto(path, { waitUntil: "domcontentloaded" });

			const ogImageUrl = await page
				.locator('meta[property="og:image"]')
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
				name: `og-image-for-${path.replace(/\//g, "-")}.png`,
			});
		});
	});
}
