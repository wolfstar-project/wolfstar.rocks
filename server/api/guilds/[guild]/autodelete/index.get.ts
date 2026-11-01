import { authorizeAutoChannelManager, useManagedGuild } from "#server/utils/auto-channels/route";
import { readAutoDeletes } from "#server/utils/auto-channels/write";

/** `GET /api/guilds/:guild/autodelete`: the channels whose messages are deleted, oldest first. */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		return readAutoDeletes(guild.id);
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
