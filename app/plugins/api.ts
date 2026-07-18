import type { CachedFetchFunction } from "#shared/utils/fetch-cache-config";

/**
 * Provides `$api` for the internal WolfStar bot API (`NUXT_PUBLIC_API_BASE_URL`).
 *
 * - Server: calls the bot origin directly and attaches a sapphire `SAPPHIRE_AUTH`
 *   cookie when a Discord session is available.
 * - Client: cannot set cross-origin Cookie headers, so requests go through the
 *   same-origin BFF at `/api/bot/**` which injects auth server-side.
 */
export default defineNuxtPlugin(() => {
	const cachedFetch = useCachedFetch();
	const {
		public: { apiBaseUrl },
	} = useRuntimeConfig();

	return {
		provide: {
			api: async <T>(
				url: Parameters<CachedFetchFunction>[0],
				options?: Parameters<CachedFetchFunction>[1],
				ttl?: Parameters<CachedFetchFunction>[2],
			) => {
				if (import.meta.server) {
					const event = useRequestEvent();
					const authHeaders =
						event !== undefined
							? await (
									await import("#server/utils/bot-api")
								).getOptionalBotAuthHeaders(event)
							: {};

					return cachedFetch<T>(
						url,
						{
							...options,
							baseURL: apiBaseUrl,
							credentials: "include",
							headers: {
								"Content-Type": "application/json",
								...options?.headers,
								...authHeaders,
							},
						},
						ttl,
					);
				}

				return cachedFetch<T>(
					url,
					{
						...options,
						baseURL: "/api/bot",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
							...options?.headers,
						},
					},
					ttl,
				);
			},
		},
	};
});
