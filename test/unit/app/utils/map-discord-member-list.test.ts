import { ActivityType, UserFlags } from "discord-api-types/v10";
import { describe, expect, it } from "vitest";
import {
	MEMBER_LIST_USER_FLAGS,
	mapDiscordMemberListMembers,
	type DiscordMemberListApiFixture,
	type DiscordMemberListRoleFixture,
} from "~/utils/constants";

const roles: DiscordMemberListRoleFixture[] = [
	{
		id: "role-star",
		name: "Star Network",
		color: 0,
		hoist: true,
		position: 30,
	},
	{
		id: "role-devs",
		name: "Developers",
		color: 0,
		hoist: true,
		position: 20,
		uiColor: "oklch(68% 0.2 350)",
	},
];

describe("mapDiscordMemberListMembers", () => {
	it("maps guild member + user + presence into the member-list view-model", () => {
		const fixtures: DiscordMemberListApiFixture[] = [
			{
				user: {
					id: "1",
					username: "wolfstar",
					discriminator: "0",
					global_name: "WolfStar",
					avatar: null,
					bot: true,
					public_flags: MEMBER_LIST_USER_FLAGS.verifiedBot,
				},
				nick: null,
				roles: ["role-star"],
				joined_at: "2020-01-01T00:00:00.000+00:00",
				deaf: false,
				mute: false,
				flags: 0,
				presence: {
					status: "online",
					activities: [
						{
							name: "Custom Status",
							type: ActivityType.Custom,
							state: "WolfStar, help",
						},
					],
				},
				showcase: { avatarUrl: "/avatars/wolfstar.png" },
			},
		];

		expect(mapDiscordMemberListMembers(fixtures, roles)).toEqual([
			{
				id: "1",
				name: "WolfStar",
				avatar: "/avatars/wolfstar.png",
				role: "Star Network",
				pinned: true,
				description: "WolfStar, help",
				app: true,
				verified: true,
				presence: "online",
			},
		]);
	});

	it("prefers nick over global_name and username", () => {
		const fixtures: DiscordMemberListApiFixture[] = [
			{
				user: {
					id: "2",
					username: "lory",
					discriminator: "0",
					global_name: "Lory",
					avatar: null,
				},
				nick: "RVG|lory",
				roles: ["role-devs"],
				joined_at: "2020-01-01T00:00:00.000+00:00",
				deaf: false,
				mute: false,
				flags: 0,
			},
		];

		expect(mapDiscordMemberListMembers(fixtures, roles)[0]?.name).toBe("RVG|lory");
	});

	it("derives http from BotHTTPInteractions and verified from VerifiedBot only", () => {
		const fixtures: DiscordMemberListApiFixture[] = [
			{
				user: {
					id: "3",
					username: "ring",
					discriminator: "0",
					global_name: "Ring",
					avatar: null,
					bot: true,
					public_flags: UserFlags.BotHTTPInteractions,
				},
				roles: ["role-star"],
				joined_at: "2020-01-01T00:00:00.000+00:00",
				deaf: false,
				mute: false,
				flags: 0,
				showcase: { icon: "ph:discord-logo-fill" },
			},
		];

		const mapped = mapDiscordMemberListMembers(fixtures, roles)[0];
		expect(mapped?.app).toBe(true);
		expect(mapped?.http).toBe(true);
		expect(mapped?.verified).toBeUndefined();
		expect(mapped?.icon).toBe("ph:discord-logo-fill");
	});

	it("formats custom status emoji + state for the secondary line", () => {
		const fixtures: DiscordMemberListApiFixture[] = [
			{
				user: {
					id: "4",
					username: "redstar",
					discriminator: "0",
					global_name: "RedStar",
					avatar: null,
				},
				roles: ["role-devs"],
				joined_at: "2020-01-01T00:00:00.000+00:00",
				deaf: false,
				mute: false,
				flags: 0,
				presence: {
					status: "dnd",
					activities: [
						{
							name: "Custom Status",
							type: ActivityType.Custom,
							state: "shipping",
							emoji: { name: "🎮" },
						},
					],
				},
				showcase: { nameColor: "oklch(63% 0.2 25)" },
			},
		];

		const mapped = mapDiscordMemberListMembers(fixtures, roles)[0];
		expect(mapped?.description).toBe("🎮 shipping");
		expect(mapped?.color).toBe("oklch(63% 0.2 25)");
		expect(mapped?.presence).toBe("dnd");
	});

	it("maps offline bots without a hoisted role section", () => {
		const fixtures: DiscordMemberListApiFixture[] = [
			{
				user: {
					id: "5",
					username: "offlinebot",
					discriminator: "0",
					global_name: "Offline Bot",
					avatar: null,
					bot: true,
					public_flags: MEMBER_LIST_USER_FLAGS.verifiedBot,
				},
				roles: [],
				joined_at: "2020-01-01T00:00:00.000+00:00",
				deaf: false,
				mute: false,
				flags: 0,
				presence: { status: "offline" },
			},
		];

		expect(mapDiscordMemberListMembers(fixtures, roles)).toEqual([
			{
				id: "5",
				name: "Offline Bot",
				app: true,
				verified: true,
				presence: "offline",
			},
		]);
	});
});
