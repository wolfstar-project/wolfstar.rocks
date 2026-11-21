import { createError as createEvlogError } from "evlog";
import { createError as createH3Error } from "h3";
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
	return { hooks };
});

await import("~~/server/plugins/evlog-expected-errors");

/** What h3 hands Nitro's `error` hook for a thrown error that is not already an h3 error. */
function asNormalized(error: Error) {
	const normalized = createH3Error(error);
	normalized.unhandled = true;
	return normalized;
}

function levelAfter(error: unknown): string | undefined {
	let level: string | undefined;
	const event = { context: { log: { setLevel: (next: string) => (level = next) } } };
	for (const hook of mocks.hooks.error ?? []) hook(error, { event });
	return level;
}

describe("the level of the errors the app means", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("logs a refusal made with evlog's createError at warn", () => {
		for (const status of [401, 409, 429]) {
			const error = asNormalized(createEvlogError({ message: "refused", status }));
			expect(levelAfter(error)).toBe("warn");
		}
	});

	it("logs a refusal made with h3's createError at warn", () => {
		expect(
			levelAfter(createH3Error({ statusCode: 404, statusMessage: "Page not found" })),
		).toBe("warn");
	});

	it("keeps the error level for a server failure", () => {
		expect(levelAfter(asNormalized(createEvlogError({ message: "broke", status: 500 })))).toBe(
			undefined,
		);
	});

	// An upstream failure that only looks like a 404 (an ofetch error from the bot
	// API, normalized by h3) is not a refusal the app made.
	it("keeps the error level for a foreign error with a client status", () => {
		const upstream = Object.assign(new Error("bot API 404"), { statusCode: 404 });
		expect(levelAfter(asNormalized(upstream))).toBe(undefined);
	});

	it("does nothing for a request without a logger", () => {
		const error = createH3Error({ statusCode: 404 });
		expect(() => {
			for (const hook of mocks.hooks.error ?? []) hook(error, { event: { context: {} } });
		}).not.toThrow();
	});
});
