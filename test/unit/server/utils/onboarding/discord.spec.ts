import type { OnboardingRecord } from "#server/utils/onboarding/store";
import type { OnboardingStage } from "#shared/utils/onboarding";
import type { APIGuild, APIGuildMember } from "discord-api-types/v10";
import { GuildFeature, PermissionFlagsBits } from "discord-api-types/v10";
import { describe, expect, it, vi } from "vitest";

const discordApi = vi.hoisted(() => ({
	get: vi.fn(),
	getChannels: vi.fn(),
	getMember: vi.fn(),
	getOnboarding: vi.fn(),
	getRoles: vi.fn(),
}));

vi.mock("#server/utils/shared", () => ({ useApi: () => ({ guilds: discordApi }) }));
vi.mock("#server/utils/command-permissions/discord", () => ({
	applicationId: () => "200000000000000000",
}));

import {
	canGiveOnboardingRole,
	checkOnboardingLogChannel,
	fetchOnboardingDiscordFacts,
	onboardingReadinessInput,
	type OnboardingDiscordFacts,
} from "#server/utils/onboarding/discord";
import { onboardingReadiness } from "#shared/utils/onboarding";

const GUILD_ID = "100000000000000000";
const BOT_ID = "200000000000000000";
const BOT_ROLE = "300000000000000000";
const MEMBER_ROLE = "300000000000000001";
const ADMIN_ROLE = "300000000000000002";
const BOOSTER_ROLE = "300000000000000003";
const LOGS = "400000000000000001";
const VERIFY = "400000000000000002";
const VOICE = "400000000000000003";

const LOG_FLAGS =
	PermissionFlagsBits.ViewChannel |
	PermissionFlagsBits.SendMessages |
	PermissionFlagsBits.EmbedLinks;

const ALL_FLAGS =
	LOG_FLAGS |
	PermissionFlagsBits.ManageRoles |
	PermissionFlagsBits.KickMembers |
	PermissionFlagsBits.ModerateMembers;

function facts(
	options: {
		botPermissions?: bigint;
		features?: GuildFeature[];
		nativeOnboarding?: boolean;
		logOverwrites?: { id: string; allow: string; deny: string; type: 0 | 1 }[];
	} = {},
): OnboardingDiscordFacts {
	const guild = {
		features: options.features ?? [GuildFeature.Community],
		id: GUILD_ID,
		roles: [
			{ id: GUILD_ID, managed: false, name: "@everyone", permissions: "0", position: 0 },
			{ id: MEMBER_ROLE, managed: false, name: "Member", permissions: "0", position: 1 },
			{ id: BOOSTER_ROLE, managed: true, name: "Booster", permissions: "0", position: 2 },
			{
				id: BOT_ROLE,
				managed: true,
				name: "WolfStar",
				permissions: String(options.botPermissions ?? ALL_FLAGS),
				position: 3,
			},
			{ id: ADMIN_ROLE, managed: false, name: "Admin", permissions: "0", position: 4 },
		],
	} as unknown as APIGuild;

	return {
		bot: { roles: [BOT_ROLE], user: { id: BOT_ID } } as unknown as APIGuildMember,
		channels: [
			{ id: LOGS, permission_overwrites: options.logOverwrites ?? [], type: 0 },
			{ id: VERIFY, permission_overwrites: [], type: 0 },
			{ id: VOICE, permission_overwrites: [], type: 2 },
		],
		guild,
		nativeOnboarding: options.nativeOnboarding ?? true,
	};
}

function makeStage(overrides: Partial<OnboardingStage> = {}): OnboardingStage {
	return {
		answers: [],
		challenge: "Button",
		createdAt: 0,
		enabled: true,
		failureAction: "None",
		failureTimeout: null,
		id: "1",
		maxAttempts: 3,
		name: "Quick check",
		position: 0,
		question: null,
		roleId: null,
		timeLimit: 600,
		trigger: "Join",
		...overrides,
	};
}

