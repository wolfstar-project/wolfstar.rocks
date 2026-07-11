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
	const postgresState = { impl: vi.fn().mockResolvedValue(undefined) };
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

	return { mockDrains, postgresState, sentryState, registeredHooks };
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

vi.mock("#server/utils/audit/postgres-drain", () => ({
	createPostgresAuditDrain: vi.fn(() => (ctx: unknown) => mocks.postgresState.impl(ctx)),
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

function makeNonAuditCtx(): DrainContext {
	return {
		event: { timestamp: "2026-01-01T00:00:00.000Z", level: "info" },
	} as DrainContext;
}

function findDrainHook(tag: "audit" | "sentry"): ((...args: unknown[]) => unknown) | undefined {
	// Find the correct hook by invoking candidates with a test context and checking side-effects
	const hooks = mocks.registeredHooks["evlog:drain"] ?? [];

	for (const hook of hooks) {
		// Clear previous calls to get accurate detection
		mocks.postgresState.impl.mockClear();
		mocks.sentryState.impl.mockClear();

		// Test the hook with an audit context
		const testCtx = makeAuditCtx();
		hook(testCtx);

		// Check which implementation was called
		const isAuditDrain = mocks.postgresState.impl.mock.calls.length > 0;
		const isSentryDrain = mocks.sentryState.impl.mock.calls.length > 0;

		if (tag === "audit" && isAuditDrain) {
			// Reset mocks before returning
			mocks.postgresState.impl.mockClear();
			mocks.sentryState.impl.mockClear();
			return hook;
		}

		if (tag === "sentry" && isSentryDrain) {
			// Reset mocks before returning
			mocks.postgresState.impl.mockClear();
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
		mocks.postgresState.impl.mockResolvedValue(undefined);
		mocks.sentryState.impl.mockResolvedValue(undefined);
	});

	describe("audit drain", () => {
		it("logs console.error when the postgres audit drain rejects", async () => {
			const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
			mocks.postgresState.impl.mockRejectedValueOnce(new Error("DB connection lost"));

			const auditDrainHook = findDrainHook("audit");
			expect(auditDrainHook).toBeDefined();
			await auditDrainHook!(makeAuditCtx());

			expect(consoleError).toHaveBeenCalledOnce();
			expect(consoleError.mock.calls[0]?.[0]).toContain("[evlog]");
			consoleError.mockRestore();
		});

		it("does not invoke postgres drain for non-audit events", async () => {
			const auditDrainHook = findDrainHook("audit");
			expect(auditDrainHook).toBeDefined();
			await auditDrainHook!(makeNonAuditCtx());

			expect(mocks.postgresState.impl).not.toHaveBeenCalled();
		});

		it("does not propagate postgres errors — remaining batch items still process", async () => {
			const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
			mocks.postgresState.impl.mockRejectedValueOnce(new Error("transient"));

			const auditDrainHook = findDrainHook("audit");
			await expect(auditDrainHook!(makeAuditCtx())).resolves.toBeUndefined();

			consoleError.mockRestore();
		});
	});

	describe("sentry drain", () => {
		it("logs console.warn when the sentry drain rejects", async () => {
			const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
			mocks.sentryState.impl.mockRejectedValueOnce(new Error("Sentry unreachable"));

			const sentryDrainHook = findDrainHook("sentry");
			expect(sentryDrainHook).toBeDefined();
			await sentryDrainHook!(makeAuditCtx());

			expect(consoleWarn).toHaveBeenCalledOnce();
			expect(consoleWarn.mock.calls[0]?.[0]).toContain("[evlog]");
			consoleWarn.mockRestore();
		});

		it("does not propagate sentry errors", async () => {
			const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
			mocks.sentryState.impl.mockRejectedValueOnce(new Error("Sentry unreachable"));

			const sentryDrainHook = findDrainHook("sentry");
			await expect(sentryDrainHook!(makeAuditCtx())).resolves.toBeUndefined();

			consoleWarn.mockRestore();
		});
	});

	describe("close hook", () => {
		it("flushes the audit drain", async () => {
			// Find the audit drain by identifying which hook calls postgresState.impl
			const auditHook = findDrainHook("audit");
			const auditDrain = mocks.mockDrains.find((d) => d.fn === auditHook);

			for (const handler of mocks.registeredHooks["close"] ?? []) {
				await handler();
			}

			expect(auditDrain?.flush).toHaveBeenCalledOnce();
		});

		it("flushes the sentry drain when sentry is configured", async () => {
			// Find the sentry drain by identifying which hook calls sentryState.impl
			const sentryHook = findDrainHook("sentry");
			const sentryDrain = mocks.mockDrains.find((d) => d.fn === sentryHook);

			for (const handler of mocks.registeredHooks["close"] ?? []) {
				await handler();
			}

			expect(sentryDrain?.flush).toHaveBeenCalledOnce();
		});
	});
});
