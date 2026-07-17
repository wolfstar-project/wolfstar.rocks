import { useLogger } from "evlog";

/**
 * Proxies to the internal bot API: GET /guilds/:guild/roles
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const log = useLogger(event);
		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const roles = await fetchBotApi(event, `/guilds/${guildId}/roles`);
		log.set({
			result: { roleCount: Array.isArray(roles) ? roles.length : undefined },
		});
		return roles;
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
