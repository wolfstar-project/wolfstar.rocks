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

/**
 * Adapts a Nitro/unstorage mount to better-auth's `SecondaryStorage` shape,
 * including an atomic-ish `increment` so better-auth's rate limiter can use
 * its single-step `consume` path instead of the non-atomic get-then-set
 * fallback, and the `getAndDelete` better-auth 1.7 requires for single-use
 * verification values.
 */
export function createAuthSecondaryStorage(storage: AuthRateLimitStorageDriver): SecondaryStorage {
	// In-process keyed mutex serializing the read-modify-write cycles of
	// increment() and getAndDelete() per storage key, mirroring
	// server/utils/wrappedEventHandler.ts. The production driver (Cloudflare KV
	// over HTTP) exposes no atomic increment or get-and-delete primitive, so
	// this only bounds races to a single server instance; cross-instance races
	// remain possible and are an accepted limitation of the storage backend.
	const keyLocks = new Collection<string, AsyncQueue>();

	async function withKeyLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
		const queue = keyLocks.ensure(key, () => new AsyncQueue());
		await queue.wait();
		try {
			return await fn();
		} finally {
			queue.shift();
			if (queue.remaining === 0) {
				keyLocks.delete(key);
			}
		}
	}

	return {
		get: (key) => storage.getItem(key),
		set: (key, value) => storage.setItem(key, value),
		delete: (key) => storage.removeItem(key),
		// better-auth consumes single-use verification values through this, so
		// the read and the removal must not be observable as two separate steps.
		getAndDelete: (key) =>
			withKeyLock(key, async () => {
				const value = await storage.getItem(key);
				if (value !== null) {
					await storage.removeItem(key);
				}
				return value;
			}),
		// Fixed-window counter: `ttl` (seconds) is only applied when the window
		// is (re)created, and every write re-derives the remaining time until
		// that same expiry so later increments never push the window further out.
		increment: (key, ttl) =>
			withKeyLock(key, async () => {
				const now = Date.now();
				const existing = await storage.getItem<AuthRateLimitCounter>(key);
				const isFresh = !existing || existing.expiresAt <= now;
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
