import type { APIGuild, APIGuildMember, APIRole } from "discord-api-types/v10";
import { PermissionsBits } from "#shared/utils/bits";
import { cast } from "@sapphire/utilities";
import { hasAtLeastOneKeyInMap } from "@sapphire/utilities/hasAtLeastOneKeyInMap";
import { PermissionFlagsBits } from "discord-api-types/v10";

function computePermissions(memberRoles: string[], guildRoles: APIRole[]): bigint {
	let perms = 0n;
	for (const role of guildRoles) {
		if (memberRoles.includes(role.id) || role.name === "@everyone") {
			perms |= BigInt(role.permissions);
		}
	}
	return perms;
}

// `permissions` is absent on bot-token GET /guilds/{id}/members/{id} responses;
// fall back to computing permissions from the member's roles against guild.roles.
// Administrator implies every permission including ManageGuild.
export function hasAdminPermissions(
	guild: APIGuild,
	member: APIGuildMember,
	roles: readonly string[],
): boolean {
	if (roles.length > 0) {
		return hasAtLeastOneKeyInMap(
			new Map(roles.map((role) => [role, true])),
			member.roles.map((r) => r),
		);
	}

	const memberRolePermissions = memberPermissions(guild, member);

	return (
		PermissionsBits.has(memberRolePermissions, PermissionFlagsBits.Administrator) ||
		PermissionsBits.has(memberRolePermissions, PermissionFlagsBits.ManageGuild)
	);
}

/**
 * A member's server-wide permissions: the ones Discord sends with the member,
 * or else those of their roles and `@everyone`.
 */
export function memberPermissions(guild: APIGuild, member: APIGuildMember): bigint {
	const rawPermissions = cast<{ permissions?: string }>(member).permissions;
	return rawPermissions !== undefined
		? BigInt(rawPermissions)
		: computePermissions(member.roles, guild.roles);
}
