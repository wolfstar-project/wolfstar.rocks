import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFetchBotApi, mockGetQuery, mockUseLoggerSet } = vi.hoisted(() => {
	const mockFetchBotApi = vi.fn();
	const mockGetQuery = vi.fn().mockReturnValue({});
	const mockUseLoggerSet = vi.fn();

	(globalThis as Record<string, unknown>).defineWrappedResponseHandler = (fn: unknown) => fn;
	(globalThis as Record<string, unknown>).getGuildParam = vi.fn().mockReturnValue("guild-123");
	(globalThis as Record<string, unknown>).getQuery = mockGetQuery;
	(globalThis as Record<string, unknown>).fetchBotApi = mockFetchBotApi;
	(globalThis as Record<string, unknown>).seconds = (n: number) => n;

	return { mockFetchBotApi, mockGetQuery, mockUseLoggerSet };
});

vi.mock("evlog", () => ({
	useLogger: vi.fn().mockReturnValue({ set: mockUseLoggerSet, error: vi.fn() }),
	createError: vi.fn((opts: Record<string, unknown>) =>
		Object.assign(new Error(String(opts["message"])), opts),
	),
}));

import type { H3Event } from "h3";
import indexGetHandler from "#server/api/guilds/[guild]/index.get";

const callHandler = indexGetHandler as unknown as (event: H3Event) => Promise<unknown>;

describe("index.get - bot API proxy", () => {
	const mockEvent = {} as H3Event;

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetQuery.mockReturnValue({ shouldSerialize: "true" });
		mockFetchBotApi.mockResolvedValue({ id: "guild-123", name: "Test" });
	});

	it("proxies to /guilds/:guild on the internal bot API", async () => {
		await callHandler(mockEvent);

		expect(mockFetchBotApi).toHaveBeenCalledWith(mockEvent, "/guilds/guild-123", {
			query: { shouldSerialize: "true" },
		});
	});

	it("returns the bot API response unchanged", async () => {
		const result = await callHandler(mockEvent);
		expect(result).toStrictEqual({ id: "guild-123", name: "Test" });
	});
});
