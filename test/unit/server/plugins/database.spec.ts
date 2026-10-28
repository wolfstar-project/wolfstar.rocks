import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
	const hooks: Record<string, ((...args: unknown[]) => unknown)[]> = {};
	(globalThis as Record<string, unknown>).defineNitroPlugin = (
		setup: (nitroApp: unknown) => void,
	) => {
		setup({
			hooks: {
				hook: (name: string, handler: (...args: unknown[]) => unknown) => {
					(hooks[name] ??= []).push(handler);
				},
			},
		});
		return setup;
	};
	return { createDatabase: vi.fn((url: string) => ({ url })), hooks };
});

vi.mock("std-env", async (importOriginal) => ({
	...(await importOriginal<typeof import("std-env")>()),
	runtime: "workerd",
}));
vi.mock("#server/database/prisma", () => ({ createDatabase: mocks.createDatabase }));

await import("~~/server/plugins/database");

const onRequest = () => mocks.hooks.request![0]!;

describe("the database plugin on Cloudflare Workers", () => {
	beforeEach(() => {
		mocks.createDatabase.mockClear();
	});

	it("gives a request its own client from the Hyperdrive binding", () => {
		const event = {
			context: {
				cloudflare: { env: { HYPERDRIVE: { connectionString: "postgres://hyperdrive" } } },
			} as Record<string, unknown>,
		};

		onRequest()(event);

		expect(mocks.createDatabase).toHaveBeenCalledWith("postgres://hyperdrive", 0);
		expect(event.context.database).toStrictEqual({ url: "postgres://hyperdrive" });
	});

	// Nitro's `$fetch` and `localFetch` calls inside a request (the translations,
	// the icons) carry no Cloudflare bindings. Throwing there stopped Nitro from
	// running the request hooks after this one, evlog's among them.
	it("leaves an internal sub-request without bindings alone instead of throwing", () => {
		const event = { context: {} as Record<string, unknown> };

		expect(() => onRequest()(event)).not.toThrow();
		expect(event.context.database).toBeUndefined();
		expect(mocks.createDatabase).not.toHaveBeenCalled();
	});
});
