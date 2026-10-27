import { matchRegisteredCommands } from "#server/utils/command-permissions/commands";
import {
	applicationId,
	loadDiscordCommands,
	loadPermissionSets,
} from "#server/utils/command-permissions/discord";
import { memberPermissions } from "#server/utils/discord/admin";
import { hasCommandPermissionsScope } from "#server/utils/discord/token-scopes";
import { authorizeGuildManager, useManagedGuild } from "#server/utils/guilds/manager";
import { snapshotOf } from "#shared/utils/command-permissions";
import { PermissionFlagsBits } from "discord-api-types/v10";

/**
 * `GET /api/guilds/:guild/command-permissions`: Discord's own permissions of
 * the bot's commands in the server, the commands with their Discord ids, the
 * snapshot a write sends back, and what the signed-in member may do.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild, member } = useManagedGuild(event);
		const api = useApi();
		const appId = applicationId();

		const [botCommands, discordCommands, permissions, scopeGranted] = await Promise.all([
			fetchCommands(),
			loadDiscordCommands(api, appId, guild.id),
			loadPermissionSets(api, appId, guild.id),
			hasCommandPermissionsScope(event),
		]);

		const bits = memberPermissions(guild, member);
		const isOwner = member.user.id === guild.owner_id;
		const administrator = (bits & PermissionFlagsBits.Administrator) !== 0n;
		const has = (flag: bigint) => isOwner || administrator || (bits & flag) === flag;

		return {
			applicationId: appId,
			commands: matchRegisteredCommands(botCommands, discordCommands),
			permissions,
			snapshot: snapshotOf(permissions),
			authorization: {
				scopeGranted,
				manageGuild: has(PermissionFlagsBits.ManageGuild),
				manageRoles: has(PermissionFlagsBits.ManageRoles),
			},
		};
	},
	{
		auth: true,
		authorize: authorizeGuildManager("Insufficient permissions to read command permissions"),
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 5, window: seconds(10) },
	},
);
