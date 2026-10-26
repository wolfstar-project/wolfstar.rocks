import type { GuildData, ReadonlyGuildData } from "#server/database/settings/types";
import type { APIGuild, APIGuildMember } from "discord-api-types/v10";
import { hasAdminPermissions } from "#server/utils/discord/admin";
import { resolveDashboardAccess, type PermissionEntry } from "#shared/utils/dashboard-access";
import { createError } from "evlog";

/**
 * Checks a settings write that changes the dashboard access rules, or the
 * admin roles, before it is made. Only the owner, or a member who manages the server without any rule,
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
	const { permissionsUsers, permissionsRoles, rolesAdmin } = changes;
	// The admin roles decide who manages the server without a rule, and so who
	// may write the rules: changing them is guarded the same way.
	if (
		permissionsUsers === undefined &&
		permissionsRoles === undefined &&
		rolesAdmin === undefined
	) {
		return;
	}
	if (member.user.id === guild.owner_id) return;

	if (!hasAdminPermissions(guild, member, settings.rolesAdmin)) {
		throw createError({
			message: "You cannot change who opens the dashboard",
			status: 403,
			why: "Only the owner or a member who can manage the server changes the dashboard access rules and the admin roles",
			fix: "Ask the server owner or an administrator to change them",
		});
	}

	const refused = firstOutrankedRule(guild, member, settings, permissionsUsers, permissionsRoles);
	if (refused) {
		throw createError({
			message: "You cannot change this dashboard access rule",
			status: 403,
			why: refused,
			fix: "Ask the server owner, or someone above that role, to change it",
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

function changedEntries(
	next: readonly PermissionEntry[] | undefined,
	current: readonly PermissionEntry[],
): PermissionEntry[] {
	if (next === undefined) return [];
	const before = new Map(current.map((entry) => [entry.id, JSON.stringify(entry)]));
	const after = new Set(next.map((entry) => entry.id));
	return [
		...next.filter((entry) => before.get(entry.id) !== JSON.stringify(entry)),
		// A removed rule is a change of its id too.
		...current.filter((entry) => !after.has(entry.id)),
	];
}

/**
 * Why a writer who is not the owner may not make a change, as the bot's
 * `/permission-nodes` refused it: a rule on a role at or above their own
 * highest role, or on the owner. `null` when nothing is out of their reach.
 */
function firstOutrankedRule(
	guild: APIGuild,
	member: APIGuildMember,
	settings: ReadonlyGuildData,
	users: readonly PermissionEntry[] | undefined,
	roles: readonly PermissionEntry[] | undefined,
): string | null {
	if (
		changedEntries(users, settings.permissionsUsers).some(
			(entry) => entry.id === guild.owner_id,
		)
	) {
		return "A rule cannot name the server owner, who always opens the dashboard";
	}
	const positions = new Map(guild.roles.map((role) => [role.id, role.position]));
	const held = new Set(member.roles);
	const highest = guild.roles.reduce(
		(top, role) => (held.has(role.id) ? Math.max(top, role.position) : top),
		0,
	);
	const outranked = changedEntries(roles, settings.permissionsRoles).find(
		(entry) => (positions.get(entry.id) ?? -1) >= highest,
	);
	return outranked
		? "The rule names a role at or above your highest role, which only someone above it may rule"
		: null;
}
