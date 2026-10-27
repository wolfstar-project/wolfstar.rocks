import type { APIGuild, APIGuildMember } from "discord-api-types/v10";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#server/utils/command-permissions/discord", () => ({ applicationId: () => BOT_ID }));

import { assertHoneypotIsUsable, checkHoneypotChannels } from "#server/utils/honeypot/permissions";

const GUILD_ID = "100000000000000000";
const { BOT_ID } = vi.hoisted(() => ({ BOT_ID: "200000000000000000" }));
const BOT_ROLE = "300000000000000000";
const TRAP = "400000000000000001";
const LOGS = "400000000000000002";

const TRAP_FLAGS =
	PermissionFlagsBits.ViewChannel |
	PermissionFlagsBits.SendMessages |
	PermissionFlagsBits.ReadMessageHistory |
	PermissionFlagsBits.ManageMessages |
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
const text = (
	id: string,
	overwrites: { id: string; allow: string; deny: string; type: 0 | 1 }[] = [],
) => ({
	id,
	type: 0,
	permission_overwrites: overwrites,
});

describe("checkHoneypotChannels", () => {
	it("passes a trap the bot can read, clean and ban in", () => {
		const result = checkHoneypotChannels({
			guild: guild(TRAP_FLAGS | PermissionFlagsBits.BanMembers),
			bot,
			channels: [text(TRAP), text(LOGS)],
			trap: TRAP,
			logs: LOGS,
			action: "Softban",
		});
		expect(result).toBeNull();
	});

	it("asks for Kick Members when the action is a kick", () => {
		const result = checkHoneypotChannels({
			guild: guild(TRAP_FLAGS | PermissionFlagsBits.BanMembers),
			bot,
			channels: [text(TRAP)],
			trap: TRAP,
			logs: null,
			action: "Kick",
		});
		expect(result).toStrictEqual({
			code: "honeypot-trap-permissions",
			missing: ["KickMembers"],
		});
	});

	it("follows the channel's overwrites for the bot's role", () => {
		const denied = {
			id: BOT_ROLE,
			allow: "0",
			deny: String(PermissionFlagsBits.ManageMessages),
			type: 0 as const,
		};
		const result = checkHoneypotChannels({
			guild: guild(TRAP_FLAGS | PermissionFlagsBits.BanMembers),
			bot,
			channels: [text(TRAP, [denied])],
			trap: TRAP,
			logs: null,
			action: "Ban",
		});
		expect(result).toStrictEqual({
			code: "honeypot-trap-permissions",
			missing: ["ManageMessages"],
		});
	});

	it("lets Administrator through whatever the overwrites", () => {
		const denied = { id: BOT_ROLE, allow: "0", deny: String(TRAP_FLAGS), type: 0 as const };
		const result = checkHoneypotChannels({
			guild: guild(PermissionFlagsBits.Administrator),
			bot,
			channels: [text(TRAP, [denied])],
			trap: TRAP,
			logs: null,
			action: "Ban",
		});
		expect(result).toBeNull();
	});

	it("refuses the same channel for the trap and the catches", () => {
		const result = checkHoneypotChannels({
			guild: guild(PermissionFlagsBits.Administrator),
			bot,
			channels: [text(TRAP)],
			trap: TRAP,
			logs: TRAP,
			action: "Ban",
		});
		expect(result).toStrictEqual({ code: "honeypot-same-channel" });
	});

	it("refuses a trap that is not a text channel of the server", () => {
		const result = checkHoneypotChannels({
			guild: guild(PermissionFlagsBits.Administrator),
			bot,
			channels: [{ id: TRAP, type: 2 }],
			trap: TRAP,
			logs: null,
			action: "Ban",
		});
		expect(result).toStrictEqual({ code: "honeypot-unknown-channel" });
	});

	it("asks for Embed Links in the catches channel", () => {
		const result = checkHoneypotChannels({
			guild: guild(
				(TRAP_FLAGS & ~PermissionFlagsBits.EmbedLinks) | PermissionFlagsBits.BanMembers,
			),
			bot,
			channels: [text(TRAP), text(LOGS)],
			trap: TRAP,
			logs: LOGS,
			action: "Ban",
		});
		expect(result).toStrictEqual({ code: "honeypot-log-permissions", missing: ["EmbedLinks"] });
	});

	it("checks nothing when the honeypot is off", () => {
		const result = checkHoneypotChannels({
			guild: guild(0n),
			bot,
			channels: [],
			trap: null,
			logs: LOGS,
			action: "Ban",
		});
		expect(result).toBeNull();
	});
});

describe("assertHoneypotIsUsable", () => {
	const getChannels = vi.fn();
	const getMember = vi.fn();

	beforeEach(() => {
		getChannels.mockReset().mockResolvedValue([text(TRAP)]);
		getMember.mockReset().mockResolvedValue(bot);
		(globalThis as Record<string, unknown>).useApi = () => ({
			guilds: { getChannels, getMember },
		});
	});

	const current = {
		honeypotChannel: null,
		honeypotAction: "Ban",
		honeypotLogChannel: null,
	} as const;

	it("asks Discord nothing when the change leaves the honeypot alone", async () => {
		await assertHoneypotIsUsable(guild(0n), current, { language: "de" });
		expect(getChannels).not.toHaveBeenCalled();
	});

	it("asks Discord nothing when the honeypot is turned off", async () => {
		await assertHoneypotIsUsable(
			guild(0n),
			{ ...current, honeypotChannel: TRAP },
			{ honeypotChannel: null },
		);
		expect(getChannels).not.toHaveBeenCalled();
	});

	it("refuses with 422 and the failure's code a trap the bot cannot use", async () => {
		const error = await assertHoneypotIsUsable(guild(0n), current, {
			honeypotChannel: TRAP,
		}).catch((caught: unknown) => caught);

		expect(error).toMatchObject({ status: 422, code: "honeypot-trap-permissions" });
		expect(getMember).toHaveBeenCalledWith(GUILD_ID, BOT_ID);
	});

	it("lets a usable trap through", async () => {
		await expect(
			assertHoneypotIsUsable(guild(PermissionFlagsBits.Administrator), current, {
				honeypotChannel: TRAP,
			}),
		).resolves.toBeUndefined();
	});
});
