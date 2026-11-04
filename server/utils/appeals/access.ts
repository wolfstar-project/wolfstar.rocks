import type { Snowflake } from "discord-api-types/v10";
import { PermissionFlagsBits } from "discord-api-types/v10";

/** What decides who reviews the appeals of a guild. */
export interface AppealReviewerInput {
	userId: Snowflake;
	/** The owner of the guild, `null` when it is not known. */
	ownerId: Snowflake | null;
	roleIds: readonly Snowflake[];
	/** The member's server-wide permissions. */
	permissions: bigint;
	settings: {
		appealsManagerRoles: readonly Snowflake[];
		rolesModerator: readonly Snowflake[];
		rolesAdmin: readonly Snowflake[];
	};
}

/**
 * Whether a member reviews the appeals of a guild: the owner, the roles of
 * `appeals.manager-roles`, the moderators (the `rolesModerator` roles, or `Ban
 * Members` when there are none) and the administrators (the `rolesAdmin` roles,
 * or `Manage Server` when there are none). An administrator holds every
 * permission, as Discord reads it.
 *
 * The dashboard decides who may ask, and the bot checks the same again when it
 * runs the request (`noAccess`), so this mirrors `isAppealManager()` of
 * `projects/bot/src/lib/moderation/appealAccess.ts` in the bot.
 */
export function isAppealReviewer(input: AppealReviewerInput): boolean {
	const { userId, ownerId, roleIds, permissions, settings } = input;
	if (userId === ownerId) return true;

	const holds = (roles: readonly Snowflake[]) => roles.some((role) => roleIds.includes(role));
	if (holds(settings.appealsManagerRoles)) return true;

	const has = (bit: bigint) => (permissions & (bit | PermissionFlagsBits.Administrator)) !== 0n;
	const moderator =
		settings.rolesModerator.length === 0
			? has(PermissionFlagsBits.BanMembers)
			: holds(settings.rolesModerator);
	const administrator =
		settings.rolesAdmin.length === 0
			? has(PermissionFlagsBits.ManageGuild)
			: holds(settings.rolesAdmin);
	return moderator || administrator;
}
