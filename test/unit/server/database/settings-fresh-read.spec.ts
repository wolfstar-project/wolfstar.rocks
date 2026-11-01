import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFetchGuildData } = vi.hoisted(() => ({ mockFetchGuildData: vi.fn() }));

vi.mock("#server/database/prisma", () => ({ db: { orm: {} } }));
vi.mock("#server/database/settings/storage", () => ({
	fetchGuildData: mockFetchGuildData,
	writeGuildData: vi.fn(),
}));
vi.mock("#server/database/settings/context/functions", () => ({
	getSettingsContext: vi.fn(),
	updateSettingsContext: vi.fn(),
}));

import { readFreshSettings, readSettings } from "#server/database/settings/functions";

const GUILD_ID = "123456789012345678";

describe("readFreshSettings", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// The bot and the other instances of the dashboard write the settings too,
	// and this process only learns of its own writes.
	it("reads what the database has now, where readSettings keeps what this process read", async () => {
		mockFetchGuildData.mockResolvedValueOnce({ id: GUILD_ID, language: "en-US" });
		expect((await readSettings(GUILD_ID)).language).toBe("en-US");

		mockFetchGuildData.mockResolvedValueOnce({ id: GUILD_ID, language: "de" });
		expect((await readSettings(GUILD_ID)).language).toBe("en-US");
		expect((await readFreshSettings(GUILD_ID)).language).toBe("de");
		expect((await readSettings(GUILD_ID)).language).toBe("de");
	});
});