function makeRecord(overrides: Partial<OnboardingRecord> = {}): OnboardingRecord {
	return {
		enabled: true,
		logChannelId: null,
		messageChannelId: VERIFY,
		revision: 1,
		stages: [makeStage()],
		...overrides,
	};
}

/** The blockers of a stored onboarding in a server, as the route answers them. */
function blockers(record: OnboardingRecord, discord: OnboardingDiscordFacts) {
	return onboardingReadiness(onboardingReadinessInput(record, discord));
}

describe("fetchOnboardingDiscordFacts", () => {
	it("reads Community from Discord now, not from the cached server", async () => {
		const cached = { features: [], id: GUILD_ID, roles: [] } as unknown as APIGuild;
		const live = { ...facts().guild, features: [GuildFeature.Community] };
		discordApi.get.mockResolvedValue(live);
		discordApi.getChannels.mockResolvedValue([]);
		discordApi.getMember.mockResolvedValue(facts().bot);
		discordApi.getRoles.mockResolvedValue(live.roles);
		discordApi.getOnboarding.mockResolvedValue({ enabled: true });

		const result = await fetchOnboardingDiscordFacts(cached);

		expect(result.guild.features).toStrictEqual([GuildFeature.Community]);
		expect(result.guild.roles).toStrictEqual(live.roles);
		expect(result.nativeOnboarding).toBe(true);
	});

	it("asks for no onboarding in a server that has no Community", async () => {
		const live = { ...facts().guild, features: [] };
		discordApi.get.mockResolvedValue(live);
		discordApi.getChannels.mockResolvedValue([]);
		discordApi.getMember.mockResolvedValue(facts().bot);
		discordApi.getRoles.mockResolvedValue(live.roles);
		discordApi.getOnboarding.mockClear();

		const result = await fetchOnboardingDiscordFacts(live);

		expect(result.nativeOnboarding).toBe(false);
		expect(discordApi.getOnboarding).not.toHaveBeenCalled();
	});
});

describe("checkOnboardingLogChannel", () => {
	it("passes a text channel where the bot sees, writes and embeds", () => {
		expect(checkOnboardingLogChannel(facts(), LOGS)).toBeNull();
	});

	it("names the permissions an overwrite of the channel takes from the bot", () => {
		const denied = facts({
			logOverwrites: [
				{
					allow: "0",
					deny: String(PermissionFlagsBits.SendMessages | PermissionFlagsBits.EmbedLinks),
					id: BOT_ROLE,
					type: 0,
				},
			],
		});

		expect(checkOnboardingLogChannel(denied, LOGS)).toStrictEqual({
			code: "logPermissions",
			missing: ["SendMessages", "EmbedLinks"],
		});
	});

	it("names View Channel when the bot cannot see the channel", () => {
		const hidden = facts({ botPermissions: PermissionFlagsBits.SendMessages });

		expect(checkOnboardingLogChannel(hidden, LOGS)).toStrictEqual({
			code: "logPermissions",
			missing: ["ViewChannel", "EmbedLinks"],
		});
	});

	it("passes every channel for a bot that is an administrator", () => {
		const admin = facts({
			botPermissions: PermissionFlagsBits.Administrator,
			logOverwrites: [
				{
					allow: "0",
					deny: String(PermissionFlagsBits.ViewChannel),
					id: BOT_ROLE,
					type: 0,
				},
			],
		});

		expect(checkOnboardingLogChannel(admin, LOGS)).toBeNull();
	});

	it("refuses a channel the server does not have, and a voice channel", () => {
		expect(checkOnboardingLogChannel(facts(), "499999999999999999")).toStrictEqual({
			code: "logChannel",
		});
		expect(checkOnboardingLogChannel(facts(), VOICE)).toStrictEqual({ code: "logChannel" });
	});
});

