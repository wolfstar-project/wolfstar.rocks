import type { DiscordProfileUser } from "~~/shared/types/discord";
import { ProfileHeader } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";

function createProfileUser(overrides?: Partial<DiscordProfileUser>): DiscordProfileUser {
	return {
		id: "123456789012345678",
		username: "testuser",
		discriminator: "0",
		avatar: null,
		global_name: "Test User",
		name: "Test User",
		...overrides,
	} as DiscordProfileUser;
}

// Accessibility audits for ProfileHeader live in test/nuxt/a11y.spec.ts when added.
describe("ProfileHeader", () => {
	it("renders guest settings CTA without an account", async () => {
		const wrapper = await mountSuspended(ProfileHeader, {
			props: {
				user: null,
				pending: false,
			},
		});

		expect(wrapper.get("section").attributes("aria-label")).toBe("Local settings");
		expect(wrapper.text()).toContain("Settings");
		expect(wrapper.text()).toContain(
			"Customize appearance, language, and motion preferences on this device",
		);
		const signIn = wrapper.get('a[href="/login?next=/profile"]');
		expect(signIn.attributes("aria-label")).toBe("Sign in with Discord");
	});

	it("shows a loading skeleton while the signed-in profile is pending", async () => {
		const wrapper = await mountSuspended(ProfileHeader, {
			props: {
				user: null,
				pending: true,
			},
		});

		expect(wrapper.get("section").attributes("aria-label")).toBe("Loading...");
		expect(wrapper.find("[aria-busy='true']").exists()).toBe(true);
		expect(wrapper.find('a[href="/login?next=/profile"]').exists()).toBe(false);
	});

	it("renders the Discord profile for a signed-in user", async () => {
		const user = createProfileUser();
		const wrapper = await mountSuspended(ProfileHeader, {
			props: {
				user,
				pending: false,
			},
		});

		expect(wrapper.get("section").attributes("aria-label")).toBe("User profile");
		expect(wrapper.text()).toContain("Test User");
		expect(wrapper.text()).toContain("@testuser");
		expect(wrapper.text()).toContain(user.id);
	});
});
