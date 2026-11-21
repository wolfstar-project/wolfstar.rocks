import { H3, HTTPError } from "nitro/h3";
import { describe, expect, it, vi } from "vitest";

vi.mock("evlog", () => ({
	useLogger: () => ({ set: vi.fn(), warn: vi.fn() }),
	createError: (options: { status: number; message: string }) => new HTTPError(options),
}));
vi.mock("nuxt-skew-protection/server", () => ({ isClientOutdated: () => false }));
vi.mock("#server/utils/sentry/metrics", () => ({
	instrumentCacheGet: (_key: string, run: () => unknown) => run(),
	instrumentCachePut: (_key: string, run: () => unknown) => run(),
	withApiMetrics: (_event: unknown, run: () => unknown) => run(),
}));

import { defineWrappedCachedResponseHandler } from "#server/utils/wrappedEventHandler";

describe("native Nitro cached responses", () => {
	it("serves cached JSON and still refuses a revoked manager", async () => {
		let allowed = true;
		const resolve = vi.fn(() => ({ channels: [{ id: "123" }] }));
		const authorize = vi.fn(() => {
			if (!allowed) throw new HTTPError({ status: 403 });
		});
		const store = new Map<string, unknown>();
		const app = new H3();
		app.get(
			"/channels",
			defineWrappedCachedResponseHandler(resolve, {
				authorize,
				rateLimit: { enabled: false },
				maxAge: 60,
				swr: false,
				getKey: () => "native-cache-test",
				storage: {
					get: <T>(key: string) => (store.get(key) as T | undefined) ?? null,
					set: (key: string, value: unknown) => {
						store.set(key, value);
					},
				},
			}),
		);
		const first = await app.fetch(new Request("http://localhost/channels"));
		expect(first.status).toBe(200);
		expect(first.headers.get("cache-control")).toBe("private, no-store");
		expect(await first.json()).toEqual({ channels: [{ id: "123" }] });
		const second = await app.fetch(new Request("http://localhost/channels"));
		expect(await second.json()).toEqual({ channels: [{ id: "123" }] });
		expect(resolve).toHaveBeenCalledTimes(1);
		allowed = false;
		const denied = await app.fetch(new Request("http://localhost/channels"));
		expect(denied.status).toBe(403);
		expect(authorize).toHaveBeenCalledTimes(3);
		expect(resolve).toHaveBeenCalledTimes(1);
	});
});
