import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
	(globalThis as Record<string, unknown>).defineEventHandler = (handler: unknown) => handler;
	(globalThis as Record<string, unknown>).serverAuth = () => ({ api: { getSession: vi.fn() } });
	return { identify: vi.fn(async () => {}) };
});

vi.mock("evlog/better-auth", () => ({ createAuthMiddleware: () => mocks.identify }));

const { default: identifyActor } = await import("~~/server/middleware/evlog-auth-identify");
const run = identifyActor as unknown as (event: unknown) => Promise<void>;

describe("the evlog actor middleware", () => {
	beforeEach(() => {
		mocks.identify.mockClear();
	});

	it("identifies the actor on the request's logger", async () => {
		const log = { set: vi.fn() };
		await run({ context: { log }, headers: new Headers(), path: "/api/users" });

		expect(mocks.identify).toHaveBeenCalledWith(log, expect.any(Headers), "/api/users");
	});

	// A request whose evlog hook did not run has no logger: there is nothing to
	// enrich, and throwing would fail the request.
	it("does nothing for a request without a logger", async () => {
		await expect(
			run({ context: {}, headers: new Headers(), path: "/_locales/index/en-US/data.json" }),
		).resolves.toBeUndefined();
		expect(mocks.identify).not.toHaveBeenCalled();
	});
});
