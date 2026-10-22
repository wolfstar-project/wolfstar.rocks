import {
	auditAutoChannelChange,
	authorizeAutoChannelManager,
	readChannelParam,
	throwAutoChannelError,
	useManagedGuild,
} from "#server/utils/auto-channels/route";
import { clearAutoChannel } from "#server/utils/auto-channels/write";

/** `DELETE /api/guilds/:guild/autopurge/:channel`: stops purging a channel. */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		const channelId = readChannelParam(event);

		const before = await clearAutoChannel("autoPurge", guild.id, channelId).catch(
			throwAutoChannelError,
		);

		auditAutoChannelChange(event, "autoPurge", channelId, before, null);
		setResponseStatus(event, 204);
		return null;
	},
	{
		auth: true,
		authorize: authorizeAutoChannelManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(1) },
	},
);
