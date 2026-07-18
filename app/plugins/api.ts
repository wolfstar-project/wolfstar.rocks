import type { CachedFetchFunction } from "#shared/utils/fetch-cache-config";
import { getOptionalBotApiAuthHeaders } from "#shared/utils/botApi";

/**
 * Provides `$api` for the WolfStar bot API (`NUXT_PUBLIC_API_BASE_URL`),
 * matching the legacy dashboard `apiFetch` behavior: call the bot origin
 * directly with `credentials: "include"`.
 *
 * On the server, when a Discord session exists, a sapphire `SAPPHIRE_AUTH`
 * cookie is attached so SSR can authorize guild routes without relying on a
 * browser cookie set on the API domain. The cookie is encrypted with
 * `NUXT_OAUTH_DISCORD_CLIENT_SECRET` (same secret sapphire-plugin-api uses).
 *
 * `discord.clientSecret` is private runtime config — only read on the server.
 */
export default defineNuxtPlugin(() => {
	const cachedFetch = useCachedFetch();
	const runtimeConfig = useRuntimeConfig();
	const apiBaseUrl = runtimeConfig.public.apiBaseUrl;

	return {
		provide: {
			api: async <T>(
				url: Parameters<CachedFetchFunction>[0],
				options?: Parameters<CachedFetchFunction>[1],
				ttl?: Parameters<CachedFetchFunction>[2],
			) => {
				const headers: Record<string, string> = {
					"Content-Type": "application/json",
					...(options?.headers as Record<string, string> | undefined),
				};

				if (import.meta.server) {
					const event = useRequestEvent();
					const authorization = event?.context.$authorization;
					if (authorization) {
						const user = await authorization.resolveServerUser();
						const tokens = user ? await authorization.resolveServerTokens() : null;
						Object.assign(
							headers,
							getOptionalBotApiAuthHeaders({
								accessToken: tokens?.access_token,
								secret: runtimeConfig.discord?.clientSecret ?? "",
								userId: user?.id,
							}),
						);
					}
				}

				return cachedFetch<T>(
					url,
					{
						...options,
						baseURL: apiBaseUrl,
						credentials: "include",
						headers,
					},
					ttl,
				);
			},
		},
	};
});
