import { mockEvent } from "h3";
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
const { findRequestDatabase, forgetRequestDatabase } =
	await import("#server/utils/audit/request-database");

const onRequest = () => mocks.hooks.request![0]!;
const onResponse = () => mocks.hooks.response![0]!;

/** Nitro v3 keeps Worker bindings on the request runtime. */
function requestEvent(context: Record<string, unknown>, headers?: HeadersInit) {
	const request = Object.assign(new Request("http://localhost/", { headers }), {
		runtime: {
			name: "cloudflare",
			cloudflare: { env: { HYPERDRIVE: { connectionString: "postgres://hyperdrive" } } },
		},
	});
	const event = mockEvent(request);
	Object.assign(event.context, context);
	return event;
}

describe("the database plugin on Cloudflare Workers", () => {
	beforeEach(() => {
		mocks.createDatabase.mockClear();
	});

	it("gives a request its own client from the Hyperdrive binding", () => {
		const event = requestEvent({});

		onRequest()(event);

		expect(mocks.createDatabase).toHaveBeenCalledWith("postgres://hyperdrive", {
			idleTimeoutMillis: 0,
			verifyMarker: false,
		});
		expect(event.context.database).toStrictEqual({ url: "postgres://hyperdrive" });
	});

	// h3 reports a thrown error outside the request's async context, where the
	// audit drain cannot read `db`: it finds the client by the request's ID.
	it("remembers the client by the ID evlog gives the request", () => {
		const event = requestEvent({}, { "cf-ray": "8f1c2d3e4f5a6b7c-MXP" });

		onRequest()(event);

		expect(findRequestDatabase("8f1c2d3e4f5a6b7c-MXP")).toBe(event.context.database);

		forgetRequestDatabase("8f1c2d3e4f5a6b7c-MXP");
		expect(findRequestDatabase("8f1c2d3e4f5a6b7c-MXP")).toBeUndefined();
	});

	it("keeps database clients separate for simultaneous Worker requests", () => {
		const first = requestEvent({});
		const second = requestEvent({});

		onRequest()(first);
		onRequest()(second);

		expect(mocks.createDatabase).toHaveBeenCalledTimes(2);
		expect(first.context.database).not.toBe(second.context.database);
		onResponse()(new Response(), first);
		onResponse()(new Response(), second);
	});

	// evlog's hook may run first, without a ray: the key is the ID its logger
	// already holds, not one of this plugin's own.
	it("keys the client by the ID evlog's logger already holds", () => {
		const event = requestEvent({
			log: { getContext: () => ({ requestId: "evlog-id" }) },
		});

		onRequest()(event);

		expect(findRequestDatabase("evlog-id")).toBe(event.context.database);
		forgetRequestDatabase("evlog-id");
	});

	it("sets the ID evlog will take when it runs after and there is no ray", () => {
		const event = requestEvent({});

		onRequest()(event);

		const id = event.context.requestId as string;
		expect(typeof id).toBe("string");
		expect(findRequestDatabase(id)).toBe(event.context.database);
		forgetRequestDatabase(id);
	});

	// The client must not outlive its request: it is let go once the request
	// has answered, unless the drain still has an audit event to write with it.
	it("lets the client go when the request ends, unless an audit event waits", () => {
		const request = (audit?: object) =>
			requestEvent({
				log: { getContext: () => ({ requestId: audit ? "audited" : "plain", audit }) },
			});
		const plain = request();
		const audited = request({ action: "guild.settings.access_denied" });

		onRequest()(plain);
		onRequest()(audited);
		onResponse()(new Response(), plain);
		onResponse()(new Response(), audited);

		expect(findRequestDatabase("plain")).toBeUndefined();
		expect(findRequestDatabase("audited")).toBe(audited.context.database);
		forgetRequestDatabase("audited");
	});

	// Nitro's `$fetch` and `localFetch` calls inside a request (the translations,
	// the icons) carry no Cloudflare bindings. Throwing there stopped Nitro from
	// running the request hooks after this one, evlog's among them.
	it("leaves an internal sub-request without bindings alone instead of throwing", () => {
		const event = mockEvent("/");

		expect(() => onRequest()(event)).not.toThrow();
		expect(event.context.database).toBeUndefined();
		expect(mocks.createDatabase).not.toHaveBeenCalled();
	});
});

// Mock the explicit server imports at the same boundaries as the former globals.
vi.mock("nitro", () => ({
	definePlugin: (...args: unknown[]) =>
		(Reflect.get(globalThis, "defineNitroPlugin") as (...args: unknown[]) => unknown)(...args),
}));
