import type { H3Event } from "h3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Rate-limit reservation tests for `defineWrappedResponseHandler`
 * (plans 002 + 005).
 *
 * Invariants:
 * 1. Reservations happen inside a per-key critical section, so concurrent
 *    requests in the same instance cannot reserve from stale shared state.
 * 2. Rollback after a handler error removes only the failing request's own
 *    reservation (identified by a reservation token).
 *
 * The critical section is an in-process keyed mutex: the production storage
 * driver (Cloudflare KV over HTTP) has no atomic primitive, so cross-instance
 * races remain a documented limitation.
 */

const { storageState, gate, mockRequireUserSession } = vi.hoisted(() => {
	const storageState = new Map<string, unknown>();

	// Gate lets tests pause storage reads so two requests interleave
	// deterministically: both read before either writes.
	const gate: { pending: (() => void)[]; hold: boolean } = { pending: [], hold: false };

	const mockRequireUserSession = vi.fn();

	const g = globalThis as Record<string, unknown>;
	g.useStorage = () => ({
		getItem: (key: string) =>
			new Promise((resolve) => {
				const finish = () => resolve(storageState.get(key) ?? null);
				if (gate.hold) {
					gate.pending.push(finish);
				} else {
					finish();
				}
			}),
		setItem: async (key: string, value: unknown) => {
			storageState.set(key, value);
		},
	});
	g.requireUserSession = mockRequireUserSession;
	g.getRequestIP = () => "203.0.113.10";
	g.getRequestURL = () => new URL("http://localhost/api/test");
	g.setResponseHeader = vi.fn();
	g.defineEventHandler = (fn: unknown) => fn;
	g.cachedEventHandler = (fn: unknown) => fn;
	g.omit = <T extends object>(keys: (keyof T)[], obj: T) => {
		const clone = { ...obj };
		for (const key of keys) {
			delete clone[key];
		}
		return clone;
	};

	return { storageState, gate, mockRequireUserSession };
});

vi.mock("evlog", () => ({
	useLogger: vi.fn().mockReturnValue({
		set: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	}),
	createError: vi.fn((opts: Record<string, unknown>) =>
		Object.assign(new Error(String(opts["message"])), opts),
	),
}));

vi.mock("@sentry/nuxt", () => ({
	metrics: { count: vi.fn() },
	getActiveSpan: vi.fn(() => undefined),
}));

vi.mock("#server/utils/sentry-metrics", () => ({
	instrumentCacheGet: vi.fn((_key: string, fn: () => unknown) => fn()),
	instrumentCachePut: vi.fn((_key: string, fn: () => unknown) => fn()),
	withApiMetrics: vi.fn((_event: unknown, fn: () => unknown) => fn()),
}));

// The real module pulls in Nitro's storage runtime (`#nitro-internal-virtual/storage`),
// which is unavailable outside a Nitro build; stub the outdated-client check so the
// wrapper imports cleanly and stays a no-op for these rate-limit ordering tests.
vi.mock("nuxt-skew-protection/server", () => ({
	isClientOutdated: vi.fn(() => false),
}));

import { defineWrappedResponseHandler } from "#server/utils/wrappedEventHandler";

function makeEvent(): H3Event {
	return {
		node: { req: { method: "GET", socket: {} } },
		headers: new Headers(),
	} as unknown as H3Event;
}

async function flushMicrotasks(times = 20) {
	for (let i = 0; i < times; i++) {
		await Promise.resolve();
	}
}

