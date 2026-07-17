import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFetchBotApi, mockUseLoggerSet } = vi.hoisted(() => {
	const mockFetchBotApi = vi.fn();
	const mockUseLoggerSet = vi.fn();

	(globalThis as Record<string, unknown>).defineWrappedResponseHandler = (fn: unknown) => fn;
	(globalThis as Record<string, unknown>).getGuildParam = vi.fn().mockReturnValue("guild-123");
	(globalThis as Record<string, unknown>).fetchBotApi = mockFetchBotApi;
	(globalThis as Record<string, unknown>).seconds = (n: number) => n;

	return { mockFetchBotApi, mockUseLoggerSet };
});

vi.mock("evlog", () => ({
	useLogger: vi.fn().mockReturnValue({ set: mockUseLoggerSet, error: vi.fn() }),
	createError: vi.fn((opts: Record<string, unknown>) =>
		Object.assign(new Error(String(opts["message"])), opts),
	),
}));

import type { H3Event } from "h3";
import settingsGetHandler from "#server/api/guilds/[guild]/settings.get";

const callHandler = settingsGetHandler as unknown as (event: H3Event) => Promise<unknown>;

describe("settings.get - bot API proxy", () => {
	const mockEvent = {} as H3Event;

	beforeEach(() => {
		vi.clearAllMocks();
		mockFetchBotApi.mockResolvedValue('{"id":"guild-123","prefix":"!"}');
	});

	it("proxies to /guilds/:guild/settings on the internal bot API", async () => {
		await callHandler(mockEvent);

		expect(mockFetchBotApi).toHaveBeenCalledWith(mockEvent, "/guilds/guild-123/settings");
	});

	it("returns the bot API response unchanged", async () => {
		const result = await callHandler(mockEvent);
		expect(result).toBe('{"id":"guild-123","prefix":"!"}');
	});
});
