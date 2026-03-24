export interface UseLanguagesOptions {
	immediate?: boolean;
}

export function useLanguages(options?: UseLanguagesOptions) {
	const { $api } = useNuxtApp();

	const asyncData = useLazyAsyncData(
		"wolfstar:languages",
		async () => {
			const { data, isStale } = await $api<string[]>("/languages");
			return { languages: data, isStale };
		},
		{ immediate: options?.immediate !== false },
	);

	const data = computed(() => asyncData.data.value?.languages ?? []);

	// SWR-style hydration refresh: during SSR hydration, asyncData.data is already
	// populated so isStale can be checked synchronously. If stale, schedule a
	// refresh in onMounted to update the cache after hydration completes. This block
	// is a no-op for client-side navigations where asyncData.data isn't populated yet.
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
