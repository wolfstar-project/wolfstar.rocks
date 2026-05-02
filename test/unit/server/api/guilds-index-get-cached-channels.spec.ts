import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted() ensures globals are present before the route module is evaluated.
const {
	mockReadSettings,
	mockGetGuild,
	mockGetCurrentMember,
	mockCanManage,
	mockGetGuildChannels,
	mockFlattenGuild,
	mockTransformGuild,
	mockGetValidatedQuery,
} = vi.hoisted(() => {
	const mockReadSettings = vi.fn();
	const mockGetGuild = vi.fn();
	const mockGetCurrentMember = vi.fn();
	const mockCanManage = vi.fn().mockResolvedValue(undefined);
	const mockGetGuildChannels = vi.fn();
	const mockFlattenGuild = vi.fn();
	const mockTransformGuild = vi.fn();
	const mockGetValidatedQuery = vi.fn();

	(globalThis as Record<string, unknown>).defineWrappedResponseHandler = (fn: unknown) => fn;
	(globalThis as Record<string, unknown>).getGuildParam = vi.fn().mockReturnValue("guild-123");
	(globalThis as Record<string, unknown>).getGuild = mockGetGuild;
	(globalThis as Record<string, unknown>).getCurrentMember = mockGetCurrentMember;
	(globalThis as Record<string, unknown>).canManage = mockCanManage;
	(globalThis as Record<string, unknown>).getGuildChannels = mockGetGuildChannels;
	(globalThis as Record<string, unknown>).flattenGuild = mockFlattenGuild;
	(globalThis as Record<string, unknown>).transformGuild = mockTransformGuild;
	(globalThis as Record<string, unknown>).getValidatedQuery = mockGetValidatedQuery;
	(globalThis as Record<string, unknown>).seconds = (n: number) => n;

	return {
		mockReadSettings,
		mockGetGuild,
		mockGetCurrentMember,
		mockCanManage,
		mockGetGuildChannels,
		mockFlattenGuild,
		mockTransformGuild,
		mockGetValidatedQuery,
	};
});

vi.mock("#server/database", () => ({
	readSettings: mockReadSettings,
}));

vi.mock("evlog", () => ({
	useLogger: vi.fn().mockReturnValue({ set: vi.fn(), error: vi.fn() }),
	createError: vi.fn((opts: Record<string, unknown>) =>
		Object.assign(new Error(String(opts["message"])), opts),
	),
}));

import type { H3Event } from "h3";
import indexGetHandler from "#server/api/guilds/[guild]/index.get";

const callHandler = indexGetHandler as unknown as (event: H3Event) => Promise<unknown>;

const mockGuild = { id: "guild-123", owner_id: "owner-456", roles: [] };
const mockMember = { user: { id: "user-789" }, roles: [], permissions: "8" };
const mockSettings = { id: "guild-123", rolesAdmin: [] };
const mockChannels = [{ id: "ch-1", name: "general" }];
const mockFlatResult = { id: "guild-123", channels: mockChannels };
const mockTransformResult = { id: "guild-123", manageable: true, wolfstarIsIn: true, channels: [] };

describe("index.get - cached getGuildChannels and readSettings deduplication", () => {
	const mockEvent = {} as H3Event;

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetGuild.mockResolvedValue(mockGuild);
		mockGetCurrentMember.mockResolvedValue(mockMember);
		mockReadSettings.mockResolvedValue(mockSettings);
		mockGetGuildChannels.mockResolvedValue(mockChannels);
		mockCanManage.mockResolvedValue(undefined);
		mockFlattenGuild.mockReturnValue(mockFlatResult);
		mockTransformGuild.mockResolvedValue(mockTransformResult);
		// Default: shouldSerialize false
		mockGetValidatedQuery.mockResolvedValue({ shouldSerialize: false });
	});

	it("calls getGuildChannels (not api.guilds.getChannels) to fetch channels", async () => {
		await callHandler(mockEvent);

		expect(mockGetGuildChannels).toHaveBeenCalledOnce();
		expect(mockGetGuildChannels).toHaveBeenCalledWith("guild-123");
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

	describe("shouldSerialize: false", () => {
		it("calls flattenGuild with the guild merged with pre-fetched channels", async () => {
			await callHandler(mockEvent);

			expect(mockFlattenGuild).toHaveBeenCalledOnce();
			expect(mockFlattenGuild).toHaveBeenCalledWith({ ...mockGuild, channels: mockChannels });
		});

		it("does not call transformGuild", async () => {
			await callHandler(mockEvent);

			expect(mockTransformGuild).not.toHaveBeenCalled();
		});
	});

	describe("shouldSerialize: true", () => {
		beforeEach(() => {
			mockGetValidatedQuery.mockResolvedValue({ shouldSerialize: true });
		});

		it("calls transformGuild with includeChannels: false and pre-fetched data", async () => {
			await callHandler(mockEvent);

			expect(mockTransformGuild).toHaveBeenCalledOnce();
			expect(mockTransformGuild).toHaveBeenCalledWith(mockMember.user.id, mockGuild, {
				includeChannels: false,
				prefetchedGuild: mockGuild,
				prefetchedMember: mockMember,
				prefetchedSettings: mockSettings,
			});
		});

		it("merges pre-fetched channels onto the transformGuild result", async () => {
			const result = await callHandler(mockEvent);

			expect(result).toMatchObject({ ...mockTransformResult, channels: mockChannels });
		});

		it("does not call flattenGuild", async () => {
			await callHandler(mockEvent);

			expect(mockFlattenGuild).not.toHaveBeenCalled();
		});
	});

	describe("authorization ordering", () => {
		it("does not call getGuildChannels when canManage denies the request", async () => {
			const forbiddenError = Object.assign(new Error("Insufficient permissions"), {
				status: 403,
			});
			mockCanManage.mockRejectedValue(forbiddenError);

			await expect(callHandler(mockEvent)).rejects.toMatchObject({ status: 403 });
			expect(mockGetGuildChannels).not.toHaveBeenCalled();
		});
	});
});
