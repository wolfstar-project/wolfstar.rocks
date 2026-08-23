import { createResilientNetlifyBlobsFetch } from "#server/utils/storage/resilient-fetch";
import { describe, expect, it, vi } from "vitest";

describe("createResilientNetlifyBlobsFetch", () => {
	it("returns a buffered response on success", async () => {
		const fetchImpl = vi.fn(async () => new Response("hello", { status: 200 }));
		const resilient = createResilientNetlifyBlobsFetch({
			fetch: fetchImpl as unknown as typeof fetch,
			sleep: async () => {},
		});

		const response = await resilient("https://edge.netlifyblobs.com/example");
		expect(response.status).toBe(200);
		expect(await response.text()).toBe("hello");
		expect(fetchImpl).toHaveBeenCalledOnce();
	});

	it("retries when the body read fails with socket hang up", async () => {
		const hangUp = Object.assign(new Error("socket hang up"), { code: "ECONNRESET" });
		const fetchImpl = vi
			.fn()
			.mockResolvedValueOnce({
				status: 200,
				statusText: "OK",
				headers: new Headers(),
				arrayBuffer: async () => {
					throw hangUp;
				},
			})
			.mockResolvedValueOnce(new Response(JSON.stringify({ blobs: [] }), { status: 200 }));

		const resilient = createResilientNetlifyBlobsFetch({
			fetch: fetchImpl as unknown as typeof fetch,
			maxAttempts: 3,
			baseDelayMs: 1,
			sleep: async () => {},
		});

		const response = await resilient("https://edge.netlifyblobs.com/list");
		expect(await response.json()).toEqual({ blobs: [] });
		expect(fetchImpl).toHaveBeenCalledTimes(2);
	});

	it("does not retry non-transient failures", async () => {
		const fetchImpl = vi.fn(async () => {
			throw new Error("invalid token");
		});
		const resilient = createResilientNetlifyBlobsFetch({
			fetch: fetchImpl as unknown as typeof fetch,
			sleep: async () => {},
		});

		await expect(resilient("https://edge.netlifyblobs.com/example")).rejects.toThrow(
			"invalid token",
		);
		expect(fetchImpl).toHaveBeenCalledOnce();
	});

	it("throws after exhausting retries", async () => {
		const hangUp = Object.assign(new Error("socket hang up"), { code: "ECONNRESET" });
		const fetchImpl = vi.fn(async () => {
			throw hangUp;
		});
		const resilient = createResilientNetlifyBlobsFetch({
			fetch: fetchImpl as unknown as typeof fetch,
			maxAttempts: 3,
			baseDelayMs: 1,
			sleep: async () => {},
		});

		await expect(resilient("https://edge.netlifyblobs.com/example")).rejects.toThrow(
			"socket hang up",
		);
		expect(fetchImpl).toHaveBeenCalledTimes(3);
	});
});
