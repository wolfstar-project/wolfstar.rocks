export interface ApiComposableOptions {
	immediate?: boolean;
}

/**
 * Lazy-fetch composable for same-origin dashboard API routes (e.g. `/api/commands`).
 * Uses the request-scoped fetch cache on SSR and plain `$fetch` on the client.
 */
export function createApiComposable<T>(
	key: string,
	endpoint: string,
	defaultValue: T,
	options?: ApiComposableOptions,
) {
	const cachedFetch = useCachedFetch();

	const asyncData = useLazyAsyncData(
		key,
		async () => {
			const { data, isStale } = await cachedFetch<T>(endpoint);
			return { data, isStale };
		},
		{ immediate: options?.immediate !== false },
	);

	const data = computed(() => asyncData.data.value?.data ?? defaultValue);

	// SWR-style hydration refresh: during SSR hydration, asyncData.data is already
	// populated so isStale can be checked synchronously. If stale, schedule a
	// refresh in onMounted to update the cache after hydration completes.
	if (import.meta.client && asyncData.data.value?.isStale) {
		onMounted(() => {
			asyncData.refresh();
		});
	}

	return {
		...asyncData,
		data,
	};
}
