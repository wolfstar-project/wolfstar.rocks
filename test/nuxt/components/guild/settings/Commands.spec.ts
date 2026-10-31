import type { GuildData } from "#server/database";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import Commands from "~/components/guild/settings/Commands.vue";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";

const GUILD_ID = "123456789012345678";
const CHANNEL = "400000000000000001";

const mockGuildSettings = ref<GuildData | undefined>(createMockGuildData(GUILD_ID));

mockNuxtImport("useGuildSettings", () => () => ({
	guildSettings: mockGuildSettings,
	originalGuildSettings: mockGuildSettings,
	setGuildSettings: vi.fn(),
}));

mockNuxtImport("useGuildData", () => () => ({
	guildData: ref(createMockOauthFlattenedGuild({ id: GUILD_ID })),
}));

// The cards around it have specs of their own.
const stubs = { GuildSettingsDisabledCommands: true, GuildCommandsDiscordPermissions: true };

function mount() {
	return mountSuspended(Commands, { props: { commands: [] }, global: { stubs } });
}

// Accessibility audits for GuildCommandsRuleList live in test/nuxt/a11y.spec.ts.
describe("GuildSettingsCommands", () => {
	it("shows nothing of the rules of a group while there are none", async () => {
		mockGuildSettings.value = createMockGuildData(GUILD_ID, {
			commandsRestrictions: [{ command: "ban", ignoredChannels: [CHANNEL] }, { format: 2 }],
		});
		const wrapper = await mount();

		expect(wrapper.text()).not.toContain("Rules of a group of commands");
	});

	it("lists the rules of a group, the most specific first, and how they combine", async () => {
		mockGuildSettings.value = createMockGuildData(GUILD_ID, {
			commandsRestrictions: [
				{ command: "*", ignoredChannels: [CHANNEL] },
				{ command: "ban", ignoredChannels: [CHANNEL] },
				{ command: "Moderation.*", ignoredChannels: [CHANNEL] },
				{ command: "Moderation.Management.*", ignoredChannels: [CHANNEL] },
				{ format: 2 },
			],
		});
		const wrapper = await mount();

		expect(wrapper.findAll("li > p:first-child").map((name) => name.text())).toEqual([
			"Moderation · Management",
			"Moderation",
			"Every command",
		]);
		expect(wrapper.text()).toContain("the most specific one");
		expect(wrapper.text()).toContain("/commands");
	});
});
