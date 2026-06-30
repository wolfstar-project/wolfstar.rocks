import { AppFooter } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";

// Accessibility audits for AppFooter live in test/nuxt/a11y.spec.ts.
describe("AppFooter", () => {
	describe("hydration safety", () => {
		it("renders deterministically across mounts (no SSR/client divergence)", async () => {
			const first = await mountSuspended(AppFooter);
			const second = await mountSuspended(AppFooter);
			expect(second.html()).toBe(first.html());
		});

		it("derives the copyright year from a computed shared by server and client", async () => {
			const wrapper = await mountSuspended(AppFooter);
			expect(wrapper.text()).toContain(String(new Date().getFullYear()));
		});
	});
});
