import { createError } from "evlog";

/**
 * Public proxy for supported WolfStar bot languages.
 * Fetches from the internal bot API (`NUXT_PUBLIC_API_BASE_URL`, e.g.
 * https://api.wolfstar.rocks).
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
