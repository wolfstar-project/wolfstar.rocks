import type { GuildData } from "#server/database";
import type { FlattenedCommand } from "#shared/types/discord";
import { mockNuxtImport, mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import Rules from "~/components/guild/commands/Rules.vue";
import {
	createMockChannel,
	createMockOauthFlattenedGuild,
	createMockRole,
} from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";

const GUILD_ID = "123456789012345678";
const ROLE = "300000000000000001";
const CHANNEL = "400000000000000001";

const mockGuildSettings = ref<GuildData | undefined>(createMockGuildData(GUILD_ID));

mockNuxtImport("useGuildSettings", () => () => ({
	guildSettings: mockGuildSettings,
	originalGuildSettings: mockGuildSettings,
	setGuildSettings: vi.fn(),
}));

mockNuxtImport("useGuildData", () => () => ({
	guildData: ref(
		createMockOauthFlattenedGuild({
			id: GUILD_ID,
			roles: [createMockRole({ id: ROLE, name: "Moderators" })],
			channels: [createMockChannel({ id: CHANNEL, name: "staff-only" })],
		}),
	),
}));

registerEndpoint(`/api/guilds/${GUILD_ID}/members/search`, { method: "GET", handler: () => [] });

const commands = [
	{
		category: "Moderation",
		command: "warnThresholds",
		description: "",
		name: "warn-thresholds list",
	},
] as unknown as FlattenedCommand[];

// Accessibility audits for GuildCommandsRules live in test/nuxt/a11y.spec.ts.
describe("GuildCommandsRules", () => {
	it("lists a command's rules by role and channel name, under its Discord name", async () => {
		mockGuildSettings.value = createMockGuildData(GUILD_ID, {
			commandsRestrictions: [
				{ command: "warnThresholds", allowedRoles: [ROLE], ignoredChannels: [CHANNEL] },
			],
		});
		useActiveGuild().selectGuild(GUILD_ID);
		const wrapper = await mountSuspended(Rules, { props: { commands } });

		expect(wrapper.text()).toContain("/warn-thresholds");
		expect(wrapper.text()).toContain("Moderators");
		expect(wrapper.text()).toContain("staff-only");
	});

	it("says the rules are the bot's and bind its administrators", async () => {
		const wrapper = await mountSuspended(Rules, { props: { commands } });
		expect(wrapper.text()).toContain("/commands");
		expect(wrapper.text()).toContain("administrators");
	});

	it("shows the empty state without rules", async () => {
		mockGuildSettings.value = createMockGuildData(GUILD_ID);
		const wrapper = await mountSuspended(Rules, { props: { commands } });
		expect(wrapper.text()).toContain("No command has rules");
	});
});
