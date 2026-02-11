import type { User } from "#auth-utils";
import type { APIUser } from "discord-api-types/v10";
import { useFuse } from "@vueuse/integrations/useFuse";

/**
 * Search and filter options for useUser composable
 */
export interface UseUserSearchOptions {
	/**
	 * Search query for filtering guilds by name
	 */
	query?: Ref<string | null>;
	/**
	 * Filter to show only manageable guilds
	 */
	showManageableOnly?: Ref<boolean>;
	/**
	 * Sort order: true for ascending, false for descending
	 */
	sortAscending?: Ref<boolean>;
}

/**
 * Fetch options for useUser composable
 */
export interface UseUserOptions {
	/**
	 * Request timeout in milliseconds
	 */
	timeout?: number;
	/**
	 * Number of retry attempts on failure
	 */
	retry?: number;
	/**
	 * Delay between retry attempts in milliseconds
	 */
	retryDelay?: number;
	/**
	 * Optional search and filter options
	 */
	search?: UseUserSearchOptions;
}

export function useUser(user: MaybeRefOrGetter<User | null>, options?: UseUserOptions) {
	const cachedFetch = useCachedFetch();

	const cache = shallowRef<{
		user: APIUser | null | undefined;
		guilds: OauthFlattenedGuild[];
		total: number;
	} | null>(null);

	const isLoadingMore = shallowRef(false);

	const searchQuery = computed(() => options?.search?.query?.value ?? null);
	const showManageableOnly = computed(() => options?.search?.showManageableOnly?.value ?? false);
	const sortAscending = computed(() => options?.search?.sortAscending?.value ?? true);

	const asyncData = useLazyAsyncData(
		() => {
			const userValue = toValue(user);
			return userValue ? `user:${userValue.id}:data` : "user:anonymous:data";
		},
		async (_nuxtApp, { signal }) => {
			cache.value = null;

			const { search, ...fetchOptions } = options ?? {};
			const { data, isStale } = await cachedFetch<TransformedLoginData>("/api/users", { ...fetchOptions, signal });

			cache.value = {
				guilds: data.transformedGuilds || [],
				total: data.transformedGuilds?.length || 0,
				user: data.user,
			};

			return { ...data, isStale };
		},
	);

	async function fetchMore(targetSize: number): Promise<void> {
		if (isLoadingMore.value || !cache.value) {
			return;
		}

		if (cache.value.guilds.length >= targetSize) {
			return;
		}
		if (cache.value.guilds.length >= cache.value.total) {
			return;
		}

		isLoadingMore.value = true;

		try {
			const { search, ...fetchOptions } = options ?? {};
			const { data } = await cachedFetch<TransformedLoginData>("/api/users", {
				...fetchOptions,
			});

			if (!cache.value) {
				return;
			}

			const existingIds = new Set(cache.value.guilds.map((g) => g.id));
			const newGuilds = (data.transformedGuilds || []).filter((g) => !existingIds.has(g.id));

			cache.value = {
				...cache.value,
				guilds: [...cache.value.guilds, ...newGuilds],
				total: data.transformedGuilds?.length || 0,
			};
		} finally {
			isLoadingMore.value = false;
		}
	}

	const data = computed(() => {
		if (cache.value) {
			return {
				...cache.value.user,
				transformedGuilds: cache.value.guilds,
			};
		}
		return asyncData.data.value;
	});

	const guilds = computed(() => {
		if (cache.value) {
			return cache.value.guilds;
		}
		return data.value?.transformedGuilds ?? [];
	});

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

	const filteredGuilds = computed(() => {
		if (!options?.search) {
			return guilds.value;
		}

		const items = results.value.map((r) => r.item);
		return items.toSorted((a, b) => {
			// Manageable first
			if (a.manageable !== b.manageable) {
				return a.manageable ? -1 : 1;
			}
			// WolfStar presence
			if (a.wolfstarIsIn !== b.wolfstarIsIn) {
				return a.wolfstarIsIn ? -1 : 1;
			}
			// Alphabetical
			const comparison = a.name.localeCompare(b.name, "en", { sensitivity: "base" });
			return sortAscending.value ? comparison : -comparison;
		});
	});

	if (import.meta.client && asyncData.data.value?.isStale) {
		onMounted(() => {
			asyncData.refresh();
		});
	}

	const hasMore = computed(() => {
		if (!cache.value) {
			return true;
		}
		return cache.value.guilds.length < cache.value.total;
	});

	return {
		...asyncData,
		/** Reactive user data (uses cache) */
		data,
		/** Whether currently loading more guilds */
		isLoadingMore,
		/** Whether there are more guilds available */
		hasMore,
		/** Manually fetch more guilds up to target size */
		fetchMore,
		/** Filtered guilds (only when search options are provided) */
		filteredGuilds,
	};
}
