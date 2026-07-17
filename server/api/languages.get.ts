/**
 * Public proxy for supported WolfStar bot languages.
 * Fetches from the internal bot API.
 */
export default defineWrappedCachedResponseHandler(
	async () => {
		return await fetchLanguages();
	},
	{
		auth: false,
		getKey: () => "bot-languages",
		maxAge: seconds.fromDays(1),
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
