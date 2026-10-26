import { writeSettingsTransaction } from "#server/database";
import { compactSettingsChanges } from "#server/utils/audit/patch-to-changes";
import { authorizeGuildManager, useManagedGuild } from "#server/utils/guilds/manager";
import { guildAccessLegacyRemoved, guildSettingsAccessDenied } from "#shared/audit/actions";
import { LegacyRemovalSchema } from "#shared/schemas";
import { stripLegacyNodes } from "#shared/utils/dashboard-access";
import { createError, useLogger, withAuditMethods } from "evlog";
import { parse } from "valibot";

/**
 * `DELETE /api/guilds/:guild/access/legacy`: removes every legacy permission
 * node of the server, keeping its dashboard access rules. The owner's alone,
 * as in the bot, and confirmed by typing `REMOVE`.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const log = withAuditMethods(useLogger(event));
		const { guild, member } = useManagedGuild(event);

		if (member.user.id !== guild.owner_id) {
			log.audit(
				guildSettingsAccessDenied({
					actor: { type: "user", id: member.user.id, displayName: member.user.username },
					target: { type: "guild", id: guild.id },
					outcome: "denied",
					reason: "Only the server owner removes legacy permission nodes",
				}),
			);
			throw createError({
				message: "Only the server owner removes legacy permission nodes",
				status: 403,
				why: "Removing the legacy permission nodes cannot be undone, so it is the owner's",
				fix: "Ask the server owner to remove them, or download them as JSON first",
			});
		}

		await readValidatedBody(event, (body) => parse(LegacyRemovalSchema, body));

		using trx = await writeSettingsTransaction(guild.id);
		const users = stripLegacyNodes(trx.settings.permissionsUsers);
		const roles = stripLegacyNodes(trx.settings.permissionsRoles);
		const removed =
			trx.settings.permissionsUsers.length -
			users.length +
			(trx.settings.permissionsRoles.length - roles.length);

		if (removed > 0) {
			await trx.write({ permissionsUsers: users, permissionsRoles: roles }).submit();
			log.audit(
				guildAccessLegacyRemoved({
					actor: { type: "user", id: member.user.id, displayName: member.user.username },
					target: { type: "guild", id: guild.id },
					outcome: "success",
					changes: compactSettingsChanges(
						{ legacyPermissionNodes: removed },
						{ legacyPermissionNodes: 0 },
					),
				}),
			);
		}

		return { removed };
	},
	{
		auth: true,
		authorize: authorizeGuildManager(
			"Insufficient permissions to remove legacy permission nodes",
		),
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(30) },
	},
);
