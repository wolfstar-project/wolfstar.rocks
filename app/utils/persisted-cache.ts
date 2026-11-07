/**
 * The dashboard's answers, kept in this browser's localStorage so a reload, or
 * a return to a section, shows what was there last time at once while it is
 * asked for again. `usePersistedAsyncData()` reads and writes it; the plugin
 * `persisted-cache.client.ts` empties it when the account changes.
 */
const PREFIX = "wolfstar-cache:";

/** An answer older than this is not shown again, not even while it is refreshed. */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface StoredEntry<T> {
	at: number;
	data: T;
}

// A browser can refuse localStorage altogether (private windows, blocked storage).
function storage(): Storage | null {
	try {
		return globalThis.localStorage ?? null;
	} catch {
		return null;
	}
}

export function readPersistedCache<T>(key: string, now = Date.now()): T | undefined {
	const store = storage();
	if (!store) return undefined;
	const raw = store.getItem(PREFIX + key);
	if (raw === null) return undefined;
	try {
		const entry = JSON.parse(raw) as Partial<StoredEntry<T>>;
		if (typeof entry.at !== "number" || now - entry.at > MAX_AGE_MS) {
			store.removeItem(PREFIX + key);
			return undefined;
		}
		return entry.data;
	} catch {
		store.removeItem(PREFIX + key);
		return undefined;
	}
}

export function writePersistedCache(key: string, data: unknown, now = Date.now()): void {
	const store = storage();
	if (!store) return;
	const value = JSON.stringify({ at: now, data } satisfies StoredEntry<unknown>);
	try {
		store.setItem(PREFIX + key, value);
	} catch {
		// Out of room: the answers kept so far make way for this one.
		clearPersistedCache();
		try {
			store.setItem(PREFIX + key, value);
		} catch {
			// The browser refuses to keep anything; the next reload fetches.
		}
	}
}

export function clearPersistedCache(): void {
	const store = storage();
	if (!store) return;
	for (let index = store.length - 1; index >= 0; index -= 1) {
		const key = store.key(index);
		if (key?.startsWith(PREFIX)) store.removeItem(key);
	}
}
