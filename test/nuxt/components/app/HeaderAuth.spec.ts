import { AppHeaderAuth, AppPreferencesDialog } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";

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

	// `/profile` is deprecated: the local preferences open in a dialog, so a
	// guest never leaves the page they are on to change the theme or language.
	describe("guest settings button", () => {
		it("opens the preferences dialog instead of navigating", async () => {
			usePreferencesDialog().isOpen.value = false;
			const wrapper = await mountSuspended(AppHeaderAuth);
			const settings = wrapper.get('button[aria-label="Settings"]');
			expect(settings.classes().join(" ")).toContain("hidden");
			expect(settings.classes().join(" ")).toContain("md:inline-flex");
			expect(wrapper.find('a[href="/profile"]').exists()).toBe(false);

			await settings.trigger("click");

			expect(usePreferencesDialog().isOpen.value).toBe(true);
		});

		// The dialog is mounted by `app.vue`, apart from the button. Checking the
		// flag alone would pass with the dialog gone, so both are rendered here.
		it("shows the preferences once the button is clicked", async () => {
			usePreferencesDialog().isOpen.value = false;
			const wrapper = await mountSuspended(
				defineComponent({
					setup: () => () => [h(AppHeaderAuth), h(AppPreferencesDialog)],
				}),
				{ attachTo: document.body },
			);
			expect(document.body.querySelector('[role="dialog"]')).toBeNull();

			await wrapper.get('button[aria-label="Settings"]').trigger("click");

			await vi.waitFor(() => {
				const dialog = document.body.querySelector('[role="dialog"]');
				expect(dialog?.textContent).toContain("Settings");
				expect(dialog?.textContent).toContain("Theme");
			});

			usePreferencesDialog().isOpen.value = false;
			wrapper.unmount();
		});

		it("shows the settings button in the mobile drawer", async () => {
			const wrapper = await mountSuspended(AppHeaderAuth, {
				props: { mobile: true },
			});
			const settings = wrapper.get('button[aria-label="Settings"]');
			expect(settings.classes().join(" ")).toContain("rounded-lg");
		});
	});
});
