import type { CommandRule } from "#shared/utils/command-rules";
import { mockNuxtImport, mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it } from "vitest";
import RuleList from "~/components/guild/commands/RuleList.vue";
import {
	createMockChannel,
	createMockOauthFlattenedGuild,
	createMockRole,
} from "~~/test/mocks/discord";

const GUILD_ID = "123456789012345678";
const HIGH = "300000000000000001";
const LOW = "300000000000000002";
const TIED = "300000000000000003";
const CHANNEL = "400000000000000001";

mockNuxtImport("useGuildData", () => () => ({
	guildData: ref(
		createMockOauthFlattenedGuild({
			id: GUILD_ID,
			roles: [
				createMockRole({ id: LOW, name: "Newcomers", rawPosition: 1 }),
				createMockRole({ id: HIGH, name: "Staff", rawPosition: 5 }),
				createMockRole({ id: TIED, name: "Trial", rawPosition: 1 }),
			],
			channels: [createMockChannel({ id: CHANNEL, name: "staff-only" })],
		}),
	),
}));

registerEndpoint(`/api/guilds/${GUILD_ID}/members/search`, { method: "GET", handler: () => [] });

function rule(command: string, lists: Partial<Omit<CommandRule, "command">> = {}): CommandRule {
	return {
		command,
		allowedChannels: [],
		ignoredChannels: [],
		allowedRoles: [],
		ignoredRoles: [],
		allowedUsers: [],
		ignoredUsers: [],
		...lists,
	};
}

// Accessibility audits for GuildCommandsRuleList live in test/nuxt/a11y.spec.ts.
describe("GuildCommandsRuleList", () => {
	beforeEach(() => {
		useActiveGuild().selectGuild(GUILD_ID);
	});

	it("names each target and what it lists", async () => {
		const wrapper = await mountSuspended(RuleList, {
			props: {
				rules: [
					rule("Moderation.Management.*", { ignoredChannels: [CHANNEL] }),
					rule("Moderation.*", { allowedRoles: [HIGH] }),
					rule("*", { ignoredRoles: [LOW] }),
				],
			},
		});

		const text = wrapper.text();
		expect(text).toContain("Moderation · Management");
		expect(text).toContain("Not in");
		expect(text).toContain("#staff-only");
		expect(text).toContain("Also for roles");
		expect(text).toContain("Staff");
		expect(text).toContain("Every command");
		expect(text).toContain("Not for roles");
		expect(text).toContain("Newcomers");
	});

	it("shows @everyone as the status of the rule, not as a role", async () => {
		const wrapper = await mountSuspended(RuleList, {
			props: { rules: [rule("Tools.*", { allowedRoles: [HIGH], ignoredRoles: [GUILD_ID] })] },
		});

		expect(wrapper.text()).toContain("Only the allowed roles and users");
		expect(wrapper.text()).not.toContain("Not for roles");
		expect(wrapper.text()).not.toContain(GUILD_ID);
	});

	it("lists roles in the order they decide: by position, then the higher id", async () => {
		const wrapper = await mountSuspended(RuleList, {
			props: { rules: [rule("Tools.*", { ignoredRoles: [LOW, TIED, HIGH] })] },
		});

		expect(wrapper.get("dd").text()).toBe("Staff, Trial, Newcomers");
	});
});
