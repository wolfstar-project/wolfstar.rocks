import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRemoveItem } = vi.hoisted(() => {
	const mockRemoveItem = vi.fn();
	(globalThis as Record<string, unknown>).useStorage = () => ({
		removeItem: mockRemoveItem,
	});
	return { mockRemoveItem };
});

import type { GuildProbe } from "#server/utils/discord/cache";
import {
	invalidateCurrentUserCache,
	invalidateGuildCache,
	rememberGuildProbe,
} from "#server/utils/discord/cache";

describe("invalidateCurrentUserCache", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("removes the named getCurrentUser cache entry for the user", async () => {
		await invalidateCurrentUserCache("123456789012345678");

		expect(mockRemoveItem).toHaveBeenCalledWith(
			"/cache:nitro/functions:getCurrentUser:123456789012345678.json",
		);
	});
});

describe("invalidateGuildCache", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("removes the named getGuild cache entry for the guild", async () => {
		await invalidateGuildCache("123456789012345678");

		expect(mockRemoveItem).toHaveBeenCalledWith(
			"/cache:nitro/functions:getGuild:guild:123456789012345678.json",
		);
	});
});

describe("rememberGuildProbe", () => {
	const absent: GuildProbe = { confirmedAbsent: true, guild: null, live: true };
	const fallback: GuildProbe = { confirmedAbsent: false, guild: null, live: false };

	beforeEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	it("shares one live probe between the requests made within its window", async () => {
		const run = vi.fn().mockResolvedValue(absent);

		const [first, second] = await Promise.all([
			rememberGuildProbe("100000000000000001", run),
			rememberGuildProbe("100000000000000001", run),
		]);
		await rememberGuildProbe("100000000000000001", run);

		expect(run).toHaveBeenCalledOnce();
		expect(first).toBe(second);
	});

	it("probes again once the window has passed", async () => {
		vi.useFakeTimers();
		const run = vi.fn().mockResolvedValue(absent);

		await rememberGuildProbe("100000000000000002", run);
		vi.advanceTimersByTime(31_000);
		await rememberGuildProbe("100000000000000002", run);

		expect(run).toHaveBeenCalledTimes(2);
		vi.useRealTimers();
	});

	it("does not keep a probe that fell back to the stored entry", async () => {
		const run = vi.fn().mockResolvedValue(fallback);

		await rememberGuildProbe("100000000000000003", run);
		await rememberGuildProbe("100000000000000003", run);

		expect(run).toHaveBeenCalledTimes(2);
	});

	it("forgets the probe when the guild cache is invalidated", async () => {
		const run = vi.fn().mockResolvedValue(absent);

		await rememberGuildProbe("100000000000000004", run);
		await invalidateGuildCache("100000000000000004");
		await rememberGuildProbe("100000000000000004", run);

		expect(run).toHaveBeenCalledTimes(2);
	});
});
