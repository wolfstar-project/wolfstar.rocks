import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { createError, useLogger } from "evlog";

/**
 * Proxies to the internal bot API: GET /guilds/:guild/roles/:role
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const log = useLogger(event);
		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const roleId = getRouterParam(event, "role");
		if (isNullOrUndefined(roleId)) {
			throw createError({
				message: "Role ID is required",
				status: 400,
				why: "No role ID was provided in the request path",
				fix: "Include a valid role snowflake ID in the URL",
			});
		}
		log.set({ role: { id: roleId } });

		return await fetchBotApi(event, `/guilds/${guildId}/roles/${roleId}`);
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
