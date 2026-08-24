import { expect, test } from "./test-utils";

test("Shift+Escape does not draw an outline around the main content landmark", async ({
	page,
	goto,
}) => {
	await goto("/oauth/callback?error=invalid_code", { waitUntil: "networkidle" });

	const mainContent = page.locator("#maincontent");
	await mainContent.focus();
	await page.keyboard.press("Shift+Escape");

	await expect(mainContent).toBeFocused();
	await expect
		.poll(() => mainContent.evaluate((element) => getComputedStyle(element).outlineStyle))
		.toBe("none");
});
