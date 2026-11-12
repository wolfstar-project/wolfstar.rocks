import { authorizeAutoChannelManager, useManagedGuild } from "#server/utils/auto-channels/route";
import { readAutoPurges } from "#server/utils/auto-channels/write";

/** `GET /api/guilds/:guild/autopurge`: the channels that are purged, oldest first. */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		return readAutoPurges(guild.id);
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
