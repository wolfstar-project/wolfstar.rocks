import type { AsyncDataHandlerContext, NuxtApp } from "#app";
import type { WatchSource } from "vue";

type Handler<T> = (nuxtApp: NuxtApp, context: AsyncDataHandlerContext) => Promise<T>;

interface PersistedAsyncDataOptions<DefaultT> {
	/** What `data` holds before the first answer. */
	default?: () => DefaultT;
	immediate?: boolean;
	watch?: (WatchSource<unknown> | object)[];
}

let testAccount: string | null = null;

/**
 * The keys being fetched again behind a kept answer, for each app. Every caller
 * of a key finds that answer; if each queued its own fetch, one page load would
 * make a request per caller (the account's list is read in half a dozen places)
 * and run into the API's rate limit, two requests in five seconds.
 */
const refreshingBehind = new WeakMap<NuxtApp, Set<string>>();

/** Takes the right to fetch `dataKey` again behind its kept answer, or `null` if it is taken. */
function claimRefreshBehind(nuxt: NuxtApp, dataKey: string): (() => void) | null {
	let keys = refreshingBehind.get(nuxt);
	if (!keys) {
		keys = new Set();
		refreshingBehind.set(nuxt, keys);
	}
	if (keys.has(dataKey)) return null;
	keys.add(dataKey);
	const claimed = keys;
	return () => void claimed.delete(dataKey);
}

/**
 * The browser's store is left alone under test, where every file shares one
 * localStorage and the session cannot be mocked; the composable's own tests
 * switch it on, under an account of their choosing.
 */
export function enablePersistedCacheInTests(account = "test-account") {
	if (import.meta.test) testAccount = account;
}

/**
 * `useLazyAsyncData` whose answers outlive the page: each one is kept in the
 * browser (`persisted-cache.ts`) under the signed-in account, so a reload or
 * a return to a section shows what was there last time at once, and fetches
 * again behind it. Refreshing by hand always fetches.
 */
export function usePersistedAsyncData<T, DefaultT = undefined>(
	key: () => string,
	handler: Handler<T>,
	options: PersistedAsyncDataOptions<DefaultT> = {},
) {
	const { user } = useUserSession();
	const canPersist = import.meta.client && (!import.meta.test || testAccount !== null);

	// An account's answers are its own: a guest keeps nothing.
	function storageKey(dataKey: string): string | null {
		const id = testAccount ?? user.value?.id;
		return canPersist && id ? `${id}:${dataKey}` : null;
	}

	let refreshBehind: (() => Promise<void>) | undefined;

	const asyncData = useLazyAsyncData(key, handler, {
		...options,
		server: false,
		getCachedData(dataKey, nuxt, { cause }) {
			if (cause === "refresh:manual" || cause === "refresh:hook") return undefined;
			const held = (
				nuxt.isHydrating ? nuxt.payload.data[dataKey] : nuxt.static.data[dataKey]
			) as T | undefined;
			if (held !== undefined) return held;
			const stored = storageKey(dataKey);
			const answer = stored === null ? undefined : readPersistedCache<T>(stored);
			// Nuxt takes this as the answer and asks no further; the fetch is
			// queued here, once `asyncData` exists, to replace it behind the scenes.
			if (answer !== undefined) {
				const release = claimRefreshBehind(nuxt, dataKey);
				if (release) {
					void nextTick(async () => {
						try {
							await refreshBehind?.();
						} finally {
							release();
						}
					});
				}
			}
			return answer;
		},
	});
	refreshBehind = () => asyncData.refresh();

	// Only an answer the server gave is kept; the default a key change resets
	// `data` to is not one.
	watch(asyncData.data, (value) => {
		if (value === undefined || value === null || asyncData.status.value !== "success") return;
		const stored = storageKey(key());
		if (stored !== null) writePersistedCache(stored, value);
	});

	return asyncData;
}
