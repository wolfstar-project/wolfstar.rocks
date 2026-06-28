import { AppHeaderAuth } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { runAxe } from "../../utils/axe";

// `AppHeaderAuth` is a `.client.vue` component that reads the session through the
// auth module's `useAuth` -> `useUserSession`. Those calls resolve inside the
// precompiled module runtime, so they can't be intercepted with `mockNuxtImport`;
// without a real session the component renders its logged-out state, which is
// exactly what the server emits and what the client shows before the session
// resolves. These tests cover that default state.
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

	describe("accessibility", () => {
		it("has no axe-core violations", async () => {
			const wrapper = await mountSuspended(AppHeaderAuth);
			const results = await runAxe(wrapper);
			expect(results.violations).toEqual([]);
		});

		it("renders sign-in buttons that link to /login with an accessible name", async () => {
			const wrapper = await mountSuspended(AppHeaderAuth);
			const signInLinks = wrapper.findAll("a[href='/login']");
			expect(signInLinks.length).toBeGreaterThan(0);
			for (const link of signInLinks) {
				expect(link.attributes("aria-label")).toBe("Sign in with Discord");
			}
		});
	});
});
