import { expect, test } from "./test-utils";

const PAGES = ["/", "/staryl", "/terms", "/privacy"] as const;
const MARKETING_PAGES = ["/", "/staryl"] as const;

/**
 * Path prefixes whose 404s are hosting-infrastructure noise rather than app errors.
 *
 * These endpoints are served by the deployment platform's edge in production but are
 * absent from the local Playwright preview server, so requests to them 404 during e2e
 * runs without indicating anything wrong with the app itself:
 * - `/.netlify/images` — Netlify image CDN proxy.
 * - `/_vercel/speed-insights` — Vercel Speed Insights script/beacon, injected by the
 *   `@vercel/speed-insights` module and only resolvable on a Vercel deployment.
 */
const INFRA_NOISE_PATH_PREFIXES = ["/.netlify/images", "/_vercel/speed-insights"] as const;

/** True when a console message references a hosting-infra endpoint we intentionally ignore. */
function isInfraNoise(text: string): boolean {
	return INFRA_NOISE_PATH_PREFIXES.some((prefix) => text.includes(prefix));
}

test.describe("Hydration", () => {
	test.describe("responds 200", () => {
		for (const page of PAGES) {
			test(`${page}`, async ({ goto }) => {
				const response = await goto(page, { waitUntil: "domcontentloaded" });

				expect(response).not.toBeNull();
				expect(response!.status()).toBe(200);
			});
		}
	});

	test.describe("renders the hero heading on marketing pages", () => {
		for (const page of MARKETING_PAGES) {
			test(`${page}`, async ({ page: pw, goto }) => {
				await goto(page, { waitUntil: "domcontentloaded" });

				await expect(
					pw.getByRole("heading", { name: /imagine a/i, level: 1 }),
				).toBeVisible();
			});
		}
	});

	test.describe("does not produce hydration mismatches", () => {
		for (const page of PAGES) {
			test(`${page}`, async ({ goto, hydrationErrors }) => {
				await goto(page, { waitUntil: "networkidle" });

				expect(hydrationErrors).toHaveLength(0);
			});
		}
	});

	test.describe("navigation with View Transitions does not cause hydration errors", () => {
		test("/ -> /commands client-side navigation", async ({ page, goto }) => {
			const consoleErrors: string[] = [];
			page.on("console", (msg) => {
				if (
					msg.type() === "error" ||
					(msg.type() === "warning" && msg.text().includes("[nuxt]"))
				) {
					// Ignore hosting-infra 404s (Netlify image proxy, Vercel Speed
					// Insights) — these are infra noise, not app errors.
					const text = msg.text();
					if (isInfraNoise(text)) return;
					consoleErrors.push(text);
				}
			});

			await goto("/", { waitUntil: "networkidle" });
			const navLink = page
				.getByRole("navigation", { name: "Main navigation" })
				.getByRole("link", { name: /commands/i });
			await expect(navLink).toBeVisible();
			await navLink.click();
			await page.waitForURL(/commands/);

			expect(consoleErrors).toHaveLength(0);
		});
	});
});
