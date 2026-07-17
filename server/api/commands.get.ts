/**
 * Public proxy for the WolfStar bot commands list.
 * Fetches from the internal bot API and returns the dashboard WolfCommand shape.
 */
export default defineWrappedCachedResponseHandler(
	async () => {
		return await fetchCommands();
	},
	{
		auth: false,
		getKey: () => "bot-commands",
		maxAge: seconds.fromHours(6),
		swr: true,
		rateLimit: {
			enabled: true,
			limit: 30,
			type: "sliding",
			window: seconds(60),
		},
		onError(log, error) {
			log.error(error);
		},
	},
);