describe("canGiveOnboardingRole", () => {
	it("gives a role below the bot's own", () => {
		expect(canGiveOnboardingRole(facts(), MEMBER_ROLE)).toBe(true);
	});

	it.each([
		["a role above the bot's own", ADMIN_ROLE],
		["the bot's own role", BOT_ROLE],
		["a role an integration manages", BOOSTER_ROLE],
		["@everyone", GUILD_ID],
		["a role the server does not have", "399999999999999999"],
	])("does not give %s", (_label, roleId) => {
		expect(canGiveOnboardingRole(facts(), roleId)).toBe(false);
	});
});

describe("the readiness of a stored onboarding", () => {
	it("blocks nothing in a server that has what the stages need", () => {
		const record = makeRecord({
			logChannelId: LOGS,
			stages: [
				makeStage({ failureAction: "Kick", id: "1", roleId: MEMBER_ROLE }),
				makeStage({
					failureAction: "Timeout",
					failureTimeout: 600,
					id: "2",
					trigger: "NativeOnboarding",
				}),
			],
		});

		expect(blockers(record, facts())).toStrictEqual([]);
	});

	it("asks for Community before Discord's onboarding", () => {
		const record = makeRecord({
			stages: [makeStage({ id: "2", trigger: "NativeOnboarding" })],
		});

		expect(blockers(record, facts({ features: [], nativeOnboarding: false }))).toStrictEqual([
			{ code: "communityOff", stageIds: ["2"] },
		]);
		expect(blockers(record, facts({ nativeOnboarding: false }))).toStrictEqual([
			{ code: "nativeOnboardingOff", stageIds: ["2"] },
		]);
	});

	it("names the permissions the bot lacks for a role, a kick and a timeout", () => {
		const record = makeRecord({
			stages: [
				makeStage({ id: "1", roleId: MEMBER_ROLE }),
				makeStage({ failureAction: "Kick", id: "2" }),
				makeStage({ failureAction: "Timeout", failureTimeout: 600, id: "3" }),
			],
		});

		expect(blockers(record, facts({ botPermissions: LOG_FLAGS }))).toStrictEqual([
			{ code: "missingPermission", permission: "ManageRoles", stageIds: ["1"] },
			{ code: "missingPermission", permission: "KickMembers", stageIds: ["2"] },
			{ code: "missingPermission", permission: "ModerateMembers", stageIds: ["3"] },
		]);
	});

	it("takes an administrator as holding every permission", () => {
		const record = makeRecord({
			stages: [makeStage({ failureAction: "Kick", id: "1", roleId: MEMBER_ROLE })],
		});

		expect(
			blockers(record, facts({ botPermissions: PermissionFlagsBits.Administrator })),
		).toStrictEqual([]);
	});

	it("tells a role above the bot's own from a role that is gone", () => {
		const record = makeRecord({
			stages: [
				makeStage({ id: "1", roleId: ADMIN_ROLE }),
				makeStage({ id: "2", roleId: "399999999999999999" }),
			],
		});

		expect(blockers(record, facts())).toStrictEqual([
			{ code: "roleUnmanageable", roleId: ADMIN_ROLE, stageId: "1" },
			{ code: "roleMissing", stageId: "2" },
		]);
	});

	it("asks for the verification message when the bot posted none, or its channel is gone", () => {
		expect(blockers(makeRecord({ messageChannelId: null }), facts())).toStrictEqual([
			{ code: "noVerificationMessage" },
		]);
		expect(
			blockers(makeRecord({ messageChannelId: "499999999999999999" }), facts()),
		).toStrictEqual([{ code: "noVerificationMessage" }]);
	});

	it("reports a log channel the bot cannot post in, and one that is gone", () => {
		const locked = facts({ botPermissions: PermissionFlagsBits.ViewChannel });

		expect(blockers(makeRecord({ logChannelId: LOGS }), locked)).toStrictEqual([
			{ code: "logPermissions", missing: ["SendMessages", "EmbedLinks"] },
		]);
		expect(blockers(makeRecord({ logChannelId: "499999999999999999" }), facts())).toStrictEqual(
			[{ code: "logChannelMissing" }],
		);
	});
});
