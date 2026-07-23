import type { CachedFetchFunction } from "#shared/utils/fetch-cache-config";

/**
 * Provides `$api` for the WolfStar bot API (`NUXT_PUBLIC_API_BASE_URL`).
 *
 * Matches the legacy dashboard `apiFetch` behavior: call the bot origin
 * directly with `credentials: "include"` so the browser sends the sapphire
 * `SAPPHIRE_AUTH` cookie established via `POST ${apiBaseUrl}/oauth/callback`.
 *
 * On the server, when a Discord session exists, a sapphire cookie is attached
 * so SSR can authorize without relying on the browser cookie.
 *
 * Crypto helpers live in `server/utils/botApi` and are loaded only inside the
 * `import.meta.server` branch so `node:crypto` never enters the client bundle.
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
				const headers: Record<string, string> = {
					"Content-Type": "application/json",
					...(options?.headers as Record<string, string> | undefined),
				};

				if (import.meta.server) {
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
