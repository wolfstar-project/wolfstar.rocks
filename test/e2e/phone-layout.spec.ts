import { expect, test } from "./test-utils.ts";

/**
 * `<main>` centres its page root (`items-center`), so the root takes the width of
 * its widest content. A grid column without `minmax(0, …)` grows to its content's
 * min-content: a Discord message demo then made the home page 459px wide on a
 * 412px phone and shifted every section off the left edge. The layout clips the
 * overflow, so the document never scrolls sideways: measure the page root instead.
 */
const PHONE = { width: 390, height: 844 };

for (const path of ["/", "/staryl"]) {
	test(`${path} fits a phone screen`, async ({ page, goto }) => {
		await page.setViewportSize(PHONE);
		await goto(path, { waitUntil: "networkidle" });

		const root = await page.locator("#maincontent > *").first().boundingBox();

		expect(root).not.toBeNull();
		expect(root!.x).toBeGreaterThanOrEqual(0);
		expect(root!.x + root!.width).toBeLessThanOrEqual(PHONE.width);
	});
}
