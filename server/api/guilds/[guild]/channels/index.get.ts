import { useLogger } from "evlog";

/**
 * Proxies to the internal bot API: GET /guilds/:guild/channels
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const log = useLogger(event);
		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const channels = await fetchBotApi(event, `/guilds/${guildId}/channels`);
		log.set({
			result: {
				channelCount: Array.isArray(channels) ? channels.length : undefined,
			},
		});
		return channels;
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
