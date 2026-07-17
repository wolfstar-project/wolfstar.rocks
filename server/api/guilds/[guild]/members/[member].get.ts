import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { createError, useLogger } from "evlog";

/**
 * Proxies to the internal bot API: GET /guilds/:guild/members/:member
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const log = useLogger(event);
		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const memberId = getRouterParam(event, "member");
		if (isNullOrUndefined(memberId)) {
			throw createError({
				message: "Member ID is required",
				status: 400,
				why: "No member ID was provided in the request path",
				fix: "Include a valid member snowflake ID in the URL",
			});
		}
		log.set({ targetMember: { id: memberId } });

		return await fetchBotApi(event, `/guilds/${guildId}/members/${memberId}`);
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
