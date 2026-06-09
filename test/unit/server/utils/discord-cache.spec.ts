import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockRemoveItem } = vi.hoisted(() => {
	const mockRemoveItem = vi.fn();
	(globalThis as Record<string, unknown>).useStorage = () => ({
		removeItem: mockRemoveItem,
	});
	return { mockRemoveItem };
});

import { invalidateCurrentUserCache, invalidateGuildCache } from "#server/utils/discord-cache";

describe("invalidateCurrentUserCache", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("removes the named getCurrentUser cache entry for the user", async () => {
		await invalidateCurrentUserCache("123456789012345678");

		expect(mockRemoveItem).toHaveBeenCalledWith(
			"/cache:nitro/functions:getCurrentUser:123456789012345678.json",
		);
	});
});

describe("invalidateGuildCache", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("removes the named getGuild cache entry for the guild", async () => {
		await invalidateGuildCache("123456789012345678");

		expect(mockRemoveItem).toHaveBeenCalledWith(
			"/cache:nitro/functions:getGuild:guild:123456789012345678.json",
		);
	});
});
