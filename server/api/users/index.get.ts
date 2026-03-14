import { createError, useLogger } from "evlog";

export default defineWrappedResponseHandler(
	async (event) => {
		const log = useLogger(event);

		const { user, guilds } = await getCurrentUser(event);

		log.info("Fetched user and guilds data", { userId: user.id, guildCount: guilds.length });

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
