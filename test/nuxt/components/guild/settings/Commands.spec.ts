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

// The card around it has a spec of its own.
const stubs = { GuildSettingsDisabledCommands: true };

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

		// Every command's rule has a row of its own above the commands.
		expect(wrapper.findAll("li > p > span:first-child").map((name) => name.text())).toEqual([
			"Moderation · Management",
			"Moderation",
		]);
		expect(wrapper.text()).toContain("the most specific one");
		expect(wrapper.text()).toContain("Change them with /commands in Discord.");
	});

	it("leaves the card out when every command has the only rule of a group", async () => {
		mockGuildSettings.value = createMockGuildData(GUILD_ID, {
			commandsRestrictions: [{ command: "*", ignoredChannels: [CHANNEL] }, { format: 2 }],
		});
		const wrapper = await mount();

		expect(wrapper.text()).not.toContain("Rules of a group of commands");
	});

	it("says when a group keeps its commands to the allowed roles and members", async () => {
		useActiveGuild().selectGuild(GUILD_ID);
		mockGuildSettings.value = createMockGuildData(GUILD_ID, {
			commandsRestrictions: [
				{ command: "Moderation.*", ignoredRoles: [GUILD_ID], allowedChannels: [CHANNEL] },
				{ format: 2 },
			],
		});
		const wrapper = await mount();

		expect(wrapper.get("li > p").text()).toContain("Only the allowed roles and members");
		expect(wrapper.text()).toContain("Only in");
	});
});
