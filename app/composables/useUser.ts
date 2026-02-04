import type { User } from "#auth-utils";
import type { APIUser } from "discord-api-types/v10";

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
}

export function useUser(
  user: MaybeRefOrGetter<User | null>,
  options?: UseUserOptions,
) {
  const cachedFetch = useCachedFetch();

  // Client-side cache
  const cache = shallowRef<{
    user: APIUser | null | undefined;
    guilds: OauthFlattenedGuild[];
    total: number;
  } | null>(null);

  const isLoadingMore = shallowRef(false);

  const asyncData = useLazyAsyncData(
    () => {
      const userValue = toValue(user);
      return userValue ? `user:${userValue.id}:data` : "user:anonymous:data";
    },
    async (_nuxtApp, { signal }) => {
      // Reset cache for new query
      cache.value = null;

      const { data, isStale } = await cachedFetch<TransformedLoginData>(
        "/api/users",
        { ...options, signal },
      );

      cache.value = {
        user: data.user,
        guilds: data.transformedGuilds || [],
        total: data.transformedGuilds?.length || 0,
      };

      return { ...data, isStale };
    },
  );

  // Fetch more guilds incrementally
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
      const { data } = await cachedFetch<TransformedLoginData>("/api/users", {
        ...options,
      });

      if (!cache.value) {
        return;
      }

      const existingIds = new Set(cache.value.guilds.map((g) => g.id));
      const newGuilds = (data.transformedGuilds || []).filter(
        (g) => !existingIds.has(g.id),
      );

      cache.value = {
        ...cache.value,
        guilds: [...cache.value.guilds, ...newGuilds],
        total: data.transformedGuilds?.length || 0,
      };
    }
    finally {
      isLoadingMore.value = false;
    }
  }

  // Computed data that uses cache
  const data = computed(() => {
    if (cache.value) {
      return {
        ...cache.value.user,
        transformedGuilds: cache.value.guilds,
      };
    }
    return asyncData.data.value;
  });

  if (import.meta.client && asyncData.data.value?.isStale) {
    onMounted(() => {
      asyncData.refresh();
    });
  }

  // Whether there are more guilds available
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
  };
}
