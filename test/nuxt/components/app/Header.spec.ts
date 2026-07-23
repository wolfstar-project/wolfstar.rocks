import { AppHeader } from "#components";
import { mockComponent, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";

// Stub the auth dropdown so the header test doesn't trigger a real session fetch.
// The stub keeps an accessible name so it doesn't introduce axe violations.
mockComponent("AppHeaderAuth", async () => {
	const { h } = await import("vue");
	return {
		render: () =>
			h("button", { "type": "button", "aria-label": "Sign in with Discord" }, "Sign in"),
	};
});

// Accessibility audits for AppHeader live in test/nuxt/a11y.spec.ts.
describe("AppHeader", () => {
	describe("hydration safety", () => {
		it("renders deterministically across mounts (no SSR/client divergence)", async () => {
			const first = await mountSuspended(AppHeader);
			const second = await mountSuspended(AppHeader);
			expect(second.html()).toBe(first.html());
		});
	});
});
