import type { H3Event } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Characterization tests for `defineWrappedCachedResponseHandler` (plan 002).
 *
 * These tests drive the REAL wrapper from `server/utils/wrappedEventHandler.ts`
 * with a deterministic fake `cachedEventHandler` that mimics Nitro's cache:
 * a warm key returns the stored response WITHOUT invoking the resolver.
 *
 * Finding under test: the wrapper places authentication (and rate limiting)
 * inside the cached resolver, so warm cache hits skip `requireUserSession`
 * entirely. Plan 004 must flip the `it.fails` invariants below into passing
 * tests by running the guards before cache resolution.
 */

const {
	cacheStore,
	rateLimitState,
	mockRequireUserSession,
	mockCachedEventHandler,
	capturedCachedOptions,
} = vi.hoisted(() => {
	const cacheStore = new Map<string, unknown>();
	const rateLimitState = new Map<string, unknown>();
	const mockRequireUserSession = vi.fn();
	const capturedCachedOptions: Record<string, unknown>[] = [];

	// Deterministic stand-in for Nitro's cachedEventHandler: same key → cached
	// value, resolver NOT re-invoked. This mirrors a warm production cache.
	const mockCachedEventHandler = vi.fn(
		(resolver: (event: unknown) => Promise<unknown>, opts: Record<string, unknown>) => {
			capturedCachedOptions.push(opts);
			const getKey =
				(opts["getKey"] as ((event: unknown) => string) | undefined) ??
				(() => "default-key");
			return async (event: unknown) => {
				const key = getKey(event);
				if (cacheStore.has(key)) {
					return cacheStore.get(key);
				}
				const value = await resolver(event);
				cacheStore.set(key, value);
				return value;
			};
		},
	);

	const g = globalThis as Record<string, unknown>;
	g.useStorage = () => ({
		getItem: async (key: string) => rateLimitState.get(key) ?? null,
		setItem: async (key: string, value: unknown) => void rateLimitState.set(key, value),
	});
	g.requireUserSession = mockRequireUserSession;
	g.getRequestIP = () => "203.0.113.10";
	g.getRequestURL = () => new URL("http://localhost/api/guilds/guild-1/logs");
	g.setResponseHeader = vi.fn();
	g.defineEventHandler = (fn: unknown) => fn;
	g.cachedEventHandler = mockCachedEventHandler;
	g.omit = <T extends object>(keys: (keyof T)[], obj: T) => {
		const clone = { ...obj };
		for (const key of keys) {
			delete clone[key];
		}
		return clone;
	};

	return {
		cacheStore,
		rateLimitState,
		mockRequireUserSession,
		mockCachedEventHandler,
		capturedCachedOptions,
	};
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

import { defineWrappedCachedResponseHandler } from "#server/utils/wrappedEventHandler";

function makeEvent(guildId: string): H3Event {
	return {
		context: { params: { guild: guildId } },
		node: { req: { method: "GET", socket: {} } },
		headers: new Headers(),
	} as unknown as H3Event;
}

const managerSession = { user: { id: "manager-user" } };

describe("defineWrappedCachedResponseHandler cache/auth ordering", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		cacheStore.clear();
		rateLimitState.clear();
		mockRequireUserSession.mockResolvedValue(managerSession);
	});

	function buildHandler() {
		const resolvedBody = { rows: ["log-entry"], total: 1 };
		const innerHandler = vi.fn().mockResolvedValue(resolvedBody);
		const handler = defineWrappedCachedResponseHandler(innerHandler, {
			auth: true,
			maxAge: 30,
			swr: false,
			rateLimit: { enabled: false },
			getKey: (event: H3Event) =>
				`guild:${(event as unknown as { context: { params: { guild: string } } }).context.params.guild}`,
		});
		return { handler, innerHandler, resolvedBody };
	}

	it("runs authentication on a cold cache miss", async () => {
		const { handler, innerHandler } = buildHandler();

		await handler(makeEvent("guild-1"));

		expect(mockRequireUserSession).toHaveBeenCalledTimes(1);
		expect(innerHandler).toHaveBeenCalledTimes(1);
	});

	it("currently serves warm hits without re-running authentication (documented regression)", async () => {
		const { handler, resolvedBody } = buildHandler();

		// Warm the cache as an authorized manager
		await handler(makeEvent("guild-1"));
		expect(mockRequireUserSession).toHaveBeenCalledTimes(1);

		// Second request for the same key: session check would now REJECT
		mockRequireUserSession.mockRejectedValue(
			Object.assign(new Error("Unauthorized"), { status: 401 }),
		);

		const result = await handler(makeEvent("guild-1"));

		// Regression: the cached body is returned and auth never executed again
		expect(result).toEqual(resolvedBody);
		expect(mockRequireUserSession).toHaveBeenCalledTimes(1);
	});

	// SECURITY INVARIANT (plan 004 must make this pass): every request —
	// including warm cache hits — must run `requireUserSession`.
	it.fails("runs authentication on every request, including warm cache hits", async () => {
		const { handler } = buildHandler();

		await handler(makeEvent("guild-1"));
		await handler(makeEvent("guild-1"));

		expect(mockRequireUserSession).toHaveBeenCalledTimes(2);
	});

	// SECURITY INVARIANT (plan 004 must make this pass): an unauthenticated
	// request must be rejected even when the cache is warm.
	it.fails("rejects unauthenticated requests on a warm cache", async () => {
		const { handler } = buildHandler();

		await handler(makeEvent("guild-1"));
		mockRequireUserSession.mockRejectedValue(
			Object.assign(new Error("Unauthorized"), { status: 401 }),
		);

		await expect(handler(makeEvent("guild-1"))).rejects.toThrow("Unauthorized");
	});

	it("passes cache options through and keeps wrapper-only options out of Nitro", () => {
		buildHandler();

		expect(mockCachedEventHandler).toHaveBeenCalledTimes(1);
		const opts = capturedCachedOptions.at(-1)!;
		expect(opts["maxAge"]).toBe(30);
		expect(opts["swr"]).toBe(false);
		expect(typeof opts["getKey"]).toBe("function");
		expect(opts).not.toHaveProperty("auth");
		expect(opts).not.toHaveProperty("rateLimit");
		expect(opts).not.toHaveProperty("onError");
	});

	it("uses cache keys that do not vary by session identity", () => {
		buildHandler();

		const opts = capturedCachedOptions.at(-1)!;
		const getKey = opts["getKey"] as (event: H3Event) => string;
		// Same guild, different (hypothetical) sessions → same key: the data
		// cache is shared across users, which is why per-request authorization
		// is mandatory before cache access.
		expect(getKey(makeEvent("guild-1"))).toBe(getKey(makeEvent("guild-1")));
		expect(getKey(makeEvent("guild-1"))).not.toBe(getKey(makeEvent("guild-2")));
	});
});
