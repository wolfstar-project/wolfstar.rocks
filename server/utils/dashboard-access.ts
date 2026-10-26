import type { GuildData, ReadonlyGuildData } from "#server/database/settings/types";
import type { APIGuild, APIGuildMember } from "discord-api-types/v10";
import { hasAdminPermissions } from "#server/utils/discord/admin";
import { resolveDashboardAccess } from "#shared/utils/dashboard-access";
import { createError } from "evlog";

/**
 * Checks a settings write that changes the dashboard access rules before it is
 * made. Only the owner, or a member who manages the server without any rule,
 * may change them: a member let in by a rule alone must not let others in. A
 * change that would keep its writer out is refused, the owner excepted, who no
 * rule can keep out.
 */
export function assertCanEditDashboardAccess(
	guild: APIGuild,
	member: APIGuildMember,
	settings: ReadonlyGuildData,
	changes: Partial<GuildData>,
): void {
	const { permissionsUsers, permissionsRoles } = changes;
	if (permissionsUsers === undefined && permissionsRoles === undefined) return;
	if (member.user.id === guild.owner_id) return;

	if (!hasAdminPermissions(guild, member, settings.rolesAdmin)) {
		throw createError({
			message: "You cannot change who opens the dashboard",
			status: 403,
			why: "Only the owner or a member who can manage the server changes the dashboard access rules",
			fix: "Ask the server owner or an administrator to change them",
		});
	}

	const access = resolveDashboardAccess(
		{ userId: member.user.id, roleIds: member.roles },
		{
			users: permissionsUsers ?? settings.permissionsUsers,
			roles: permissionsRoles ?? settings.permissionsRoles,
		},
		guild.roles,
	);
	if (access === "deny") {
		throw createError({
			message: "This change would lock you out of the dashboard",
			status: 409,
			why: "A rule in the change denies you the dashboard, which would lock you out once it is saved",
			fix: "Remove the deny that names you or your highest role, or ask the server owner to make it",
		});
	}
}
