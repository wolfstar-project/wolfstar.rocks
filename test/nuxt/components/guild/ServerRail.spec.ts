import { GuildServerRail } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";

// Accessibility audits for GuildServerRail live in test/nuxt/a11y.spec.ts.
describe("GuildServerRail", () => {
	it("links every manageable guild WolfStar is in to its dashboard", async () => {
		const wrapper = await mountSuspended(GuildServerRail, {
			props: {
				currentGuildId: "222222222222222222",
				guilds: [
					createMockOauthFlattenedGuild({ id: "111111111111111111", name: "Alpha" }),
					createMockOauthFlattenedGuild({ id: "222222222222222222", name: "Beta" }),
					createMockOauthFlattenedGuild({
						id: "333333333333333333",
						manageable: false,
						name: "Gamma",
					}),
				],
			},
		});

		const links = wrapper.findAll('a[href^="/guilds/"]');
		expect(links.map((link) => link.attributes("href"))).toStrictEqual([
			"/guilds/111111111111111111/manage",
			"/guilds/222222222222222222/manage",
		]);
		expect(links.map((link) => link.attributes("aria-label"))).toStrictEqual(["Alpha", "Beta"]);
	});

	it("marks the open guild as the current page", async () => {
		const wrapper = await mountSuspended(GuildServerRail, {
			props: {
				currentGuildId: "222222222222222222",
				guilds: [
					createMockOauthFlattenedGuild({ id: "111111111111111111", name: "Alpha" }),
					createMockOauthFlattenedGuild({ id: "222222222222222222", name: "Beta" }),
				],
			},
		});

		const current = wrapper.findAll('a[aria-current="page"]');
		expect(current).toHaveLength(1);
		expect(current[0]!.attributes("href")).toBe("/guilds/222222222222222222/manage");
	});

	it("keeps its place when the viewer manages no WolfStar guild", async () => {
		const wrapper = await mountSuspended(GuildServerRail, {
			props: {
				guilds: [createMockOauthFlattenedGuild({ wolfstarIsIn: false })],
			},
		});

		expect(wrapper.find("nav").exists()).toBe(true);
		expect(wrapper.findAll('a[href^="/guilds/"]')).toHaveLength(0);
	});

	it("holds the rail open with placeholders while the guilds load", async () => {
		const wrapper = await mountSuspended(GuildServerRail, {
			props: { guilds: [], pending: true },
		});

		const rail = wrapper.get("nav");
		expect(rail.findAll('a[href^="/guilds/"]')).toHaveLength(0);
		expect(rail.findAll(".size-12.rounded-2xl").length).toBeGreaterThan(0);
	});
});
