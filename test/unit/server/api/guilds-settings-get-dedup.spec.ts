import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted() ensures globals are present before the route module is evaluated.
const {
	mockReadSettings,
	mockSerializeSettings,
	mockGetGuild,
	mockGetCurrentMember,
	mockCanManage,
} = vi.hoisted(() => {
	const mockReadSettings = vi.fn();
	const mockSerializeSettings = vi.fn();
	const mockGetGuild = vi.fn();
	const mockGetCurrentMember = vi.fn();
	const mockCanManage = vi.fn().mockResolvedValue(undefined);

	(globalThis as Record<string, unknown>).defineWrappedResponseHandler = (fn: unknown) => fn;
	(globalThis as Record<string, unknown>).getGuildParam = vi.fn().mockReturnValue("guild-123");
	(globalThis as Record<string, unknown>).getGuild = mockGetGuild;
	(globalThis as Record<string, unknown>).getCurrentMember = mockGetCurrentMember;
	(globalThis as Record<string, unknown>).canManage = mockCanManage;
	(globalThis as Record<string, unknown>).seconds = (n: number) => n;

	return {
		mockReadSettings,
		mockSerializeSettings,
		mockGetGuild,
		mockGetCurrentMember,
		mockCanManage,
	};
});

vi.mock("#server/database", () => ({
	readSettings: mockReadSettings,
	serializeSettings: mockSerializeSettings,
}));

vi.mock("evlog", () => ({
	useLogger: vi.fn().mockReturnValue({ set: vi.fn(), error: vi.fn() }),
}));

import type { H3Event } from "h3";
import settingsGetHandler from "#server/api/guilds/[guild]/settings.get";

const callHandler = settingsGetHandler as unknown as (event: H3Event) => Promise<unknown>;

const mockGuild = { id: "guild-123", owner_id: "owner-456", roles: [] };
const mockMember = { user: { id: "user-789" }, roles: [], permissions: "8" };
const mockSettings = { id: "guild-123", rolesAdmin: [] };

describe("settings.get - readSettings deduplication", () => {
	const mockEvent = {} as H3Event;

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetGuild.mockResolvedValue(mockGuild);
		mockGetCurrentMember.mockResolvedValue(mockMember);
		mockReadSettings.mockResolvedValue(mockSettings);
		mockSerializeSettings.mockReturnValue(JSON.stringify(mockSettings));
		mockCanManage.mockResolvedValue(undefined);
	});

	it("calls readSettings exactly once per request", async () => {
		await callHandler(mockEvent);

		expect(mockReadSettings).toHaveBeenCalledOnce();
		expect(mockReadSettings).toHaveBeenCalledWith("guild-123");
	});

	it("passes pre-fetched settings to canManage as third argument", async () => {
		await callHandler(mockEvent);

		expect(mockCanManage).toHaveBeenCalledOnce();
		expect(mockCanManage).toHaveBeenCalledWith(mockGuild, mockMember, mockSettings);
	});

	it("returns the result of serializeSettings called with the pre-fetched settings", async () => {
		const expected = JSON.stringify(mockSettings);

		const result = await callHandler(mockEvent);

		expect(mockSerializeSettings).toHaveBeenCalledOnce();
		expect(mockSerializeSettings).toHaveBeenCalledWith(mockSettings);
		expect(result).toBe(expected);
	});
});
