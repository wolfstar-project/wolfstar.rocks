import type { CachedFetchFunction } from "#shared/utils/fetch-cache-config";

/**
 * Provides `$api` for the WolfStar bot API (`NUXT_PUBLIC_API_BASE_URL`).
 *
 * - Server: calls the bot origin directly and attaches a sapphire `SAPPHIRE_AUTH`
 *   cookie when a Discord session is available.
 * - Client: cannot set cross-origin Cookie headers, so requests go through the
 *   same-origin BFF at `/api/**` which injects auth server-side.
 *
 * Crypto helpers live in `server/utils/botApi` and are loaded only inside the
 * `import.meta.server` branch so `node:crypto` never enters the client bundle.
 * Private `discord.clientSecret` is also read only on the server.
 */
export default defineNuxtPlugin(() => {
	const cachedFetch = useCachedFetch();
	const runtimeConfig = useRuntimeConfig();
	// Browser Nuxt tests cannot reach the external bot API; use same-origin so
	// `registerEndpoint` can mock `$api` paths. `process.test` is defined in
	// the vitest nuxt project (`vite.config.ts`).
	const apiBaseUrl = process.test ? "/" : runtimeConfig.public.apiBaseUrl;

	return {
		provide: {
			api: async <T>(
				url: Parameters<CachedFetchFunction>[0],
				options?: Parameters<CachedFetchFunction>[1],
				ttl?: Parameters<CachedFetchFunction>[2],
			) => {
				if (import.meta.server) {
					const headers: Record<string, string> = {
						"Content-Type": "application/json",
						...(options?.headers as Record<string, string> | undefined),
					};

					const event = useRequestEvent();
					const authorization = event?.context.$authorization;
					if (authorization) {
						const [{ getOptionalBotApiAuthHeaders }, user] = await Promise.all([
							import("~~/server/utils/botApi"),
							authorization.resolveServerUser(),
						]);
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
				}

				return cachedFetch<T>(
					url,
					{
						...options,
						// Client BFF injects SAPPHIRE_AUTH; process.test stays same-origin for mocks.
						baseURL: process.test ? "/" : "/api",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
							...(options?.headers as Record<string, string> | undefined),
						},
					},
					ttl,
				);
			},
		},
	};
});
