import { expect, test } from "./test-utils";

const PAGES = ["/", "/staryl", "/terms", "/privacy"] as const;
const MARKETING_PAGES = ["/", "/staryl"] as const;

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
});
