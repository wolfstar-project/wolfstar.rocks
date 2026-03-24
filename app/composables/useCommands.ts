export interface UseCommandsOptions {
	immediate?: boolean;
}

export function useCommands(options?: UseCommandsOptions) {
	const { $api } = useNuxtApp();

	const asyncData = useLazyAsyncData(
		"wolfstar:commands",
		async () => {
			const { data, isStale } = await $api<FlattenedCommand[]>("/commands");
			return { commands: data, isStale };
		},
		{ immediate: options?.immediate !== false },
	);

	const data = computed(() => asyncData.data.value?.commands ?? []);

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
