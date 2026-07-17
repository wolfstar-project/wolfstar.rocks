import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { createError, useLogger } from "evlog";

/**
 * Proxies to the internal bot API: GET /guilds/:guild/channels/:channel
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const log = useLogger(event);
		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const channelId = getRouterParam(event, "channel");
		if (isNullOrUndefined(channelId)) {
			throw createError({
				message: "Channel ID is required",
				status: 400,
				why: "No channel ID was provided in the request path",
				fix: "Include a valid channel snowflake ID in the URL",
			});
		}
		log.set({ channel: { id: channelId } });

		return await fetchBotApi(event, `/guilds/${guildId}/channels/${channelId}`);
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
