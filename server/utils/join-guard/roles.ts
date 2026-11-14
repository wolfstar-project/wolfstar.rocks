import type { ReadonlyGuildData } from "#server/database/settings/types";
import type { APIGuild } from "discord-api-types/v10";
import { applicationId } from "#server/utils/command-permissions/discord";
import { findUnmanageableJoinGuardRole } from "#server/utils/join-guard/settings";
import { useApi } from "#server/utils/shared";
import { createError } from "evlog";

/**
 * Refuses a pending or verified role the bot could not give, with 422
 * `join-guard-unmanageable-role`: the checkpoint would let nobody through,
 * or hold nobody. The bot's `manageableRole` serializer refuses the same roles
 * in `/conf`; only a role the change sets is checked, so a role that became
 * unmanageable later does not block the other settings.
 */
export async function assertJoinGuardRolesManageable(
	guild: APIGuild,
	changes: Partial<ReadonlyGuildData>,
): Promise<void> {
	const roleIds = [changes.joinGuardPendingRole, changes.joinGuardVerifiedRole].filter(
		(id): id is string => typeof id === "string",
	);
	if (roleIds.length === 0) return;

	const api = useApi();
	const [roles, bot] = await Promise.all([
		api.guilds.getRoles(guild.id),
		api.guilds.getMember(guild.id, applicationId()),
	]);
	if (findUnmanageableJoinGuardRole(guild.id, roles, bot.roles, roleIds) === null) return;

	throw createError({
		message: "WolfStar cannot manage one of the join guard's roles",
		status: 422,
		code: "join-guard-unmanageable-role",
		why: "The role is managed by an integration, is @everyone, or sits at or above WolfStar's highest role",
		fix: "Pick a role below WolfStar's highest role, or move WolfStar's role above it in the server settings",
	});
}
