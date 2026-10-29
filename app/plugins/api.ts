export default defineNuxtPlugin(() => {
	const cachedFetch = useCachedFetch();
	const runtimeConfig = useRuntimeConfig();
	// A browser on the dev server reaches the bot API through Nitro's
	// `devProxy` (`nuxt.config.ts`), which keeps the request same-origin.
	const apiBaseUrl =
		import.meta.dev && import.meta.client ? "/__bot-api" : runtimeConfig.public.apiBaseUrl;

	return {
		provide: {
			api: <T>(
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
						headers: { "Content-Type": "application/json", ...options?.headers },
					},
					ttl,
				);
			},
		},
	};
});
