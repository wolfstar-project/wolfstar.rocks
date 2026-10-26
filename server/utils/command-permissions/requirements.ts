import type { Overwrite } from "#shared/utils/command-permissions";
import type { APIGuild, APIGuildMember, APIOverwrite } from "discord-api-types/v10";
import { memberPermissions } from "#server/utils/discord/admin";
import { allChannelsId, everyoneId } from "#shared/utils/command-permissions";
import { ApplicationCommandPermissionType, PermissionFlagsBits } from "discord-api-types/v10";

export type EditorRequirementFailure =
	| { code: "manage-guild" }
	| { code: "manage-roles" }
	| { code: "role-above"; roleId: string }
	| { code: "channel-hidden"; channelId: string }
	| { code: "command-unavailable" };

/** What a channel needs to say who can see it. */
export interface ChannelOverwrites {
	id: string;
	permission_overwrites?: readonly APIOverwrite[];
}

interface EditorRequirementInput {
	guild: APIGuild;
	member: APIGuildMember;
	/** The server's channels, with their permission overwrites. */
	channels: readonly ChannelOverwrites[];
	/** The rows the editor is about to write. */
	rows: readonly Overwrite[];
	/**
	 * The command's `default_member_permissions`, which Discord asks of whoever
	 * edits it; `null` for none and for the app default.
	 */
	requiredPermissions?: bigint | null;
}

const has = (permissions: bigint, flag: bigint) => (permissions & flag) === flag;

function highestRolePosition(guild: APIGuild, member: APIGuildMember): number {
	const held = new Set(member.roles);
	return guild.roles.reduce(
		(highest, role) => (held.has(role.id) ? Math.max(highest, role.position) : highest),
		0,
	);
}

// Discord's order: `@everyone`'s overwrite, then the member's roles' together,
// then the member's own.
function canViewChannel(
	guild: APIGuild,
	member: APIGuildMember,
	base: bigint,
	channel: ChannelOverwrites,
): boolean {
	const overwrites = channel.permission_overwrites ?? [];
	let permissions = base;

	const everyone = overwrites.find((overwrite) => overwrite.id === guild.id);
	if (everyone) permissions = (permissions & ~BigInt(everyone.deny)) | BigInt(everyone.allow);

	const held = new Set(member.roles);
	let allow = 0n;
	let deny = 0n;
	for (const overwrite of overwrites) {
		if (overwrite.id !== guild.id && held.has(overwrite.id)) {
			allow |= BigInt(overwrite.allow);
			deny |= BigInt(overwrite.deny);
		}
	}
	permissions = (permissions & ~deny) | allow;

	const own = overwrites.find((overwrite) => overwrite.id === member.user.id);
	if (own) permissions = (permissions & ~BigInt(own.deny)) | BigInt(own.allow);

	return has(permissions, PermissionFlagsBits.ViewChannel);
}

/**
 * What Discord asks of whoever edits a command's permissions, checked before
 * Discord is: Manage Server and Manage Roles, the command's own permissions,
 * roles below their own highest, channels they can see. The owner passes everything; Administrator passes the
 * permission checks, not the role order. The first failing check, or `null`.
 */
export function checkEditorRequirements({
	guild,
	member,
	channels,
	rows,
	requiredPermissions = null,
}: EditorRequirementInput): EditorRequirementFailure | null {
	if (member.user.id === guild.owner_id) return null;

	const base = memberPermissions(guild, member);
	const administrator = has(base, PermissionFlagsBits.Administrator);
	if (!administrator && !has(base, PermissionFlagsBits.ManageGuild))
		return { code: "manage-guild" };
	if (!administrator && !has(base, PermissionFlagsBits.ManageRoles))
		return { code: "manage-roles" };
	if (!administrator && requiredPermissions !== null && !has(base, requiredPermissions)) {
		return { code: "command-unavailable" };
	}

	const highest = highestRolePosition(guild, member);
	const positions = new Map(guild.roles.map((role) => [role.id, role.position]));
	const everyone = everyoneId(guild.id);
	const allChannels = allChannelsId(guild.id);
	const channelsById = new Map(channels.map((channel) => [channel.id, channel]));

	for (const row of rows) {
		if (row.type === ApplicationCommandPermissionType.Role && row.id !== everyone) {
			if ((positions.get(row.id) ?? Number.POSITIVE_INFINITY) >= highest) {
				return { code: "role-above", roleId: row.id };
			}
		}
		if (row.type === ApplicationCommandPermissionType.Channel && row.id !== allChannels) {
			const channel = channelsById.get(row.id);
			if (!administrator && (!channel || !canViewChannel(guild, member, base, channel))) {
				return { code: "channel-hidden", channelId: row.id };
			}
		}
	}
	return null;
}
