export default defineNuxtPlugin(() => {
	const cachedFetch = useCachedFetch();
	const runtimeConfig = useRuntimeConfig();
	const apiBaseUrl = runtimeConfig.public.apiBaseUrl;

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
