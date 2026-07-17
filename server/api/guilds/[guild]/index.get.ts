import { useLogger } from "evlog";

/**
 * Proxies to the internal bot API: GET /guilds/:guild
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const log = useLogger(event);
		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const query = getQuery(event);
		return await fetchBotApi(event, `/guilds/${guildId}`, {
			query: query as Record<string, unknown>,
		});
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
