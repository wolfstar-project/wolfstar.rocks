import { describe, expect, it, vi } from "vitest";
import { fetchSessionWithRetry } from "~/utils/oauth-session-retry";

const immediateWait = vi.fn(() => Promise.resolve());

describe("fetchSessionWithRetry", () => {
	it("returns true without waiting when the first fetch finds a session", async () => {
		const fetchSession = vi.fn().mockResolvedValue(undefined);
		const wait = vi.fn(() => Promise.resolve());

		const result = await fetchSessionWithRetry({
			fetchSession,
			hasSession: () => true,
			wait,
		});

		expect(result).toBe(true);
		expect(fetchSession).toHaveBeenCalledTimes(1);
		expect(wait).not.toHaveBeenCalled();
	});

	it("retries with the configured delays until the session appears", async () => {
		const fetchSession = vi.fn().mockResolvedValue(undefined);
		let signedIn = false;
		fetchSession
			.mockImplementationOnce(() => Promise.resolve())
			.mockImplementationOnce(() => {
				signedIn = true;
				return Promise.resolve();
			});
		const wait = vi.fn(() => Promise.resolve());

		const result = await fetchSessionWithRetry({
			fetchSession,
			hasSession: () => signedIn,
			wait,
			delays: [100, 200, 300],
		});

		expect(result).toBe(true);
		expect(fetchSession).toHaveBeenCalledTimes(2);
		expect(wait).toHaveBeenCalledTimes(1);
		expect(wait).toHaveBeenCalledWith(100);
	});

	it("returns false after exhausting every retry", async () => {
		const fetchSession = vi.fn().mockResolvedValue(undefined);
		const wait = vi.fn(() => Promise.resolve());

		const result = await fetchSessionWithRetry({
			fetchSession,
			hasSession: () => false,
			wait,
			delays: [100, 200],
		});

		expect(result).toBe(false);
		expect(fetchSession).toHaveBeenCalledTimes(3);
		expect(wait).toHaveBeenNthCalledWith(1, 100);
		expect(wait).toHaveBeenNthCalledWith(2, 200);
	});

	it("treats a rejected fetch as a miss and keeps retrying", async () => {
		let signedIn = false;
		const fetchSession = vi
			.fn()
			.mockRejectedValueOnce(new Error("socket hang up"))
			.mockImplementationOnce(() => {
				signedIn = true;
				return Promise.resolve();
			});

		const result = await fetchSessionWithRetry({
			fetchSession,
			hasSession: () => signedIn,
			wait: immediateWait,
			delays: [50],
		});

		expect(result).toBe(true);
		expect(fetchSession).toHaveBeenCalledTimes(2);
	});

	it("returns false when every fetch rejects", async () => {
		const fetchSession = vi.fn().mockRejectedValue(new Error("network down"));
		const hasSession = vi.fn(() => true);

		const result = await fetchSessionWithRetry({
			fetchSession,
			hasSession,
			wait: immediateWait,
			delays: [50],
		});

		expect(result).toBe(false);
		expect(hasSession).not.toHaveBeenCalled();
	});
});
