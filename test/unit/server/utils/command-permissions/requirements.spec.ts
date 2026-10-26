import type { ChannelOverwrites } from "#server/utils/command-permissions/requirements";
import type { Overwrite } from "#shared/utils/command-permissions";
import type { APIGuild, APIGuildMember } from "discord-api-types/v10";
import { checkEditorRequirements } from "#server/utils/command-permissions/requirements";
import {
	ApplicationCommandPermissionType,
	ChannelType,
	OverwriteType,
} from "discord-api-types/v10";
import { describe, expect, it } from "vitest";

const GUILD = "110000000000000000";
const OWNER = "100000000000000001";
const EDITOR = "100000000000000002";
const HIGH = "300000000000000001";
const MID = "300000000000000002";
const LOW = "300000000000000003";
const OPEN = "400000000000000001";
const SECRET = "400000000000000002";

// Manage Server 32, Manage Roles 268435456, View Channel 1024, Administrator 8.
const MANAGE = String(32n | 268435456n | 1024n);

const guild = {
	id: GUILD,
	owner_id: OWNER,
	roles: [
		{ id: GUILD, name: "@everyone", permissions: "1024", position: 0 },
		{ id: HIGH, name: "High", permissions: "0", position: 9 },
		{ id: MID, name: "Mid", permissions: MANAGE, position: 5 },
		{ id: LOW, name: "Low", permissions: "0", position: 1 },
	],
} as unknown as APIGuild;

const channels = [
	{ id: OPEN, type: ChannelType.GuildText, permission_overwrites: [] },
	{
		id: SECRET,
		type: ChannelType.GuildText,
		permission_overwrites: [{ id: GUILD, type: OverwriteType.Role, allow: "0", deny: "1024" }],
	},
] as unknown as ChannelOverwrites[];

function member(id: string, roles: string[], permissions?: string): APIGuildMember {
	return {
		user: { id },
		roles,
		...(permissions && { permissions }),
	} as unknown as APIGuildMember;
}

const role = (id: string): Overwrite => ({
	id,
	type: ApplicationCommandPermissionType.Role,
	permission: true,
});
const channel = (id: string): Overwrite => ({
	id,
	type: ApplicationCommandPermissionType.Channel,
	permission: false,
});

const editor = member(EDITOR, [MID]);

describe("checkEditorRequirements", () => {
	it("lets the owner edit anything", () => {
		const owner = member(OWNER, []);
		expect(
			checkEditorRequirements({
				guild,
				member: owner,
				channels,
				rows: [role(HIGH), channel(SECRET)],
			}),
		).toBeNull();
	});

	it("lets a member with Manage Server and Manage Roles edit roles below theirs", () => {
		expect(
			checkEditorRequirements({
				guild,
				member: editor,
				channels,
				rows: [role(LOW), channel(OPEN)],
			}),
		).toBeNull();
	});

	it("lets an Administrator through the permission checks", () => {
		const admin = member(EDITOR, [LOW], "8");
		expect(
			checkEditorRequirements({ guild, member: admin, channels, rows: [channel(SECRET)] }),
		).toBeNull();
	});

	it("asks for Manage Server first", () => {
		const nobody = member(EDITOR, [LOW]);
		expect(checkEditorRequirements({ guild, member: nobody, channels, rows: [] })).toEqual({
			code: "manage-guild",
		});
	});

	it("asks for Manage Roles", () => {
		const guildManager = member(EDITOR, [LOW], String(32n | 1024n));
		expect(
			checkEditorRequirements({ guild, member: guildManager, channels, rows: [] }),
		).toEqual({ code: "manage-roles" });
	});

	it("refuses a role at or above the editor's highest role, @everyone aside", () => {
		expect(
			checkEditorRequirements({ guild, member: editor, channels, rows: [role(HIGH)] }),
		).toEqual({ code: "role-above", roleId: HIGH });
		expect(
			checkEditorRequirements({ guild, member: editor, channels, rows: [role(MID)] }),
		).toEqual({ code: "role-above", roleId: MID });
		expect(
			checkEditorRequirements({ guild, member: editor, channels, rows: [role(GUILD)] }),
		).toBeNull();
	});

	it("refuses a channel the editor cannot see, All channels aside", () => {
		expect(
			checkEditorRequirements({ guild, member: editor, channels, rows: [channel(SECRET)] }),
		).toEqual({ code: "channel-hidden", channelId: SECRET });
		expect(
			checkEditorRequirements({
				guild,
				member: editor,
				channels,
				rows: [channel("109999999999999999")],
			}),
		).toBeNull();
	});
});

describe("checkEditorRequirements and the command's own permissions", () => {
	it("refuses a command the editor could not run", () => {
		// Ban Members = 4
		expect(
			checkEditorRequirements({
				guild,
				member: editor,
				channels,
				rows: [],
				requiredPermissions: 4n,
			}),
		).toEqual({ code: "command-unavailable" });
	});

	it("lets the editor through a command they can run, or the app default", () => {
		expect(
			checkEditorRequirements({
				guild,
				member: editor,
				channels,
				rows: [],
				requiredPermissions: 32n,
			}),
		).toBeNull();
		expect(
			checkEditorRequirements({
				guild,
				member: editor,
				channels,
				rows: [],
				requiredPermissions: null,
			}),
		).toBeNull();
	});
});
