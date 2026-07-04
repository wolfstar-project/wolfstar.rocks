import type { H3Event } from "h3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Characterization tests for the rate-limit reservation logic in
 * `defineWrappedResponseHandler` (plan 002).
 *
 * Findings under test:
 * 1. Reservations are read-modify-write without a critical section, so two
 *    concurrent requests can both reserve from the same state and overwrite
 *    each other's writes.
 * 2. Rollback after a handler error mutates the LATEST shared state, so it
 *    can remove another request's reservation instead of its own.
 *
 * Plan 005 must flip the `it.fails` invariants below into passing tests.
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

	it("currently lets two concurrent requests both reserve from the same fixed-window state (documented race)", async () => {
		const innerHandler = vi.fn().mockResolvedValue("ok");
		const handler = defineWrappedResponseHandler(innerHandler, {
			auth: true,
			rateLimit: { enabled: true, limit: 1, type: "fixed", window: 10_000 },
		});

		gate.hold = true;
		const first = handler(makeEvent());
		const second = handler(makeEvent());
		await flushMicrotasks();

		// Both requests have issued their storage read; release them together
		expect(gate.pending).toHaveLength(2);
		gate.hold = false;
		for (const release of gate.pending.splice(0)) {
			release();
		}

		const results = await Promise.allSettled([first, second]);

		// Race: with limit=1, both requests succeed because both read count=0
		expect(results.map((r) => r.status)).toEqual(["fulfilled", "fulfilled"]);
		expect(innerHandler).toHaveBeenCalledTimes(2);
		// The overwritten state records only one of the two reservations
		expect(storageState.get("rate-limiter-state:user-1")).toMatchObject({ count: 1 });
	});

	// INVARIANT (plan 005 must make this pass): concurrent requests must not
	// exceed the configured limit.
	it.fails("allows exactly `limit` concurrent requests through", async () => {
		const innerHandler = vi.fn().mockResolvedValue("ok");
		const handler = defineWrappedResponseHandler(innerHandler, {
			auth: true,
			rateLimit: { enabled: true, limit: 1, type: "fixed", window: 10_000 },
		});

		gate.hold = true;
		const first = handler(makeEvent());
		const second = handler(makeEvent());
		await flushMicrotasks();
		gate.hold = false;
		for (const release of gate.pending.splice(0)) {
			release();
		}

		const results = await Promise.allSettled([first, second]);
		const fulfilled = results.filter((r) => r.status === "fulfilled");

		expect(fulfilled).toHaveLength(1);
		expect(innerHandler).toHaveBeenCalledTimes(1);
	});

	it("currently rolls back another request's sliding-window reservation on handler error (documented bug)", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(1_000);

		let rejectFirst: (error: Error) => void = () => undefined;
		const firstHandlerDone = new Promise((_resolve, reject) => {
			rejectFirst = reject;
		});
		const innerHandler = vi
			.fn()
			// Request A blocks until we fail it after B completed
			.mockImplementationOnce(() => firstHandlerDone)
			// Request B succeeds immediately
			.mockResolvedValueOnce("ok");

		const handler = defineWrappedResponseHandler(innerHandler, {
			auth: true,
			rateLimit: { enabled: true, limit: 5, type: "sliding", window: 60_000 },
		});

		// Request A reserves timestamp 1000 and starts its (blocked) handler
		const first = handler(makeEvent());
		await flushMicrotasks();
		expect(storageState.get("rate-limiter-state:user-1")).toEqual({ timestamps: [1_000] });

		// Request B reserves timestamp 2000 and completes
		vi.setSystemTime(2_000);
		await handler(makeEvent());
		expect(storageState.get("rate-limiter-state:user-1")).toEqual({
			timestamps: [1_000, 2_000],
		});

		// Request A's handler now fails → rollback pops the LAST timestamp,
		// which belongs to request B, not to request A.
		rejectFirst(new Error("handler exploded"));
		await expect(first).rejects.toThrow("handler exploded");

		expect(storageState.get("rate-limiter-state:user-1")).toEqual({ timestamps: [1_000] });
	});

	// INVARIANT (plan 005 must make this pass): rollback must remove only the
	// failing request's own reservation.
	it.fails("rolls back only the failing request's own reservation", async () => {
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
	});
});
