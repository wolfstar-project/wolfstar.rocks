import type { H3Event } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Skew-protection tests for `defineWrappedResponseHandler`.
 *
 * Invariant: outdated browser sessions are rejected with HTTP 409 before
 * session resolution, authorization, rate limiting, or handler execution.
 */

const {
	storageState,
	mockIsClientOutdated,
	stdEnv,
	mockRequireUserSession,
	mockCreateError,
	mockSetResponseHeader,
} = vi.hoisted(() => {
	const storageState = new Map<string, unknown>();
	const mockIsClientOutdated = vi.fn(() => false);
	const stdEnv = { isDevelopment: false };
	const mockRequireUserSession = vi.fn();
	const mockSetResponseHeader = vi.fn();

	const mockCreateError = vi.fn((opts: Record<string, unknown>) =>
		Object.assign(new Error(String(opts["message"])), opts),
	);

	const g = globalThis as Record<string, unknown>;
	g.useStorage = () => ({
		getItem: async (key: string) => storageState.get(key) ?? null,
		setItem: async (key: string, value: unknown) => {
			storageState.set(key, value);
		},
	});
	g.requireUserSession = mockRequireUserSession;
	g.getRequestIP = () => "203.0.113.10";
	g.getRequestURL = () => new URL("http://localhost/api/test");
	g.setResponseHeader = mockSetResponseHeader;
	g.defineEventHandler = (fn: unknown) => fn;
	g.cachedEventHandler = (fn: unknown) => fn;
	g.omit = <T extends object>(keys: (keyof T)[], obj: T) => {
		const clone = { ...obj };
		for (const key of keys) {
			delete clone[key];
		}
		return clone;
	};

	return {
		storageState,
		mockIsClientOutdated,
		stdEnv,
		mockRequireUserSession,
		mockCreateError,
		mockSetResponseHeader,
	};
});

vi.mock("nuxt-skew-protection/server", () => ({
	isClientOutdated: mockIsClientOutdated,
}));

vi.mock("std-env", () => ({
	get isDevelopment() {
		return stdEnv.isDevelopment;
	},
}));

vi.mock("evlog", () => ({
	useLogger: vi.fn().mockReturnValue({
		set: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	}),
	createError: mockCreateError,
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

describe("skew protection in wrapped handler", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		storageState.clear();
		stdEnv.isDevelopment = false;
		mockIsClientOutdated.mockReturnValue(false);
		mockRequireUserSession.mockResolvedValue({ user: { id: "user-1" } });
	});

	it("rejects outdated clients with 409 before the handler runs", async () => {
		mockIsClientOutdated.mockReturnValue(true);
		const innerHandler = vi.fn().mockResolvedValue("ok");
		const handler = defineWrappedResponseHandler(innerHandler, {
			auth: true,
			rateLimit: { enabled: true, limit: 5, type: "fixed", window: 10_000 },
		});

		await expect(handler(makeEvent())).rejects.toThrow(
			"Client version outdated. Please refresh.",
		);

		expect(mockCreateError).toHaveBeenCalledWith(
			expect.objectContaining({
				status: 409,
				message: "Client version outdated. Please refresh.",
			}),
		);
		expect(mockSetResponseHeader).toHaveBeenCalledWith(
			expect.anything(),
			"x-client-outdated",
			"true",
		);
		expect(innerHandler).not.toHaveBeenCalled();
		expect(mockRequireUserSession).not.toHaveBeenCalled();
	});

	it("allows current clients through to the handler", async () => {
		const innerHandler = vi.fn().mockResolvedValue("payload");
		const handler = defineWrappedResponseHandler(innerHandler, {
			auth: false,
			rateLimit: { enabled: false },
		});

		await expect(handler(makeEvent())).resolves.toBe("payload");
		expect(innerHandler).toHaveBeenCalledTimes(1);
		expect(mockCreateError).not.toHaveBeenCalled();
	});

	it("skips the skew check in development", async () => {
		stdEnv.isDevelopment = true;
		mockIsClientOutdated.mockReturnValue(true);
		const innerHandler = vi.fn().mockResolvedValue("dev-ok");
		const handler = defineWrappedResponseHandler(innerHandler, {
			auth: false,
			rateLimit: { enabled: false },
		});

		await expect(handler(makeEvent())).resolves.toBe("dev-ok");
		expect(innerHandler).toHaveBeenCalledTimes(1);
		expect(mockCreateError).not.toHaveBeenCalled();
	});

	it("does not touch rate-limit storage when the client is outdated", async () => {
		mockIsClientOutdated.mockReturnValue(true);
		const innerHandler = vi.fn().mockResolvedValue("ok");
		const handler = defineWrappedResponseHandler(innerHandler, {
			auth: true,
			rateLimit: { enabled: true, limit: 5, type: "fixed", window: 10_000 },
		});

		await expect(handler(makeEvent())).rejects.toThrow(
			"Client version outdated. Please refresh.",
		);
		expect(storageState.size).toBe(0);
	});
});
