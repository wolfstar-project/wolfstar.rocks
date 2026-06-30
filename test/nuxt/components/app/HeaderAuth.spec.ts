import { AppHeaderAuth } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";

// `AppHeaderAuth` is a `.client.vue` component that reads the session through the
// auth module's `useAuth` -> `useUserSession`. Those calls resolve inside the
// precompiled module runtime, so they can't be intercepted with `mockNuxtImport`;
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
});
