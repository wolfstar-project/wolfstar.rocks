import type { APIChannel, APIGuild, APIGuildMember } from "discord-api-types/v10";
import { DiscordAPIError } from "@discordjs/rest";
import { ChannelType, PermissionFlagsBits, RESTJSONErrorCodes } from "discord-api-types/v10";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#server/utils/command-permissions/discord", () => ({ applicationId: () => BOT_ID }));

import {
	checkAutoModerationLogChannel,
	getMissingAutoModerationLogPermissions,
} from "#server/utils/automod/log-channel";

const GUILD_ID = "100000000000000000";
const { BOT_ID } = vi.hoisted(() => ({ BOT_ID: "200000000000000000" }));
const BOT_ROLE = "300000000000000000";
const LOGS = "400000000000000001";
const THREAD = "400000000000000002";

const POST_FLAGS =
	PermissionFlagsBits.ViewChannel |
	PermissionFlagsBits.SendMessages |
	PermissionFlagsBits.EmbedLinks;

function guild(botPermissions: bigint): APIGuild {
	return {
		id: GUILD_ID,
		roles: [
			{ id: GUILD_ID, name: "@everyone", permissions: "0", position: 0 },
			{ id: BOT_ROLE, name: "WolfStar", permissions: String(botPermissions), position: 1 },
		],
	} as unknown as APIGuild;
}

const bot = { roles: [BOT_ROLE], user: { id: BOT_ID } } as unknown as APIGuildMember;

function channel(id: string, type: ChannelType, extra: Record<string, unknown> = {}): APIChannel {
	return { id, type, guild_id: GUILD_ID, permission_overwrites: [], ...extra } as APIChannel;
}

describe("getMissingAutoModerationLogPermissions", () => {
	it("passes a text channel the bot can post embeds in", () => {
		expect(
			getMissingAutoModerationLogPermissions({
				guild: guild(POST_FLAGS),
				bot,
				channel: channel(LOGS, ChannelType.GuildText),
				parent: null,
			}),
		).toStrictEqual([]);
	});

	it("names what the bot lacks, overwrites included", () => {
		const denied = channel(LOGS, ChannelType.GuildAnnouncement, {
			permission_overwrites: [
				{ id: BOT_ROLE, type: 0, allow: "0", deny: String(PermissionFlagsBits.EmbedLinks) },
			],
		});
		expect(
			getMissingAutoModerationLogPermissions({
				guild: guild(POST_FLAGS),
				bot,
				channel: denied,
				parent: null,
			}),
		).toStrictEqual(["EmbedLinks"]);
	});

	it("asks for Send Messages in Threads in a thread, as its channel grants it", () => {
		const input = {
			bot,
			channel: channel(THREAD, ChannelType.PublicThread, { parent_id: LOGS }),
			parent: channel(LOGS, ChannelType.GuildText),
		};
		expect(
			getMissingAutoModerationLogPermissions({ ...input, guild: guild(POST_FLAGS) }),
		).toStrictEqual(["SendMessagesInThreads"]);
		expect(
			getMissingAutoModerationLogPermissions({
				...input,
				guild: guild(POST_FLAGS | PermissionFlagsBits.SendMessagesInThreads),
			}),
		).toStrictEqual([]);
	});

	it("takes a post of a forum, as the bot does", () => {
		expect(
			getMissingAutoModerationLogPermissions({
				guild: guild(POST_FLAGS | PermissionFlagsBits.SendMessagesInThreads),
				bot,
				channel: channel(THREAD, ChannelType.PublicThread, { parent_id: LOGS }),
				parent: channel(LOGS, ChannelType.GuildForum),
			}),
		).toStrictEqual([]);
	});

	it("refuses a channel a log cannot go to, or one of another server", () => {
		const check = (target: APIChannel | null) =>
			getMissingAutoModerationLogPermissions({
				guild: guild(PermissionFlagsBits.Administrator),
				bot,
				channel: target,
				parent: null,
			});

		expect(check(null)).toBeNull();
		expect(check(channel(LOGS, ChannelType.GuildVoice))).toBeNull();
		expect(check(channel(LOGS, ChannelType.GuildText, { guild_id: "999" }))).toBeNull();
		// A thread whose channel cannot be read is no place for the logs either:
		expect(check(channel(THREAD, ChannelType.PublicThread, { parent_id: LOGS }))).toBeNull();
	});
});

describe("checkAutoModerationLogChannel", () => {
	const getChannel = vi.fn();
	const getMember = vi.fn();
	const getRoles = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		getMember.mockResolvedValue(bot);
		(globalThis as Record<string, unknown>).useApi = () => ({
			channels: { get: getChannel },
			guilds: { getMember, getRoles },
		});
	});

	it("asks Discord nothing for the moderation channel", async () => {
		await expect(checkAutoModerationLogChannel(guild(0n), null)).resolves.toBeNull();
		await expect(checkAutoModerationLogChannel(guild(0n), undefined)).resolves.toBeNull();
		expect(getChannel).not.toHaveBeenCalled();
	});

	// The guild comes from a cache an hour old: a permission granted since must count.
	it("reads the roles fresh from Discord", async () => {
		getChannel.mockResolvedValue(channel(LOGS, ChannelType.GuildText));
		getRoles.mockResolvedValue(guild(POST_FLAGS).roles);

		await expect(checkAutoModerationLogChannel(guild(0n), LOGS)).resolves.toBeNull();
	});

	it("says what the bot lacks", async () => {
		getChannel.mockResolvedValue(channel(LOGS, ChannelType.GuildText));
		getRoles.mockResolvedValue(guild(PermissionFlagsBits.ViewChannel).roles);

		await expect(checkAutoModerationLogChannel(guild(0n), LOGS)).resolves.toBe(
			"logChannelId: The bot lacks SendMessages, EmbedLinks in the channel.",
		);
	});

	it("reads the channel of a thread for its overwrites", async () => {
		getChannel.mockImplementation((id: string) =>
			Promise.resolve(
				id === THREAD
					? channel(THREAD, ChannelType.PublicThread, { parent_id: LOGS })
					: channel(LOGS, ChannelType.GuildText),
			),
		);
		getRoles.mockResolvedValue(
			guild(POST_FLAGS | PermissionFlagsBits.SendMessagesInThreads).roles,
		);

		await expect(checkAutoModerationLogChannel(guild(0n), THREAD)).resolves.toBeNull();
		expect(getChannel).toHaveBeenCalledWith(LOGS);
	});

	it("refuses a channel Discord does not know or the bot cannot see", async () => {
		getChannel.mockRejectedValue(
			new DiscordAPIError(
				{ code: RESTJSONErrorCodes.UnknownChannel, message: "Unknown Channel" },
				RESTJSONErrorCodes.UnknownChannel,
				404,
				"GET",
				`/channels/${LOGS}`,
				{},
			),
		);
		getRoles.mockResolvedValue(guild(POST_FLAGS).roles);

		await expect(checkAutoModerationLogChannel(guild(0n), LOGS)).resolves.toBe(
			"logChannelId: Expected a text or announcement channel of the guild, or a thread of one.",
		);
	});
});
