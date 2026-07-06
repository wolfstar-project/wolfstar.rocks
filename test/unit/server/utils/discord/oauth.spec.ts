import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetCurrent, mockGetGuilds, mockGetGuildMember, mockRefreshSessionTokens } = vi.hoisted(
	() => {
		const mockGetCurrent = vi.fn();
		const mockGetGuilds = vi.fn();
		const mockGetGuildMember = vi.fn();
		const mockRefreshSessionTokens = vi.fn();

		return {
			mockGetCurrent,
			mockGetGuildMember,
			mockGetGuilds,
			mockRefreshSessionTokens,
		};
	},
);

vi.mock("#server/utils/oauth-tokens", () => ({
	refreshSessionTokens: mockRefreshSessionTokens,
}));

(globalThis as Record<string, unknown>).useApi = () => ({
	users: {
		getCurrent: mockGetCurrent,
		getGuilds: mockGetGuilds,
		getGuildMember: mockGetGuildMember,
	},
});
(globalThis as Record<string, unknown>).instrumentDiscordApiCall = (
	_name: string,
	fn: () => unknown,
) => fn();
(globalThis as Record<string, unknown>).errors = {
	unauthorized: () => Object.assign(new Error("Unauthorized"), { status: 401 }),
};

import type { H3Event } from "h3";
import {
	fetchCurrentUserAndGuildsWithRetry,
	fetchGuildMemberWithRetry,
	isDiscordUnauthorized,
} from "#server/utils/discord/oauth";

const fakeEvent = {} as H3Event;

const tokens = {
	access_token: "stale-access-token",
	refresh_token: "refresh-token",
	expires_in: 604_800,
	token_type: "Bearer",
	scope: "identify guilds",
};

const mockUser = { id: "user-1", username: "testuser" };
const mockGuilds = [
	{ id: "guild-1", name: "Guild 1", permissions: "8", features: [], owner: false },
];
const mockMember = { user: mockUser, roles: [] };

describe("isDiscordUnauthorized", () => {
	it("returns true for Discord 401 errors", () => {
		expect(isDiscordUnauthorized({ status: 401 })).toBe(true);
	});

	it("returns false for other Discord errors", () => {
		expect(isDiscordUnauthorized({ status: 500 })).toBe(false);
	});
});

describe("fetchCurrentUserAndGuildsWithRetry", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetCurrent.mockResolvedValue(mockUser);
		mockGetGuilds.mockResolvedValue(mockGuilds);
	});

	it("returns user and guilds without refreshing when the token is valid", async () => {
		const result = await fetchCurrentUserAndGuildsWithRetry(fakeEvent, tokens);

		expect(result).toEqual({ user: mockUser, guilds: mockGuilds });
		expect(mockRefreshSessionTokens).not.toHaveBeenCalled();
	});

	it("refreshes the token and retries after a Discord 401", async () => {
		mockGetGuilds
			.mockRejectedValueOnce(Object.assign(new Error("Unauthorized"), { status: 401 }))
			.mockResolvedValueOnce(mockGuilds);
		mockRefreshSessionTokens.mockResolvedValue({
			...tokens,
			access_token: "fresh-access-token",
		});

		const result = await fetchCurrentUserAndGuildsWithRetry(fakeEvent, tokens);

		expect(mockRefreshSessionTokens).toHaveBeenCalledWith(fakeEvent, { force: true });
		expect(result).toEqual({ user: mockUser, guilds: mockGuilds });
	});

	it("throws unauthorized when refresh does not produce a new token", async () => {
		mockGetGuilds.mockRejectedValue(Object.assign(new Error("Unauthorized"), { status: 401 }));
		mockRefreshSessionTokens.mockResolvedValue(null);

		await expect(fetchCurrentUserAndGuildsWithRetry(fakeEvent, tokens)).rejects.toMatchObject({
			status: 401,
		});
	});
});

describe("fetchGuildMemberWithRetry", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetGuildMember.mockResolvedValue(mockMember);
	});

	it("retries guild member fetch after a Discord 401", async () => {
		mockGetGuildMember
			.mockRejectedValueOnce(Object.assign(new Error("Unauthorized"), { status: 401 }))
			.mockResolvedValueOnce(mockMember);
		mockRefreshSessionTokens.mockResolvedValue({
			...tokens,
			access_token: "fresh-access-token",
		});

		const result = await fetchGuildMemberWithRetry(fakeEvent, tokens, "guild-1");

		expect(mockRefreshSessionTokens).toHaveBeenCalledWith(fakeEvent, { force: true });
		expect(result).toEqual(mockMember);
	});
});
