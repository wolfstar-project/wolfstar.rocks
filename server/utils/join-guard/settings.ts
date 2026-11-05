import type { ReadonlyGuildData } from "#server/database/settings/types";
import { createError } from "evlog";

type JoinGuardRoles = Pick<ReadonlyGuildData, "joinGuardPendingRole" | "joinGuardVerifiedRole">;

/**
 * Refuses a change that would make one role the pending and the verified role
 * of the join guard, with 422 `join-guard-same-roles`: every member who waits
 * would hold the role that lets them in. The bot's serializer refuses it the
 * same way (`findJoinGuardSettingsConflict`), checked on what the settings end
 * up as.
 */
export function assertJoinGuardRolesDiffer(
	current: Readonly<JoinGuardRoles>,
	changes: Partial<ReadonlyGuildData>,
): void {
	if (!("joinGuardPendingRole" in changes) && !("joinGuardVerifiedRole" in changes)) return;

	const pending =
		changes.joinGuardPendingRole ??
		("joinGuardPendingRole" in changes ? null : current.joinGuardPendingRole);
	const verified =
		changes.joinGuardVerifiedRole ??
		("joinGuardVerifiedRole" in changes ? null : current.joinGuardVerifiedRole);
	if (pending === null || pending !== verified) return;

	throw createError({
		message: "The pending and the verified roles are the same",
		status: 422,
		code: "join-guard-same-roles",
		why: "Every member who waits at the checkpoint would hold the role that lets them in",
		fix: "Pick two different roles, or leave one of them empty",
	});
}
