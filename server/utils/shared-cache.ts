/**
 * A value kept in the `cache` storage for every isolate of the Worker to read,
 * with the time it was taken from its source. Its reader decides from that
 * time whether it is still fresh, so a copy that Workers KV serves late (it
 * keeps a read for up to a minute in each location) is still judged by its
 * real age.
 */
export interface SharedCacheEntry<T> {
	at: number;
	value: T;
}

const SHARED_CACHE_STORAGE = "cache";
/** Workers KV refuses an expiration shorter than a minute. */
const MIN_TTL_SECONDS = 60;

/**
 * Whether the memory of this process is shared by too few requests to be a
 * cache worth having alone: on Cloudflare Workers a guild's requests land on
 * many isolates, so a copy they all read is kept in the `cache` storage
 * (Workers KV) too.
 */
export function usesSharedCache(): boolean {
	return globalThis.navigator?.userAgent === "Cloudflare-Workers";
}

/**
 * Reads an entry of the shared cache, or `null` when there is none, it is
 * older than `maxAgeMs`, or the storage fails: a cache that cannot be read is
 * a miss, never an error of the request.
 */
export async function readSharedCache<T>(
	key: string,
	maxAgeMs: number,
): Promise<SharedCacheEntry<T> | null> {
	try {
		const entry = await useStorage(SHARED_CACHE_STORAGE).getItem<SharedCacheEntry<T>>(key);
		if (entry === null || typeof entry !== "object" || typeof entry.at !== "number") {
			return null;
		}
		const age = Date.now() - entry.at;
		return age >= 0 && age < maxAgeMs ? entry : null;
	} catch {
		return null;
	}
}

/**
 * Writes an entry of the shared cache behind the answer: the write is handed
 * to the request's `waitUntil`, so the response does not wait on Workers KV,
 * and a failed write (KV takes one write a second for a key) is dropped.
 */
export function writeSharedCache<T>(key: string, entry: SharedCacheEntry<T>, maxAgeMs: number) {
	const ttl = Math.max(MIN_TTL_SECONDS, Math.ceil(maxAgeMs / 1000));
	let write: Promise<unknown>;
	try {
		write = useStorage(SHARED_CACHE_STORAGE)
			.setItem(key, entry, { ttl })
			.catch(() => undefined);
	} catch {
		return;
	}
	keepAlive(write);
}

function keepAlive(promise: Promise<unknown>) {
	try {
		useEvent().waitUntil?.(promise);
	} catch {
		// Outside a request (or a unit test) there is no event to keep it alive:
		// the write runs on its own.
	}
}
