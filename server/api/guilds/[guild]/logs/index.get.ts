import { DashboardActivityQuerySchema } from "#shared/schemas";
import { createError, useLogger } from "evlog";
import { parse } from "valibot";

/**
 * Proxies to the internal bot API: GET /guilds/:guild/audit-logs
 * (dashboard path remains /api/guilds/:guild/logs for backwards compatibility)
 */
export default defineWrappedCachedResponseHandler(
	async (event) => {
		const log = useLogger(event);
		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const query = await getValidatedQuery(event, (body) =>
			parse(DashboardActivityQuerySchema, body),
		);

		return await fetchBotApi(event, `/guilds/${guildId}/audit-logs`, {
			query: query as Record<string, unknown>,
		});
	},
	{
		auth: true,
		maxAge: 30,
		swr: false,
		authorize: async (event) => {
			// Bot API enforces canManage; ensure the dashboard session exists first.
			const session = await getUserSession(event);
			if (!session?.user?.id) {
				throw createError({ status: 401, message: "Unauthorized" });
			}
			useLogger(event).set({
				guild: { id: getGuildParam(event) },
				member: { id: session.user.id },
			});
		},
		getKey: (event) => {
			const guildId = getGuildParam(event);
			const url = getRequestURL(event);
			return `guild:${guildId}:logs:audit${url.search}`;
		},
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 5, window: seconds(10) },
	},
);
