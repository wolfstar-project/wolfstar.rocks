import { readFreshSettings } from "#server/database";
import { getCommandRuleParam } from "#server/utils/command-rules/command";
import { authorizeGuildManager, useManagedGuild } from "#server/utils/guilds/manager";
import { readCommandRuleState } from "#shared/utils/command-rules";

/**
 * `GET /api/guilds/:guild/command-rules/:command`: whether the command is on,
 * its rule, and the revision a save sends back. Read from the database rather
 * than this process's cache, since the bot's `/commands` writes them too.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		const command = getCommandRuleParam(event);
		return readCommandRuleState(await readFreshSettings(guild.id), command, guild.id);
	},
	{
		auth: true,
		authorize: authorizeGuildManager("Insufficient permissions to read command rules"),
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 10, window: seconds(10) },
	},
);
