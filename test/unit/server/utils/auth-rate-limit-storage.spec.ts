import { createAuthSecondaryStorage } from "#server/utils/auth-rate-limit-storage";
import { beforeEach, describe, expect, it } from "vitest";

/**
 * `increment()` backs better-auth's atomic `consume` path (see
 * server/auth.config.ts). Without it, better-auth falls back to a
 * non-atomic get-then-set check that logs:
 * "Rate limiting is best-effort: the configured storage has no atomic
 * consume...".
 *
 * Invariants:
 * 1. Counts increment within a fixed window and reset once it expires.
 * 2. The window's expiry is fixed at creation; later increments never push
 *    it further out.
 * 3. Concurrent increments for the same key are serialized by an in-process
 *    keyed mutex, so none are lost to a stale read.
 */

function createFakeStorage() {
	const state = new Map<string, { value: unknown; ttl?: number }>();
	return {
		state,
		storage: {
			getItem: async (key: string) => state.get(key)?.value ?? null,
			setItem: async (key: string, value: unknown, opts?: { ttl?: number }) => {
				state.set(key, { value, ttl: opts?.ttl });
			},
			removeItem: async (key: string) => {
				state.delete(key);
			},
		},
	};
}

describe("createAuthSecondaryStorage", () => {
	let fake: ReturnType<typeof createFakeStorage>;
	let secondaryStorage: ReturnType<typeof createAuthSecondaryStorage>;

	beforeEach(() => {
		fake = createFakeStorage();
		secondaryStorage = createAuthSecondaryStorage(fake.storage);
	});

	it("starts a fresh window at count 1", async () => {
		const count = await secondaryStorage.increment?.("key", 60);
		expect(count).toBe(1);
	});

	it("increments the count within the same window", async () => {
		await secondaryStorage.increment?.("key", 60);
		await secondaryStorage.increment?.("key", 60);
		const count = await secondaryStorage.increment?.("key", 60);
		expect(count).toBe(3);
	});

	it("does not extend the window's expiry on later increments", async () => {
		await secondaryStorage.increment?.("key", 60);
		const firstEntry = fake.state.get("key")?.value as { expiresAt: number } | undefined;

		await secondaryStorage.increment?.("key", 60);
		const secondEntry = fake.state.get("key")?.value as { expiresAt: number } | undefined;

		expect(secondEntry?.expiresAt).toBe(firstEntry?.expiresAt);
	});

	it("resets the count once the window has expired", async () => {
		await secondaryStorage.increment?.("key", 60);
		// Force the stored window into the past so the next increment sees it as expired
		const entry = fake.state.get("key");
		const value = entry?.value as { count: number; expiresAt: number };
		fake.state.set("key", { value: { ...value, expiresAt: Date.now() - 1 } });

		const count = await secondaryStorage.increment?.("key", 60);
		expect(count).toBe(1);
	});

	it("treats corrupt counters without expiresAt as a fresh window", async () => {
		fake.state.set("key", { value: { count: 159 } });

		const count = await secondaryStorage.increment?.("key", 60);
		expect(count).toBe(1);
		expect(fake.state.get("key")?.value).toMatchObject({
			count: 1,
			expiresAt: expect.any(Number),
		});
	});

	it("serializes concurrent increments for the same key", async () => {
		const results = await Promise.all(
			Array.from({ length: 10 }, () => secondaryStorage.increment?.("key", 60)),
		);

		expect(new Set(results).size).toBe(10);
		expect(Math.max(...results.map((r) => r ?? 0))).toBe(10);
	});

	it("keeps counters for different keys independent", async () => {
		const a = await secondaryStorage.increment?.("key-a", 60);
		const b = await secondaryStorage.increment?.("key-b", 60);
		expect(a).toBe(1);
		expect(b).toBe(1);
	});

	it("still supports get/set/delete for non-consume storage reads", async () => {
		await secondaryStorage.set("plain-key", "plain-value");
		expect(await secondaryStorage.get("plain-key")).toBe("plain-value");

		await secondaryStorage.delete("plain-key");
		expect(await secondaryStorage.get("plain-key")).toBeNull();
	});
});