describe("rate-limit reservations under concurrency", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		storageState.clear();
		gate.pending = [];
		gate.hold = false;
		mockRequireUserSession.mockResolvedValue({ user: { id: "user-1" } });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("allows exactly `limit` concurrent requests through", async () => {
		const innerHandler = vi.fn().mockResolvedValue("ok");
		const handler = defineWrappedResponseHandler(innerHandler, {
			auth: true,
			rateLimit: { enabled: true, limit: 1, type: "fixed", window: 10_000 },
		});

		gate.hold = true;
		const first = handler(makeEvent());
		const second = handler(makeEvent());
		await flushMicrotasks();

		// The keyed mutex serializes the reservations: only the first request's
		// storage read is in flight; the second waits for the lock
		expect(gate.pending).toHaveLength(1);
		gate.hold = false;
		while (gate.pending.length > 0) {
			for (const release of gate.pending.splice(0)) {
				release();
			}
			await flushMicrotasks();
		}

		const results = await Promise.allSettled([first, second]);
		const fulfilled = results.filter((r) => r.status === "fulfilled");
		const rejected = results.filter((r) => r.status === "rejected");

		expect(fulfilled).toHaveLength(1);
		expect(rejected).toHaveLength(1);
		expect(innerHandler).toHaveBeenCalledTimes(1);
		expect(storageState.get("rate-limiter-state:user-1")).toMatchObject({ count: 1 });
	});

	it("rolls back only the failing request's own reservation", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(1_000);

		let rejectFirst: (error: Error) => void = () => undefined;
		const firstHandlerDone = new Promise((_resolve, reject) => {
			rejectFirst = reject;
		});
		const innerHandler = vi
			.fn()
			.mockImplementationOnce(() => firstHandlerDone)
			.mockResolvedValueOnce("ok");

		const handler = defineWrappedResponseHandler(innerHandler, {
			auth: true,
			rateLimit: { enabled: true, limit: 5, type: "sliding", window: 60_000 },
		});

		const first = handler(makeEvent());
		await flushMicrotasks();

		vi.setSystemTime(2_000);
		await handler(makeEvent());

		rejectFirst(new Error("handler exploded"));
		await expect(first).rejects.toThrow("handler exploded");

		// Request A (t=1000) failed and must be the one removed; request B's
		// successful reservation (t=2000) must survive.
		expect(storageState.get("rate-limiter-state:user-1")).toEqual({ timestamps: [2_000] });
	});

	it("does not rate limit when disabled", async () => {
		const innerHandler = vi.fn().mockResolvedValue("ok");
		const handler = defineWrappedResponseHandler(innerHandler, {
			auth: false,
			rateLimit: { enabled: false },
		});

		for (let i = 0; i < 10; i++) {
			await handler(makeEvent());
		}

		expect(innerHandler).toHaveBeenCalledTimes(10);
		// Disabled rate limiting must not pay a storage round trip
		expect(storageState.size).toBe(0);
	});

	it("resets the fixed window after it expires", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(1_000);

		const innerHandler = vi.fn().mockResolvedValue("ok");
		const handler = defineWrappedResponseHandler(innerHandler, {
			auth: true,
			rateLimit: { enabled: true, limit: 1, type: "fixed", window: 10_000 },
		});

		await handler(makeEvent());
		await expect(handler(makeEvent())).rejects.toThrow("Too Many Requests");

		vi.setSystemTime(12_001);
		await expect(handler(makeEvent())).resolves.toBe("ok");
		expect(innerHandler).toHaveBeenCalledTimes(2);
	});

	it("fails open when the rate-limit storage cannot be read", async () => {
		const innerHandler = vi.fn().mockResolvedValue("ok");
		const handler = defineWrappedResponseHandler(innerHandler, {
			auth: true,
			rateLimit: { enabled: true, limit: 1, type: "fixed", window: 10_000 },
		});

		const g = globalThis as Record<string, unknown>;
		const originalUseStorage = g.useStorage;
		g.useStorage = () => ({
			getItem: async () => {
				throw new Error("KV unavailable");
			},
			setItem: async () => {
				throw new Error("KV unavailable");
			},
		});

		try {
			// The wrapper module captured its storage at import time, so patching
			// useStorage here is not enough — drive the failure through the shared
			// instrumented mocks instead.
			const sentryMetrics = await import("#server/utils/sentry-metrics");
			vi.mocked(sentryMetrics.instrumentCacheGet).mockRejectedValueOnce(
				new Error("KV unavailable"),
			);

			await expect(handler(makeEvent())).resolves.toBe("ok");
			expect(innerHandler).toHaveBeenCalledTimes(1);
		} finally {
			g.useStorage = originalUseStorage;
		}
	});
});
