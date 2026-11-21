import { invalidateGuildCache, shouldRefreshCurrentUserCache } from "#server/utils/discord/cache";
import { getCurrentUser, transformOauthGuildsAndUser } from "#server/utils/discord/index";
import { defineWrappedResponseHandler } from "#server/utils/wrappedEventHandler";
import { createError, useLogger } from "evlog";
import { setResponseHeader } from "nitro/h3";

export default defineWrappedResponseHandler(
	async (event) => {
		const log = useLogger(event);

		const { user, guilds } = await getCurrentUser(event);

		if (shouldRefreshCurrentUserCache(event)) {
			await Promise.all(guilds.map((guild) => invalidateGuildCache(guild.id)));
		}

		log.set({ user: { id: user.id } });
		log.set({ result: { guildCount: guilds.length } });

		const transformedData = await transformOauthGuildsAndUser({
			guilds,
			user,
		}).catch((error) => {
			throw createError({
				why: "Failed to transform guilds and user data",
				message: "An error occurred while processing your data",
				status: 500,
				cause: error,
			});
		});

		setResponseHeader(
			event,
			"Cache-Control",
			"private, max-age=30, stale-while-revalidate=300",
		);

		return { ...transformedData, guilds };
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
