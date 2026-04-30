import { expect, test } from "./test-utils";

declare global {
	interface Window {
		__vtCallCount: number;
	}
}

test.describe("View Transitions", () => {
	test("Forward navigation triggers a View Transition", async ({ page, goto }) => {
		await page.addInitScript(() => {
			window.__vtCallCount = 0;
			const original = document.startViewTransition?.bind(document);
			if (original) {
				document.startViewTransition = (
					callbackOptions?: ViewTransitionUpdateCallback | StartViewTransitionOptions,
				) => {
					window.__vtCallCount++;
					return original(callbackOptions);
				};
			}
		});

		await goto("/", { waitUntil: "networkidle" });

		const navLink = page
			.getByRole("navigation", { name: "Main navigation" })
			.getByRole("link", { name: /commands/i });
		await expect(navLink).toBeVisible();
		await navLink.click();
		await page.waitForURL(/commands/);

		const callCount = await page.evaluate(() => window.__vtCallCount);
		expect(callCount).toBe(1);
	});

	test("OAuth pages do not trigger a View Transition", async ({ page, goto }) => {
		await page.addInitScript(() => {
			window.__vtCallCount = 0;
			const original = document.startViewTransition?.bind(document);
			if (original) {
				document.startViewTransition = (
					callbackOptions?: ViewTransitionUpdateCallback | StartViewTransitionOptions,
				) => {
					window.__vtCallCount++;
					return original(callbackOptions);
				};
			}
		});

		await goto("/login", { waitUntil: "networkidle" });

		const callCount = await page.evaluate(() => window.__vtCallCount);
		expect(callCount).toBe(0);
	});

	test("System reduced-motion prevents a View Transition", async ({ page, goto }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });

		await page.addInitScript(() => {
			window.__vtCallCount = 0;
			const original = document.startViewTransition?.bind(document);
			if (original) {
				document.startViewTransition = (
					callbackOptions?: ViewTransitionUpdateCallback | StartViewTransitionOptions,
				) => {
					window.__vtCallCount++;
					return original(callbackOptions);
				};
			}
		});

		await goto("/", { waitUntil: "networkidle" });

		const navLinkReduced = page
			.getByRole("navigation", { name: "Main navigation" })
			.getByRole("link", { name: /commands/i });
		await expect(navLinkReduced).toBeVisible();
		await navLinkReduced.click();
		await page.waitForURL(/commands/);

		const callCount = await page.evaluate(() => window.__vtCallCount);
		expect(callCount).toBe(0);
	});

	test("User-override reduced-motion prevents a View Transition", async ({
		context,
		page,
		goto,
	}) => {
		await context.addInitScript(() => {
			localStorage.setItem("user-prefers-reduced-motion", "true");
		});

		await page.addInitScript(() => {
			window.__vtCallCount = 0;
			const original = document.startViewTransition?.bind(document);
			if (original) {
				document.startViewTransition = (
					callbackOptions?: ViewTransitionUpdateCallback | StartViewTransitionOptions,
				) => {
					window.__vtCallCount++;
					return original(callbackOptions);
				};
			}
		});

		await goto("/", { waitUntil: "networkidle" });

		const navLinkUser = page
			.getByRole("navigation", { name: "Main navigation" })
			.getByRole("link", { name: /commands/i });
		await expect(navLinkUser).toBeVisible();
		await navLinkUser.click();
		await page.waitForURL(/commands/);

		const callCount = await page.evaluate(() => window.__vtCallCount);
		expect(callCount).toBe(0);
	});
});
