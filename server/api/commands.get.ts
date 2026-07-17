import { createError } from "evlog";

/**
 * Public proxy for the WolfStar bot commands list.
 * Fetches from the internal bot API (`NUXT_PUBLIC_API_BASE_URL`, e.g.
 * https://api.wolfstar.rocks) and returns the dashboard WolfCommand shape.
 */
export default defineWrappedCachedResponseHandler(
	async () => {
		const {
			public: { apiBaseUrl },
		} = useRuntimeConfig();

		if (!apiBaseUrl) {
			throw createError({
				message: "Bot API base URL is not configured",
				status: 500,
				why: "NUXT_PUBLIC_API_BASE_URL is missing",
				fix: "Set NUXT_PUBLIC_API_BASE_URL to the WolfStar bot API origin (e.g. https://api.wolfstar.rocks)",
			});
		}

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
