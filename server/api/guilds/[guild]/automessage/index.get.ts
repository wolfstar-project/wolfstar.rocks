import { authorizeAutoChannelManager } from "#server/utils/auto-channels/route";
import { readAutoMessages } from "#server/utils/auto-channels/write";
import { useManagedGuild } from "#server/utils/guilds/manager";

/** `GET /api/guilds/:guild/automessage`: the messages sent in a channel again and again, oldest first. */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		return readAutoMessages(guild.id);
	},
	{
		auth: true,
		authorize: authorizeAutoChannelManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 10, window: seconds(10) },
	},
);
