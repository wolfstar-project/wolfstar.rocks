import { AppFooter } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { runAxe } from "../../utils/axe";

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

	describe("accessibility", () => {
		it("has no axe-core violations", async () => {
			const wrapper = await mountSuspended(AppFooter);
			const results = await runAxe(wrapper);
			expect(results.violations).toEqual([]);
		});

		it("exposes the footer landmark with an accessible name", async () => {
			const wrapper = await mountSuspended(AppFooter);
			expect(wrapper.find("[aria-label='Site footer']").exists()).toBe(true);
		});

		it("marks the decorative logo as an image and hides the inner svg from AT", async () => {
			const wrapper = await mountSuspended(AppFooter);
			const logo = wrapper.find("[role='img'][aria-label='WolfStar logo']");
			expect(logo.exists()).toBe(true);
			expect(logo.find("svg").attributes("aria-hidden")).toBe("true");
		});

		it("gives the external links accessible names that announce a new tab", async () => {
			const wrapper = await mountSuspended(AppFooter);
			expect(
				wrapper.find("[aria-label='Powered by Netlify - opens in new tab']").exists(),
			).toBe(true);
			expect(
				wrapper.find("[aria-label='Visit WolfStar on GitHub - opens in new tab']").exists(),
			).toBe(true);
		});
	});
});
