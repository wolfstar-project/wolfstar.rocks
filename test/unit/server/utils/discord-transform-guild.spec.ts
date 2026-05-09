import { beforeEach, describe, expect, it, vi } from "vitest";

// All Nuxt server auto-import globals that discord.ts uses at module-init time
// (defineCachedFunction / hours) must be present before the module is evaluated.
// vi.hoisted() runs before any static import is resolved.
const { mockGetChannels, mockGuildsGet } = vi.hoisted(() => {
	const mockGetChannels = vi.fn();
	const mockGuildsGet = vi.fn();

	(globalThis as Record<string, unknown>).defineCachedFunction = (fn: unknown) => fn;
	(globalThis as Record<string, unknown>).hours = (n: number) => n * 3600;
	(globalThis as Record<string, unknown>).useApi = () => ({
		guilds: {
			get: mockGuildsGet,
			getChannels: mockGetChannels,
			getMember: vi.fn().mockRejectedValue(new Error("no member")),
		},
		users: {
			getCurrent: vi.fn(),
			getGuilds: vi.fn(),
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
	(globalThis as Record<string, unknown>).flattenGuild = (guild: Record<string, unknown>) => ({
		...guild,
		acronym: "TG",
		emojis: [],
		roles: [],
	});
	(globalThis as Record<string, unknown>).guildNameToAcronym = (name: string) =>
		name.slice(0, 2).toUpperCase();

	return { mockGetChannels, mockGuildsGet };
});

vi.mock("@sentry/nuxt", () => ({
	metrics: { count: vi.fn() },
	startSpan: vi.fn(),
}));

vi.mock("#server/database", () => ({
	readSettings: vi.fn().mockResolvedValue({ rolesAdmin: [] }),
	readSettingsPermissionNodes: vi.fn().mockReturnValue({
		run: vi.fn().mockResolvedValue(null),
	}),
}));

import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import { transformGuild } from "#server/utils/discord";

const userId = "user-123";

// oauthGuild.owner: true ensures getManageable short-circuits to true
// without calling manage/getMember/readSettings — isolating includeChannels behaviour.
const oauthGuild: RESTAPIPartialCurrentUserGuild = {
	id: "guild-456",
	name: "Test Guild",
	icon: null,
	owner: true,
	permissions: "8",
	features: [],
};

const mockApiGuild = {
	id: "guild-456",
	name: "Test Guild",
	owner_id: "owner-789",
	roles: [],
	channels: [],
	emojis: [],
	features: [],
	icon: null,
};

describe("transformGuild", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("does not call getGuildChannels and returns channels:[] when includeChannels is false", async () => {
		mockGuildsGet.mockResolvedValue(mockApiGuild);

		const result = await transformGuild(userId, oauthGuild, { includeChannels: false });

		expect(mockGetChannels).not.toHaveBeenCalled();
		expect(result.channels).toEqual([]);
	});

	it("calls getGuildChannels exactly once when includeChannels is true", async () => {
		mockGuildsGet.mockResolvedValue(mockApiGuild);
		mockGetChannels.mockResolvedValue([{ id: "chan-1", name: "general" }]);

		const result = await transformGuild(userId, oauthGuild, { includeChannels: true });

		expect(mockGetChannels).toHaveBeenCalledOnce();
		expect(mockGetChannels).toHaveBeenCalledWith(oauthGuild.id);
		expect(Array.isArray(result.channels)).toBe(true);
	});

	it("calls getGuildChannels exactly once when options are omitted", async () => {
		mockGuildsGet.mockResolvedValue(mockApiGuild);
		mockGetChannels.mockResolvedValue([]);

		await transformGuild(userId, oauthGuild);

		expect(mockGetChannels).toHaveBeenCalledOnce();
	});

	it("response shape always includes manageable, permissions, wolfstarIsIn, and channels", async () => {
		mockGuildsGet.mockResolvedValue(mockApiGuild);
		mockGetChannels.mockResolvedValue([]);

		const result = await transformGuild(userId, oauthGuild);

		expect(result).toHaveProperty("manageable");
		expect(result).toHaveProperty("permissions");
		expect(result).toHaveProperty("wolfstarIsIn");
		expect(result).toHaveProperty("channels");
	});

	it("returns channels:[] and wolfstarIsIn:false when guild is not in bot", async () => {
		mockGuildsGet.mockRejectedValue(Object.assign(new Error("Not found"), { status: 404 }));

		const result = await transformGuild(userId, oauthGuild, { includeChannels: false });

		expect(result.wolfstarIsIn).toBe(false);
		expect(result.manageable).toBe(true);
		expect(result.channels).toEqual([]);
		expect(mockGetChannels).not.toHaveBeenCalled();
	});
});
