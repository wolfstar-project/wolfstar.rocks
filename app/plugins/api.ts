import type { CachedFetchFunction } from "#shared/utils/fetch-cache-config";

/**
 * Provides `$api` for the WolfStar bot API (`NUXT_PUBLIC_API_BASE_URL`).
 *
 * Auth is client-only against the bot's Better Auth server, so the browser
 * sends session cookies with `credentials: "include"`. SSR does not hydrate
 * a local auth session — authenticated data is fetched on the client.
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
				return cachedFetch<T>(
					url,
					{
						...options,
						baseURL: apiBaseUrl,
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
