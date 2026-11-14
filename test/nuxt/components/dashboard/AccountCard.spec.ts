import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import AccountCard from "~/components/dashboard/AccountCard.vue";

mockNuxtImport("useDiscordAccount", () => () => ({
	animate: ref(false),
	avatar: ref(undefined),
	decoration: ref(null),
	discordUser: ref(null),
	name: ref("RedStar"),
	nameStyles: ref(null),
	nameplate: ref(null),
	username: ref("redstar071"),
}));

describe("DashboardAccountCard on a phone", () => {
	beforeAll(async () => {
		await page.viewport(390, 844);
	});

	afterAll(async () => {
		await page.viewport(1280, 900);
	});

	// As on Discord's phone app: the avatar is larger than its card.
	it("lets the avatar stand out of the card, above, below and at the left", async () => {
		const wrapper = await mountSuspended(AccountCard, {
			attachTo: document.body,
			props: { floating: true },
		});

		const card = wrapper.get(".account-card").element.getBoundingClientRect();
		const avatar = wrapper.get(".account-avatar").element.getBoundingClientRect();

		expect(avatar.height).toBe(72);
		expect(avatar.top).toBeLessThan(card.top);
		expect(avatar.bottom).toBeGreaterThan(card.bottom);
		expect(avatar.left).toBeLessThan(card.left);
		expect(wrapper.text()).toContain("redstar071");

		wrapper.unmount();
	});
});
