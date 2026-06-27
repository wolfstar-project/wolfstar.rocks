import { AppHeader } from "#components";
import { mockComponent, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { runAxe } from "../../utils/axe";

// Stub the auth dropdown so the header test doesn't trigger a real session fetch.
// The stub keeps an accessible name so it doesn't introduce axe violations.
mockComponent("AppHeaderAuth", async () => {
	const { h } = await import("vue");
	return {
		render: () =>
			h("button", { "type": "button", "aria-label": "Sign in with Discord" }, "Sign in"),
	};
});

describe("AppHeader", () => {
	describe("hydration safety", () => {
		it("renders deterministically across mounts (no SSR/client divergence)", async () => {
			const first = await mountSuspended(AppHeader);
			const second = await mountSuspended(AppHeader);
			expect(second.html()).toBe(first.html());
		});
	});

	describe("accessibility", () => {
		it("has no axe-core violations", async () => {
			const wrapper = await mountSuspended(AppHeader);
			const results = await runAxe(wrapper);
			expect(results.violations).toEqual([]);
		});

		it("renders the banner landmark", async () => {
			const wrapper = await mountSuspended(AppHeader);
			expect(wrapper.find("header").exists()).toBe(true);
		});

		it("names the primary navigation for assistive tech", async () => {
			const wrapper = await mountSuspended(AppHeader);
			expect(wrapper.find("[aria-label='Main navigation']").exists()).toBe(true);
		});

		it("renders the WolfStar logo mark with the resized svg hidden from AT", async () => {
			const wrapper = await mountSuspended(AppHeader);
			const svg = wrapper.find("svg");
			expect(svg.exists()).toBe(true);
			expect(svg.attributes("aria-hidden")).toBe("true");
			expect(svg.classes()).toContain("h-20");
			expect(svg.classes()).toContain("w-45");
		});
	});
});
