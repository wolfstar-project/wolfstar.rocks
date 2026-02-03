import type { User } from "#auth-utils";

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
  // Get cachedFetch in setup context
  const cachedFetch = useCachedFetch();

  return useLazyAsyncData(
    () => {
      const userValue = toValue(user);
      // Handle null user gracefully by returning a fallback key
      return userValue ? `user:${userValue.id}:data` : "user:anonymous:data";
    },
    // Use it inside the handler - destructure { data } or { data, isStale }
    async () => {
      const { data } = await cachedFetch("/api/users", options);
      return data;
    },
  );
}
