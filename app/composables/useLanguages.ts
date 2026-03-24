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
