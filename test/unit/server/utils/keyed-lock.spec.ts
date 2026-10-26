import { createKeyedLock } from "#server/utils/keyed-lock";
import { afterEach, describe, expect, it, vi } from "vitest";

function deferred() {
	let resolve!: () => void;
	const promise = new Promise<void>((done) => {
		resolve = done;
	});
	return { promise, resolve };
}

/** Runs two calls with the same key, the first held open, and records the order things happen. */
async function runTwoCalls() {
	const run = createKeyedLock();
	const order: string[] = [];
	const first = deferred();

	const a = run("guild", async () => {
		order.push("a:start");
		await first.promise;
		order.push("a:end");
	});
	const b = run("guild", async () => {
		order.push("b:start");
	});

	await new Promise((done) => setTimeout(done, 0));
	first.resolve();
	await Promise.all([a, b]);
	return order;
}

describe("createKeyedLock", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("runs a call only once the one before it with the same key is done", async () => {
		expect(await runTwoCalls()).toEqual(["a:start", "a:end", "b:start"]);
	});

	it("does not make a request wait on another on Cloudflare Workers", async () => {
		vi.stubGlobal("navigator", { userAgent: "Cloudflare-Workers" });

		expect(await runTwoCalls()).toEqual(["a:start", "b:start", "a:end"]);
	});

	it("lets the next call run after one that threw", async () => {
		const run = createKeyedLock();

		await expect(run("guild", () => Promise.reject(new Error("boom")))).rejects.toThrow("boom");
		await expect(run("guild", () => Promise.resolve("next"))).resolves.toBe("next");
	});
});
