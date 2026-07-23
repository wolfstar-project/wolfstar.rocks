import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted() ensures globals are present before discord.ts is evaluated.
vi.hoisted(() => {
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
});

vi.mock("@sentry/nuxt", () => ({
	metrics: { count: vi.fn() },
	startSpan: vi.fn(),
}));

import type { APIGuild, APIGuildMember } from "discord-api-types/v10";
import { canManage } from "#server/utils/discord";

// Member with Administrator permission bit (8n), not the guild owner.
// With empty rolesAdmin, isAdmin falls back to the permission-bits path.
const guild = { id: "guild-123", owner_id: "owner-456", roles: [] } as unknown as APIGuild;
const adminMember = {
	user: { id: "member-789" },
	roles: [],
	permissions: "8", // PermissionFlagsBits.Administrator = 8n
} as unknown as APIGuildMember;

describe("canManage - Discord owner/admin/ManageGuild checks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("allows members with Administrator permission", async () => {
		await expect(canManage(guild, adminMember)).resolves.toBeUndefined();
	});

	it("owner short-circuit allows without permission bits", async () => {
		const ownerMember = {
			user: { id: "owner-456" },
			roles: [],
		} as unknown as APIGuildMember;

		await expect(canManage(guild, ownerMember)).resolves.toBeUndefined();
	});

	it("throws 403 when member lacks manage permissions", async () => {
		const nonAdminMember = {
			user: { id: "no-perms-user" },
			roles: [],
			permissions: "0",
		} as unknown as APIGuildMember;

		await expect(canManage(guild, nonAdminMember)).rejects.toMatchObject({ status: 403 });
	});
});
