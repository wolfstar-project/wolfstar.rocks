/**
 * Regression test for the `/wolfstar` marketing page (and its `/` alias).
 *
 * Guards against a previous bug where the server-side bundle evaluation of
 * co-located `.client.vue` components registered via `modules/component-in-pages.ts`
 * triggered a `ReferenceError: Cannot access '__nuxt_component_N_client' before
 * initialization`, resulting in a 500 response.
 */

import { expect, test } from "./test-utils";

for (const path of ["/wolfstar", "/"]) {
	test.describe(`marketing page – ${path}`, () => {
		test("responds 200 and renders the hero heading", async ({ page, goto }) => {
			const response = await goto(path, { waitUntil: "domcontentloaded" });

			expect(response?.status()).toBe(200);

			await expect(page.getByRole("heading", { name: /imagine a/i, level: 1 })).toBeVisible();
		});

		test("does not produce hydration mismatches", async ({ page, goto, hydrationErrors }) => {
			await goto(path, { waitUntil: "networkidle" });

			expect(hydrationErrors).toHaveLength(0);
		});
	});
}
