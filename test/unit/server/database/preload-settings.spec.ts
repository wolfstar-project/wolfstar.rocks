import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();
const mockGetSettingsContext = vi.fn();

vi.mock("#server/database/prisma", () => ({
	default: {
		guild: {
			findMany: mockFindMany,
			findUnique: mockFindUnique,
		},
	},
}));

vi.mock("#server/database/settings/context/functions", () => ({
	getSettingsContext: mockGetSettingsContext,
	updateSettingsContext: vi.fn(),
}));

describe("preloadSettingsForGuilds", () => {
	beforeEach(() => {
		vi.resetModules();
		mockFindMany.mockReset();
		mockFindUnique.mockReset();
		mockGetSettingsContext.mockReset();
	});

	it("loads existing guilds with a single findMany query", async () => {
		mockFindMany.mockResolvedValue([
			{ id: "guild-1", rolesAdmin: [] },
			{ id: "guild-2", rolesAdmin: [] },
		]);

		const { preloadSettingsForGuilds, readSettings } =
			await import("#server/database/settings/functions");

		await preloadSettingsForGuilds(["guild-1", "guild-2"]);

		expect(mockFindMany).toHaveBeenCalledOnce();
		expect(mockFindMany).toHaveBeenCalledWith({
			where: { id: { in: ["guild-1", "guild-2"] } },
		});
		expect(mockFindUnique).not.toHaveBeenCalled();
		expect(await readSettings("guild-1")).toMatchObject({ id: "guild-1" });
	});

	it("deduplicates guild ids before querying", async () => {
		mockFindMany.mockResolvedValue([{ id: "guild-1", rolesAdmin: [] }]);

		const { preloadSettingsForGuilds } = await import("#server/database/settings/functions");

		await preloadSettingsForGuilds(["guild-1", "guild-1", "guild-1"]);

		expect(mockFindMany).toHaveBeenCalledOnce();
		expect(mockFindMany).toHaveBeenCalledWith({
			where: { id: { in: ["guild-1"] } },
		});
	});

	it("seeds default settings for guilds missing from the database", async () => {
		mockFindMany.mockResolvedValue([]);

		const { preloadSettingsForGuilds, readSettings } =
			await import("#server/database/settings/functions");

		await preloadSettingsForGuilds(["guild-new"]);

		expect(mockFindMany).toHaveBeenCalledOnce();
		expect(mockFindUnique).not.toHaveBeenCalled();
		expect(await readSettings("guild-new")).toMatchObject({ id: "guild-new" });
	});

	it("skips the database when every guild is already cached", async () => {
		mockFindMany.mockResolvedValue([{ id: "guild-1", rolesAdmin: [] }]);

		const { preloadSettingsForGuilds } = await import("#server/database/settings/functions");

		await preloadSettingsForGuilds(["guild-1"]);
		mockFindMany.mockClear();

		await preloadSettingsForGuilds(["guild-1"]);

		expect(mockFindMany).not.toHaveBeenCalled();
	});
});
