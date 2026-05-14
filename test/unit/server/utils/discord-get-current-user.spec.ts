import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetCurrent, mockGetGuilds } = vi.hoisted(() => {
	const mockGetCurrent = vi.fn();
	const mockGetGuilds = vi.fn();

	(globalThis as Record<string, unknown>).defineCachedFunction = (fn: unknown) => fn;
	(globalThis as Record<string, unknown>).hours = (n: number) => n * 3600;
	(globalThis as Record<string, unknown>).useApi = () => ({
		guilds: { get: vi.fn(), getChannels: vi.fn(), getMember: vi.fn() },
		users: {
			getCurrent: mockGetCurrent,
			getGuilds: mockGetGuilds,
			getGuildMember: vi.fn(),
		},
	});
	(globalThis as Record<string, unknown>).instrumentDiscordApiCall = (
		_name: string,
		fn: () => unknown,
	) => fn();
	(globalThis as Record<string, unknown>).instrumentBotApiCall = (
		_name: string,
		fn: () => unknown,
	) => fn();
	(globalThis as Record<string, unknown>).getUserSession = vi.fn();
	(globalThis as Record<string, unknown>).$fetch = vi.fn();
	(globalThis as Record<string, unknown>).useRuntimeConfig = () => ({
		public: { apiBaseUrl: "" },
	});
	(globalThis as Record<string, unknown>).errors = {
		unauthorized: () => Object.assign(new Error("Unauthorized"), { status: 401 }),
	};
	(globalThis as Record<string, unknown>).flattenGuild = (g: unknown) => g;
	(globalThis as Record<string, unknown>).guildNameToAcronym = (name: string) =>
		name.slice(0, 2).toUpperCase();

	return { mockGetCurrent, mockGetGuilds };
});

vi.mock("@sentry/nuxt", () => ({
	metrics: { count: vi.fn() },
	startSpan: vi.fn(),
}));

vi.mock("#server/database", () => ({
	readSettings: vi.fn().mockResolvedValue({ rolesAdmin: [] }),
	readSettingsPermissionNodes: vi.fn().mockReturnValue({ run: vi.fn().mockResolvedValue(null) }),
}));

import type { H3Event } from "h3";
import { getCurrentUser } from "#server/utils/discord";
import * as Sentry from "@sentry/nuxt";

// getCurrentUser is a defineCachedFunction; the mock above makes defineCachedFunction
// return the inner fn directly so we can invoke it with a fake event.

const fakeEvent = {
	context: {
		$authorization: {
			resolveServerTokens: vi.fn().mockResolvedValue({ access_token: "tok_test" }),
		},
	},
} as unknown as H3Event;

const mockUser = { id: "user-1", username: "testuser" };
const mockGuilds = [
	{ id: "guild-1", name: "Guild 1", permissions: "8", features: [], owner: false },
];

describe("getCurrentUser - parallel Discord API calls", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetCurrent.mockResolvedValue(mockUser);
		mockGetGuilds.mockResolvedValue(mockGuilds);
	});

	it("returns both user and guilds", async () => {
		const result = await getCurrentUser(fakeEvent);

		expect(result.user).toEqual(mockUser);
		expect(result.guilds).toEqual(mockGuilds);
	});

	it("emits a Sentry counter for each API call", async () => {
		await getCurrentUser(fakeEvent);

		expect(Sentry.metrics.count).toHaveBeenCalledWith("discord_api.call", 1, {
			attributes: { endpoint: "users.getCurrent" },
		});
		expect(Sentry.metrics.count).toHaveBeenCalledWith("discord_api.call", 1, {
			attributes: { endpoint: "users.getGuilds" },
		});
	});

	it("throws with getCurrent-specific message when getCurrent fails", async () => {
		mockGetCurrent.mockRejectedValue(Object.assign(new Error("disc err"), { code: 0 }));

		await expect(getCurrentUser(fakeEvent)).rejects.toMatchObject({
			message: "Failed to fetch user data",
			status: 500,
		});
	});

	it("throws with getGuilds-specific message when getGuilds fails", async () => {
		mockGetGuilds.mockRejectedValue(Object.assign(new Error("disc err"), { code: 0 }));

		await expect(getCurrentUser(fakeEvent)).rejects.toMatchObject({
			message: "Failed to fetch user guilds",
			status: 500,
		});
	});

	it("starts both Discord calls before either promise resolves (parallel execution)", async () => {
		let getCurrent_called = false;
		let getGuilds_called = false;
		let resolveCurrent!: (v: typeof mockUser) => void;
		let resolveGuilds!: (v: typeof mockGuilds) => void;

		mockGetCurrent.mockImplementation(() => {
			getCurrent_called = true;
			return new Promise<typeof mockUser>((r) => {
				resolveCurrent = r;
			});
		});

		mockGetGuilds.mockImplementation(() => {
			getGuilds_called = true;
			return new Promise<typeof mockGuilds>((r) => {
				resolveGuilds = r;
			});
		});

		const resultPromise = getCurrentUser(fakeEvent);

		// Drain the microtask queue. With sequential awaits, getGuilds would not yet
		// be called (getCurrent's promise is still pending). With Promise.all both
		// calls are initiated synchronously before any await yields control.
		await new Promise<void>((resolve) => setTimeout(resolve, 0));

		expect(getCurrent_called).toBe(true);
		expect(getGuilds_called).toBe(true);

		resolveCurrent(mockUser);
		resolveGuilds(mockGuilds);

		await resultPromise;
	});
});
