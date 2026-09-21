import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetCurrent, mockGetGuilds, mockGetGuildMember } = vi.hoisted(() => {
	const mockGetCurrent = vi.fn();
	const mockGetGuilds = vi.fn();
	const mockGetGuildMember = vi.fn();

	return {
		mockGetCurrent,
		mockGetGuildMember,
		mockGetGuilds,
	};
});

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
	access_token: "access-token",
	refresh_token: "refresh-token",
	expires_in: 604_800,
	token_type: "Bearer",
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

	it("returns user and guilds when the token is valid", async () => {
		const result = await fetchCurrentUserAndGuildsWithRetry(fakeEvent, tokens);

		expect(result).toEqual({ user: mockUser, guilds: mockGuilds });
	});

	it("throws unauthorized on Discord 401 without local token refresh", async () => {
		mockGetGuilds.mockRejectedValue(Object.assign(new Error("Unauthorized"), { status: 401 }));

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

	it("returns the guild member when the token is valid", async () => {
		const result = await fetchGuildMemberWithRetry(fakeEvent, tokens, "guild-1");

		expect(result).toEqual(mockMember);
	});

	it("throws unauthorized on Discord 401 without local token refresh", async () => {
		mockGetGuildMember.mockRejectedValue(
			Object.assign(new Error("Unauthorized"), { status: 401 }),
		);

		await expect(fetchGuildMemberWithRetry(fakeEvent, tokens, "guild-1")).rejects.toMatchObject(
			{
				status: 401,
			},
		);
	});
});
