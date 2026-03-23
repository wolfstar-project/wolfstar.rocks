import type { User } from "#auth-utils";
import { useFuse } from "@vueuse/integrations/useFuse";

export interface UseUserSearchOptions {
	query?: Ref<string | null>;
	showManageableOnly?: Ref<boolean>;
	sortAscending?: Ref<boolean>;
}

export interface UseUserOptions {
	timeout?: number;
	retry?: number;
	retryDelay?: number;
	search?: UseUserSearchOptions;
}

export function useUser(user: MaybeRefOrGetter<User | null>, options?: UseUserOptions) {
	const cachedFetch = useCachedFetch();

	const searchQuery = computed(() => options?.search?.query?.value ?? null);
	const showManageableOnly = computed(() => options?.search?.showManageableOnly?.value ?? false);
	const sortAscending = computed(() => options?.search?.sortAscending?.value ?? true);

	const asyncData = useLazyAsyncData(
		() => {
			const userValue = toValue(user);
			return userValue ? `user:${userValue.id}:data` : "user:anonymous:data";
		},
		async (_nuxtApp, { signal }) => {
			const { search, ...fetchOptions } = options ?? {};
			const { data, isStale } = await cachedFetch<TransformedLoginData>("/api/users", {
				...fetchOptions,
				signal,
			});

			return { ...data, isStale };
		},
	);

	const data = computed(() => asyncData.data.value ?? null);

	const guilds = computed(() => data.value?.transformedGuilds ?? []);

	const manageableGuilds = computed(() => {
		if (!showManageableOnly.value) {
			return guilds.value;
		}
		return guilds.value.filter((guild) => guild.manageable);
	});

	const searchValue = computed(() => searchQuery.value ?? "");

	const { results } = useFuse(searchValue, manageableGuilds, {
		fuseOptions: {
			keys: ["name"],
			threshold: 0.3,
		},
		matchAllWhenSearchEmpty: true,
	});

	function sortGuilds(items: OauthFlattenedGuild[]): OauthFlattenedGuild[] {
		return items.toSorted((a, b) => {
			if (a.manageable !== b.manageable) {
				return a.manageable ? -1 : 1;
			}
			if (a.wolfstarIsIn !== b.wolfstarIsIn) {
				return a.wolfstarIsIn ? -1 : 1;
			}
			const comparison = a.name.localeCompare(b.name, "en", { sensitivity: "base" });
			return sortAscending.value ? comparison : -comparison;
		});
	}

	const filteredGuilds = computed(() => {
		const items = results.value.map((r) => r.item);
		return sortGuilds(items);
	});

	if (import.meta.client && asyncData.data.value?.isStale) {
		onMounted(() => {
			asyncData.refresh();
		});
	}

	return {
		...asyncData,
		data,
		guilds,
		filteredGuilds,
	};
}
