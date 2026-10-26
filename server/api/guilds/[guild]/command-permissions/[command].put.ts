import type { H3Event } from "h3";
import { compactSettingsChanges } from "#server/utils/audit/patch-to-changes";
import {
	applicationId,
	loadDiscordCommands,
	loadPermissionSet,
} from "#server/utils/command-permissions/discord";
import { checkEditorRequirements } from "#server/utils/command-permissions/requirements";
import { hasCommandPermissionsScope } from "#server/utils/discord/token-scopes";
import { authorizeGuildManager, useManagedGuild } from "#server/utils/guilds/manager";
import {
	guildCommandPermissionsAccessDenied,
	guildCommandPermissionsUpdate,
} from "#shared/audit/actions";
import { CommandPermissionsPutSchema } from "#shared/schemas/command-permissions";
import {
	assertOverwriteLimit,
	isAppDefault,
	normalizeOverwrites,
	snapshotOf,
} from "#shared/utils/command-permissions";
import { isSnowflake } from "#shared/utils/snowflake";
import { DiscordAPIError, RateLimitError } from "@discordjs/rest";
import { ApplicationCommandPermissionType } from "discord-api-types/v10";
import { createError, useLogger, withAuditMethods } from "evlog";
import { parse } from "valibot";

const APP_DEFAULT_NAME = "app default";

function denied(event: H3Event, reason: string): void {
	const { guild, member } = useManagedGuild(event);
	withAuditMethods(useLogger(event)).audit(
		guildCommandPermissionsAccessDenied({
			actor: { type: "user", id: member.user.id, displayName: member.user.username },
			target: { type: "guild", id: guild.id },
			outcome: "denied",
			reason,
		}),
	);
}

/**
 * `PUT /api/guilds/:guild/command-permissions/:command`: writes a command's
 * whole set to Discord with the user's own token (`:command` may be the
 * application id, the app default). Discord replaces the set on every write,
 * so the write is refused when the set changed since the page read it.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild, member } = useManagedGuild(event);
		const commandId = getRouterParam(event, "command");
		if (!isSnowflake(commandId)) {
			throw createError({
				message: "Invalid command id",
				status: 400,
				why: "The command id in the path is not a snowflake",
				fix: "Use the id the command permissions list returned",
			});
		}
		const body = await readValidatedBody(event, (value) =>
			parse(CommandPermissionsPutSchema, value),
		);

		if (!(await hasCommandPermissionsScope(event))) {
			denied(event, "The token lacks applications.commands.permissions.update");
			throw createError({
				message: "Discord has not authorized command permission changes",
				status: 403,
				code: "scope-missing",
				why: "Your Discord sign-in does not include the permission to change command permissions",
				fix: "Authorize with Discord again from the command permissions tab",
			});
		}

		const api = useApi();
		const appId = applicationId();
		let commandName = APP_DEFAULT_NAME;
		let requiredPermissions: bigint | null = null;
		if (!isAppDefault(commandId, appId)) {
			const command = (await loadDiscordCommands(api, appId, guild.id)).find(
				(entry) => entry.id === commandId,
			);
			if (!command) {
				throw createError({
					message: "Unknown command",
					status: 404,
					code: "unknown-command",
					why: "Discord has no command of the bot with this id in this server",
					fix: "Reload the command permissions: the command may have been renamed or removed",
				});
			}
			commandName = command.name;
			requiredPermissions =
				command.defaultMemberPermissions === null
					? null
					: BigInt(command.defaultMemberPermissions);
		}

		const rows = normalizeOverwrites(body.permissions);
		assertOverwriteLimit(rows);

		const channels = rows.some((row) => row.type === ApplicationCommandPermissionType.Channel)
			? await api.guilds.getChannels(guild.id)
			: [];
		const failure = checkEditorRequirements({
			guild,
			member,
			channels,
			rows,
			requiredPermissions,
		});
		if (failure) {
			denied(event, `Editor requirement failed: ${failure.code}`);
			throw createError({
				message: "You cannot change these command permissions",
				status: 403,
				code: failure.code,
				why: "Discord asks Manage Server, Manage Roles, the command's own permissions, roles below your highest role and channels you can see",
				fix: "Remove the role or channel named, or ask someone with the missing permission",
			});
		}

		const before = await loadPermissionSet(api, appId, guild.id, commandId);
		if (snapshotOf({ [commandId]: before }) !== body.snapshot) {
			throw createError({
				message: "These command permissions changed in Discord",
				status: 409,
				code: "conflict",
				why: "Someone changed them in Discord after this page loaded them, and saving would erase that change",
				fix: "Reload the command permissions and make the change again",
			});
		}

		const token = await getCurrentToken(event);
		let after: typeof rows;
		try {
			after = (
				await api.applicationCommands.editGuildCommandPermissions(
					token.access_token,
					appId,
					guild.id,
					commandId,
					{ permissions: rows },
				)
			).permissions;
		} catch (error) {
			if (error instanceof RateLimitError) {
				throw createError({
					message: "Discord is rate limiting command permission changes",
					status: 503,
					code: "rate-limited",
					why: `Discord asked to wait ${Math.ceil(error.retryAfter / 1000)} seconds`,
					fix: "Send the remaining changes again in a moment",
				});
			}
			if (error instanceof DiscordAPIError && error.status === 403) {
				denied(event, "Discord refused the change");
				throw createError({
					message: "Discord refused the change",
					status: 403,
					code: "discord-refused",
					why: error.message,
					fix: "Check that you can manage the roles, members and channels named",
				});
			}
			throw error;
		}

		withAuditMethods(useLogger(event)).audit(
			guildCommandPermissionsUpdate({
				actor: { type: "user", id: member.user.id, displayName: member.user.username },
				target: { type: "guild", id: guild.id },
				outcome: "success",
				changes: compactSettingsChanges(
					{ [commandName]: before },
					{ [commandName]: after },
				),
			}),
		);

		return { permissions: after, snapshot: snapshotOf({ [commandId]: after }) };
	},
	{
		auth: true,
		authorize: authorizeGuildManager("Insufficient permissions to change command permissions"),
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 5, window: seconds(10) },
	},
);
