import { AppHeaderAuth } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";

// `AppHeaderAuth` is a `.client.vue` component that reads the session through
// `useUserSession`. Those calls resolve inside the precompiled module runtime,
// so they can't be intercepted with `mockNuxtImport`;
// without a real session the component renders its logged-out state, which is
// exactly what the server emits and what the client shows before the session
// resolves. These tests cover that default state.
// Accessibility audits for AppHeaderAuth live in test/nuxt/a11y.spec.ts.
describe("AppHeaderAuth", () => {
	describe("hydration safety", () => {
		// Client-only component: never server-rendered, so a hydration mismatch is
		// structurally impossible. We still assert the default markup is
		// deterministic, since non-deterministic output is the root cause of
		// mismatches in components that are server-rendered.
		it("renders the logged-out state deterministically across mounts", async () => {
			const first = await mountSuspended(AppHeaderAuth);
			const second = await mountSuspended(AppHeaderAuth);
			expect(second.html()).toBe(first.html());
		});
	});

	describe("responsive sign-in", () => {
		it("hides the header sign-in control below md breakpoints", async () => {
			const wrapper = await mountSuspended(AppHeaderAuth);
			const button = wrapper.get('a[aria-label="Sign in with Discord"]');
			expect(button.classes().join(" ")).toContain("hidden");
			expect(button.classes().join(" ")).toContain("md:inline-flex");
			expect(button.classes().join(" ")).not.toContain("w-full");
		});

		it("renders a compact non-block sign-in control in the mobile drawer", async () => {
			const wrapper = await mountSuspended(AppHeaderAuth, {
				props: { mobile: true },
			});
			const button = wrapper.get('a[aria-label="Sign in with Discord"]');
			expect(button.classes().join(" ")).toContain("rounded-lg");
			expect(button.classes().join(" ")).not.toContain("w-full");
			expect(button.attributes("href")).toBe("/login");
		});
	});
});
