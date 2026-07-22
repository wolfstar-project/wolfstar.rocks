import { beforeEach, describe, expect, it, vi } from "vitest";

// All mutable state must live in vi.hoisted() so it is available inside vi.mock() factories.
// vi.mock() factories are hoisted before imports; vi.hoisted() runs before them.
const mocks = vi.hoisted(() => {
	// Drain mocks populated during plugin init
	interface MockDrain {
		fn: (...args: unknown[]) => unknown;
		flush: ReturnType<typeof vi.fn>;
		batchHandler: (batch: unknown[]) => Promise<void>;
	}
	const mockDrains: MockDrain[] = [];

	// Delegating wrappers so tests can change the underlying implementation via setters
	const sentryState = { impl: vi.fn().mockResolvedValue(undefined) };

	// Hooks captured from the mock nitroApp
	const registeredHooks: Record<string, ((...args: unknown[]) => unknown)[]> = {};

	(globalThis as Record<string, unknown>).defineNitroPlugin = (cb: (nitro: unknown) => void) => {
		cb({
			hooks: {
				hook: (event: string, handler: (...args: unknown[]) => unknown) => {
					registeredHooks[event] ??= [];
					registeredHooks[event]!.push(handler);
				},
			},
		});
		return cb;
	};

	(globalThis as Record<string, unknown>).useRuntimeConfig = () => ({
		public: { sentry: { dsn: "https://fake-token@invalid.example.invalid/1" } },
	});

	return { mockDrains, sentryState, registeredHooks };
});

vi.mock("evlog/pipeline", () => ({
	createDrainPipeline: vi.fn(() => (batchHandler: (batch: unknown[]) => Promise<void>) => {
		const flush = vi.fn().mockResolvedValue(undefined);
		// Bypass buffering: call batchHandler immediately with a single-item batch
		const drainFn = vi.fn((ctx: unknown) => batchHandler([ctx]));
		drainFn.flush = flush;

		mocks.mockDrains.push({ fn: drainFn, flush, batchHandler });
		return drainFn;
	}),
}));

vi.mock("evlog/sentry", () => ({
	createSentryDrain: vi.fn(() => (ctx: unknown) => mocks.sentryState.impl(ctx)),
}));

import type { DrainContext } from "evlog";
// ---- Helpers ----------------------------------------------------------------
// Importing the plugin triggers defineNitroPlugin, which populates registeredHooks and mockDrains
import "#server/plugins/evlog-drain";

function makeAuditCtx(): DrainContext {
	return {
		event: {
			timestamp: "2026-01-01T00:00:00.000Z",
			level: "info",
			audit: {
				action: "guild.settings.update",
				actor: { type: "user", id: "111" },
				target: { type: "guild", id: "222" },
				outcome: "success",
				context: { requestId: "req-1", traceId: "trace-1" },
			},
		},
	} as DrainContext;
}

function findSentryDrainHook(): ((...args: unknown[]) => unknown) | undefined {
	const hooks = mocks.registeredHooks["evlog:drain"] ?? [];

	for (const hook of hooks) {
		mocks.sentryState.impl.mockClear();

		hook(makeAuditCtx());

		if (mocks.sentryState.impl.mock.calls.length > 0) {
			mocks.sentryState.impl.mockClear();
			return hook;
		}
	}

	return undefined;
}

// ---- Tests ------------------------------------------------------------------

describe("evlog-drain plugin", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Restore flush implementations cleared by clearAllMocks
		for (const drain of mocks.mockDrains) {
			drain.flush.mockResolvedValue(undefined);
		}
		mocks.sentryState.impl.mockResolvedValue(undefined);
	});

	describe("sentry drain", () => {
		it("logs console.warn when the sentry drain rejects", async () => {
			const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
			mocks.sentryState.impl.mockRejectedValueOnce(new Error("Sentry unreachable"));

			const sentryDrainHook = findSentryDrainHook();
			expect(sentryDrainHook).toBeDefined();
			await sentryDrainHook!(makeAuditCtx());

			expect(consoleWarn).toHaveBeenCalledOnce();
			expect(consoleWarn.mock.calls[0]?.[0]).toContain("[evlog]");
			consoleWarn.mockRestore();
		});

		it("does not propagate sentry errors", async () => {
			const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
			mocks.sentryState.impl.mockRejectedValueOnce(new Error("Sentry unreachable"));

			const sentryDrainHook = findSentryDrainHook();
			await expect(sentryDrainHook!(makeAuditCtx())).resolves.toBeUndefined();

			consoleWarn.mockRestore();
		});
	});

	describe("close hook", () => {
		it("flushes the pipeline drain", async () => {
			const sentryHook = findSentryDrainHook();
			const sentryDrain = mocks.mockDrains.find((d) => d.fn === sentryHook);

			for (const handler of mocks.registeredHooks["close"] ?? []) {
				await handler();
			}

			expect(sentryDrain?.flush).toHaveBeenCalledOnce();
		});
	});
});
