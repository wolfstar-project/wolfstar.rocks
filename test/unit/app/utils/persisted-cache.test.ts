import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	clearPersistedCache,
	readPersistedCache,
	writePersistedCache,
} from "~/utils/persisted-cache";

/** Just enough of the Storage interface for the cache, over a Map. */
function fakeStorage(options: { full?: boolean } = {}): Storage {
	const items = new Map<string, string>();
	return {
		get length() {
			return items.size;
		},
		clear: () => items.clear(),
		getItem: (key: string) => items.get(key) ?? null,
		key: (index: number) => [...items.keys()][index] ?? null,
		removeItem: (key: string) => void items.delete(key),
		setItem: (key: string, value: string) => {
			if (options.full) throw new DOMException("quota", "QuotaExceededError");
			items.set(key, value);
		},
	};
}

describe("persisted cache", () => {
	let store: Storage;

	beforeEach(() => {
		store = fakeStorage();
		vi.stubGlobal("localStorage", store);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("gives back what was written, under its own prefix", () => {
		writePersistedCache("guild:1:logs", { entries: [1, 2], total: 2 });

		expect(readPersistedCache("guild:1:logs")).toStrictEqual({ entries: [1, 2], total: 2 });
		expect(store.getItem("wolfstar-cache:guild:1:logs")).toContain('"at":');
		expect(readPersistedCache("guild:2:logs")).toBeUndefined();
	});

	it("forgets an answer older than a day, and one it cannot read", () => {
		const yesterday = Date.now() - 25 * 60 * 60 * 1000;
		writePersistedCache("old", { total: 1 }, yesterday);
		store.setItem("wolfstar-cache:broken", "{not json");

		expect(readPersistedCache("old")).toBeUndefined();
		expect(store.getItem("wolfstar-cache:old")).toBeNull();
		expect(readPersistedCache("broken")).toBeUndefined();
		expect(store.getItem("wolfstar-cache:broken")).toBeNull();
	});

	it("empties only its own keys", () => {
		writePersistedCache("a", 1);
		writePersistedCache("b", 2);
		store.setItem("wolfstar-settings", "{}");

		clearPersistedCache();

		expect(store.length).toBe(1);
		expect(store.getItem("wolfstar-settings")).toBe("{}");
	});

	it("does nothing when the browser refuses storage", () => {
		vi.stubGlobal("localStorage", fakeStorage({ full: true }));

		expect(() => writePersistedCache("a", 1)).not.toThrow();
		expect(readPersistedCache("a")).toBeUndefined();
	});
});
