import type { H3Event } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Security-ordering tests for `defineWrappedCachedResponseHandler`
 * (plans 002 + 004).
 *
 * These tests drive the REAL wrapper from `server/utils/wrappedEventHandler.ts`
 * with a deterministic fake `cachedEventHandler` that mimics Nitro's cache:
 * a warm key returns the stored response WITHOUT invoking the resolver.
 *
 * Invariant: authentication, rate limiting, and the `authorize` hook execute
 * on EVERY request — the cache stores data only, so a warm hit must never
 * bypass request-specific security checks.
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

	it("serves warm hits from cache without re-running the data resolver", async () => {
		const { handler, innerHandler, resolvedBody } = buildHandler();

		await handler(makeEvent("guild-1"));
		const result = await handler(makeEvent("guild-1"));

		expect(result).toEqual(resolvedBody);
		expect(innerHandler).toHaveBeenCalledTimes(1);
	});

	it("runs authentication on every request, including warm cache hits", async () => {
		const { handler } = buildHandler();

		await handler(makeEvent("guild-1"));
		await handler(makeEvent("guild-1"));

		expect(mockRequireUserSession).toHaveBeenCalledTimes(2);
	});

	it("rejects unauthenticated requests on a warm cache", async () => {
		const { handler, innerHandler } = buildHandler();

		await handler(makeEvent("guild-1"));
		mockRequireUserSession.mockRejectedValue(
			Object.assign(new Error("Unauthorized"), { status: 401 }),
		);

		await expect(handler(makeEvent("guild-1"))).rejects.toThrow("Unauthorized");
		expect(innerHandler).toHaveBeenCalledTimes(1);
	});

	it("runs the authorize hook on every request and blocks revoked users from warm hits", async () => {
		const resolvedBody = { rows: ["log-entry"], total: 1 };
		const innerHandler = vi.fn().mockResolvedValue(resolvedBody);
		const authorize = vi.fn().mockResolvedValue(undefined);
		const handler = defineWrappedCachedResponseHandler(innerHandler, {
			auth: true,
			maxAge: 30,
			swr: false,
			rateLimit: { enabled: false },
			authorize,
			getKey: (event: H3Event) =>
				`guild:${(event as unknown as { context: { params: { guild: string } } }).context.params.guild}`,
		});

		// Warm the cache as a manager
		await expect(handler(makeEvent("guild-1"))).resolves.toEqual(resolvedBody);
		expect(authorize).toHaveBeenCalledTimes(1);
		expect(authorize).toHaveBeenCalledWith(expect.anything(), managerSession);

		// Same user loses guild permissions between requests
		authorize.mockRejectedValue(Object.assign(new Error("Forbidden"), { status: 403 }));

		await expect(handler(makeEvent("guild-1"))).rejects.toThrow("Forbidden");
		expect(authorize).toHaveBeenCalledTimes(2);
		// The cached body was resolved exactly once and never leaked to the
		// forbidden request
		expect(innerHandler).toHaveBeenCalledTimes(1);
	});

	it("lets two authorized managers share the same cached result", async () => {
		const { handler, innerHandler, resolvedBody } = buildHandler();

		mockRequireUserSession.mockResolvedValueOnce({ user: { id: "manager-a" } });
		await expect(handler(makeEvent("guild-1"))).resolves.toEqual(resolvedBody);

		mockRequireUserSession.mockResolvedValueOnce({ user: { id: "manager-b" } });
		await expect(handler(makeEvent("guild-1"))).resolves.toEqual(resolvedBody);

		expect(innerHandler).toHaveBeenCalledTimes(1);
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
		expect(opts).not.toHaveProperty("authorize");
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
