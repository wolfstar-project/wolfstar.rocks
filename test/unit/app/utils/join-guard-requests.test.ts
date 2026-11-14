import type { JoinGuardRequestState } from "#shared/utils/join-guard";
import { describe, expect, it, vi } from "vitest";
import {
	JOIN_GUARD_POLL_DELAYS,
	readJoinGuardRouteCode,
	settleJoinGuardRequest,
} from "~/utils/join-guard-requests";

function state(overrides: Partial<JoinGuardRequestState> = {}): JoinGuardRequestState {
	return { error: null, id: "1", kind: "Verify", processed: false, ...overrides };
}

const noWait = () => Promise.resolve();

describe("settleJoinGuardRequest", () => {
	it("asks until the bot has done the request", async () => {
		const read = vi
			.fn<() => Promise<JoinGuardRequestState>>()
			.mockResolvedValueOnce(state())
			.mockResolvedValueOnce(state({ processed: true }));

		await expect(settleJoinGuardRequest(read, { wait: noWait })).resolves.toStrictEqual({
			state: "done",
		});
		expect(read).toHaveBeenCalledTimes(2);
	});

	it("hands on the bot's reason when it could not", async () => {
		const error = { code: "MissingPermissions", detail: "Manage Roles" };
		const read = vi.fn(() => Promise.resolve(state({ error, processed: true })));

		await expect(settleJoinGuardRequest(read, { wait: noWait })).resolves.toStrictEqual({
			error,
			state: "failed",
		});
	});

	it("backs off between the looks and gives up after them", async () => {
		const waits: number[] = [];
		const read = vi.fn(() => Promise.resolve(state()));

		const outcome = await settleJoinGuardRequest(read, {
			wait: (milliseconds) => {
				waits.push(milliseconds);
				return Promise.resolve();
			},
		});

		expect(outcome).toStrictEqual({ state: "timeout" });
		expect(waits).toStrictEqual([...JOIN_GUARD_POLL_DELAYS]);
		expect(waits.at(-1)).toBeGreaterThan(waits[0]!);
	});

	it("tries a failed look again once, then says it cannot read the request", async () => {
		const flaky = vi
			.fn<() => Promise<JoinGuardRequestState>>()
			.mockRejectedValueOnce(new Error("offline"))
			.mockResolvedValueOnce(state({ processed: true }));
		await expect(settleJoinGuardRequest(flaky, { wait: noWait })).resolves.toStrictEqual({
			state: "done",
		});

		const down = vi.fn(() => Promise.reject(new Error("offline")));
		await expect(settleJoinGuardRequest(down, { wait: noWait })).resolves.toStrictEqual({
			state: "unreachable",
		});
		expect(down).toHaveBeenCalledTimes(2);
	});
});

describe("readJoinGuardRouteCode", () => {
	it("reads the code a route put in its error", () => {
		expect(readJoinGuardRouteCode({ data: { data: { code: "limit" } } })).toBe("limit");
		expect(readJoinGuardRouteCode(new Error("boom"))).toBeNull();
		expect(readJoinGuardRouteCode(null)).toBeNull();
	});
});
