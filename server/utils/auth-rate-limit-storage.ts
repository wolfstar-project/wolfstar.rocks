import type { SecondaryStorage } from "better-auth";
import { Collection } from "@discordjs/collection";
import { AsyncQueue } from "@sapphire/async-queue";

interface AuthRateLimitCounter {
	count: number;
	expiresAt: number;
}

/** The subset of unstorage's `Storage` interface this adapter relies on. */
export interface AuthRateLimitStorageDriver {
	getItem: <T>(key: string) => Promise<T | null>;
	setItem: <T>(key: string, value: T, opts?: { ttl?: number }) => Promise<void>;
	removeItem: (key: string) => Promise<void>;
}

function isUsableCounter(value: unknown): value is AuthRateLimitCounter {
	if (!value || typeof value !== "object") {
		return false;
	}
	const candidate = value as Partial<AuthRateLimitCounter>;
	return (
		typeof candidate.count === "number" &&
		Number.isFinite(candidate.count) &&
		typeof candidate.expiresAt === "number" &&
		Number.isFinite(candidate.expiresAt)
	);
}

/**
 * Adapts a Nitro/unstorage mount to better-auth's `SecondaryStorage` shape,
 * including an atomic-ish `increment` so better-auth's rate limiter can use
 * its single-step `consume` path instead of the non-atomic get-then-set
 * fallback.
 */
export function createAuthSecondaryStorage(storage: AuthRateLimitStorageDriver): SecondaryStorage {
	// In-process keyed mutex serializing increment() read-modify-write cycles
	// per storage key, mirroring server/utils/wrappedEventHandler.ts. The
	// production driver (Cloudflare KV over HTTP) exposes no atomic increment
	// primitive, so this only bounds races to a single server instance;
	// cross-instance races remain possible and are an accepted limitation of
	// the storage backend.
	const incrementKeyLocks = new Collection<string, AsyncQueue>();

	async function withIncrementLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
		const queue = incrementKeyLocks.ensure(key, () => new AsyncQueue());
		await queue.wait();
		try {
			return await fn();
		} finally {
			queue.shift();
			if (queue.remaining === 0) {
				incrementKeyLocks.delete(key);
			}
		}
	}

	return {
		get: (key) => storage.getItem(key),
		set: (key, value, ttl) =>
			storage.setItem(key, value, typeof ttl === "number" ? { ttl } : undefined),
		delete: (key) => storage.removeItem(key),
		// Fixed-window counter: `ttl` (seconds) is only applied when the window
		// is (re)created, and every write re-derives the remaining time until
		// that same expiry so later increments never push the window further out.
		increment: (key, ttl) =>
			withIncrementLock(key, async () => {
				const now = Date.now();
				const existing = await storage.getItem<unknown>(key);
				// Missing/corrupt counters (e.g. `{ count }` without expiresAt) must
				// start a fresh window — otherwise the count grows forever and
				// Better Auth permanently 429s endpoints like /get-session.
				const isFresh = !isUsableCounter(existing) || existing.expiresAt <= now;
				const expiresAt = isFresh ? now + ttl * 1000 : existing.expiresAt;
				const count = isFresh ? 1 : existing.count + 1;
				const remainingTtl = Math.max(1, Math.ceil((expiresAt - now) / 1000));
				await storage.setItem<AuthRateLimitCounter>(
					key,
					{ count, expiresAt },
					{ ttl: remainingTtl },
				);
				return count;
			}),
	};
}
