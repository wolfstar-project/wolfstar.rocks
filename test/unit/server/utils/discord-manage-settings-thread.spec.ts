import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted() ensures globals are present before discord.ts is evaluated.
const { mockReadSettings, mockReadSettingsPermissionNodes } = vi.hoisted(() => {
	const mockReadSettings = vi.fn();
	const mockReadSettingsPermissionNodes = vi.fn();

	(globalThis as Record<string, unknown>).defineCachedFunction = (fn: unknown) => fn;
	(globalThis as Record<string, unknown>).hours = (n: number) => n * 3600;
	(globalThis as Record<string, unknown>).useApi = () => ({
		guilds: { get: vi.fn(), getChannels: vi.fn(), getMember: vi.fn() },
		users: { getCurrent: vi.fn(), getGuilds: vi.fn(), getGuildMember: vi.fn() },
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
	(globalThis as Record<string, unknown>).flattenGuild = (guild: Record<string, unknown>) =>
		guild;
	(globalThis as Record<string, unknown>).guildNameToAcronym = (name: string) =>
		name.slice(0, 2).toUpperCase();

	return { mockReadSettings, mockReadSettingsPermissionNodes };
});

vi.mock("@sentry/nuxt", () => ({
	metrics: { count: vi.fn() },
	startSpan: vi.fn(),
}));

vi.mock("#server/database", () => ({
	readSettings: mockReadSettings,
	readSettingsPermissionNodes: mockReadSettingsPermissionNodes,
}));

import type { ReadonlyGuildData } from "#server/database";
import type { APIGuild, APIGuildMember } from "discord-api-types/v10";
import { canManage } from "#server/utils/discord";

// Member with Administrator permission bit (8n), not the guild owner.
// With rolesAdmin: [], isAdmin falls back to the permission-bits path.
const guild = { id: "guild-123", owner_id: "owner-456", roles: [] } as unknown as APIGuild;
const adminMember = {
	user: { id: "member-789" },
	roles: [],
	permissions: "8", // PermissionFlagsBits.Administrator = 8n
} as unknown as APIGuildMember;

const mockSettings = {
	id: "guild-123",
	rolesAdmin: [],
	permissionsRoles: [],
	permissionsUsers: [],
} as unknown as ReadonlyGuildData;

describe("canManage - settings threading through manage()", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// nodes.run returns null → null ?? true → manage returns true when isAdmin passes.
		mockReadSettingsPermissionNodes.mockReturnValue({
			run: vi.fn().mockResolvedValue(null),
		});
	});

	it("does not call readSettings when pre-loaded settings are provided", async () => {
		await canManage(guild, adminMember, mockSettings);

		expect(mockReadSettings).not.toHaveBeenCalled();
	});

	it("calls readSettings exactly once when no settings are provided", async () => {
		mockReadSettings.mockResolvedValue(mockSettings);

		await canManage(guild, adminMember);

		expect(mockReadSettings).toHaveBeenCalledOnce();
		expect(mockReadSettings).toHaveBeenCalledWith("guild-123");
	});

	it("owner short-circuit returns without calling readSettings", async () => {
		const ownerMember = {
			user: { id: "owner-456" },
			roles: [],
		} as unknown as APIGuildMember;

		await canManage(guild, ownerMember);

		expect(mockReadSettings).not.toHaveBeenCalled();
	});

	it("throws 403 when member lacks manage permissions and readSettings is called", async () => {
		const nonAdminMember = {
			user: { id: "no-perms-user" },
			roles: [],
			permissions: "0",
		} as unknown as APIGuildMember;

		mockReadSettings.mockResolvedValue(mockSettings);

		await expect(canManage(guild, nonAdminMember)).rejects.toMatchObject({ status: 403 });
		expect(mockReadSettings).toHaveBeenCalledOnce();
	});

	it("does not call readSettings when pre-loaded settings are passed and member lacks permissions", async () => {
		const nonAdminMember = {
			user: { id: "no-perms-user" },
			roles: [],
			permissions: "0",
		} as unknown as APIGuildMember;

		await expect(canManage(guild, nonAdminMember, mockSettings)).rejects.toMatchObject({
			status: 403,
		});
		expect(mockReadSettings).not.toHaveBeenCalled();
	});
});
