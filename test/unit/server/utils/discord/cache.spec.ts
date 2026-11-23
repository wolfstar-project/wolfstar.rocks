import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockRemoveItem } = vi.hoisted(() => {
	const mockRemoveItem = vi.fn(() => Promise.resolve());
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

	it("removes the probe the Worker's isolates share", async () => {
		await invalidateGuildCache("123456789012345678");

		expect(mockRemoveItem).toHaveBeenCalledWith("discord:guild-probe:123456789012345678");
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
		vi.advanceTimersByTime(61_000);
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

describe("rememberGuildProbe on Cloudflare Workers", () => {
	const present: GuildProbe = { at: 0, confirmedAbsent: false, guild: null, live: true };
	const fallback: GuildProbe = { confirmedAbsent: false, guild: null, live: false };

	beforeEach(() => {
		vi.useFakeTimers();
		vi.clearAllMocks();
		vi.stubGlobal("navigator", { userAgent: "Cloudflare-Workers" });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it("answers again with what a finished probe found, for a few seconds", async () => {
		const run = vi.fn().mockResolvedValue({ ...present, at: Date.now() });

		await rememberGuildProbe("200000000000000001", run);
		vi.advanceTimersByTime(9_000);
		await rememberGuildProbe("200000000000000001", run);
		expect(run).toHaveBeenCalledOnce();

		vi.advanceTimersByTime(2_000);
		await rememberGuildProbe("200000000000000001", run);
		expect(run).toHaveBeenCalledTimes(2);
	});

	it("does not keep a shared answer past its own window", async () => {
		const run = vi.fn().mockResolvedValue({ ...present, at: Date.now() - 55_000 });

		await rememberGuildProbe("200000000000000002", run);
		vi.advanceTimersByTime(6_000);
		await rememberGuildProbe("200000000000000002", run);

		expect(run).toHaveBeenCalledTimes(2);
	});

	it("does not keep a probe that fell back to the stored entry", async () => {
		const run = vi.fn().mockResolvedValue(fallback);

		await rememberGuildProbe("200000000000000003", run);
		await rememberGuildProbe("200000000000000003", run);

		expect(run).toHaveBeenCalledTimes(2);
	});

	it("does not keep a probe that an invalidation overtook", async () => {
		const at = Date.now();
		let finish: (probe: GuildProbe) => void = () => {};
		const slow = new Promise<GuildProbe>((resolve) => {
			finish = resolve;
		});
		const stale = rememberGuildProbe("200000000000000005", () => slow);

		vi.advanceTimersByTime(100);
		await invalidateGuildCache("200000000000000005");
		finish({ at, confirmedAbsent: true, guild: null, live: true });
		await stale;

		const run = vi.fn().mockResolvedValue({ ...present, at: Date.now() });
		await rememberGuildProbe("200000000000000005", run);
		expect(run).toHaveBeenCalledOnce();
	});

	it("forgets what it found when the guild cache is invalidated", async () => {
		const run = vi.fn().mockResolvedValue({ ...present, at: Date.now() });

		await rememberGuildProbe("200000000000000004", run);
		await invalidateGuildCache("200000000000000004");
		await rememberGuildProbe("200000000000000004", run);

		expect(run).toHaveBeenCalledTimes(2);
	});
});
