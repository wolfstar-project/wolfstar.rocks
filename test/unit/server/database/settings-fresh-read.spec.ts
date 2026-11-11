import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFetchGuildData } = vi.hoisted(() => ({ mockFetchGuildData: vi.fn() }));

vi.mock("#server/database/prisma", () => ({ db: { orm: {} } }));
vi.mock("#server/database/settings/storage", () => ({
	fetchGuildData: mockFetchGuildData,
	writeGuildData: vi.fn(async () => undefined),
}));
vi.mock("#server/database/settings/context/functions", () => ({
	getSettingsContext: vi.fn(),
	updateSettingsContext: vi.fn(),
}));

import {
	isGuildUnconfigured,
	readFreshSettings,
	readSettings,
	writeSettingsTransaction,
} from "#server/database/settings/functions";

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

	// A read that started before a write holds the settings as they were: once
	// the write is saved, the cache keeps the written copy, not that read's.
	it("does not cache a read that a write overtook", async () => {
		const guild = "223456789012345678";
		mockFetchGuildData.mockResolvedValueOnce({ id: guild, language: "en-US" });
		{
			using trx = await writeSettingsTransaction(guild);
			let answer: (value: unknown) => void = () => undefined;
			mockFetchGuildData.mockReturnValueOnce(new Promise((resolve) => (answer = resolve)));
			const overlapping = readFreshSettings(guild);

			await trx.write({ language: "de" }).submit();
			answer({ id: guild, language: "en-US" });
			expect((await overlapping).language).toBe("en-US");
		}

		expect((await readSettings(guild)).language).toBe("de");
	});

	// The read found no rows, then the guild's first write landed: the guild is
	// configured, whatever that read saw.
	it("does not call a guild unconfigured from a read its first write overtook", async () => {
		const guild = "323456789012345678";
		mockFetchGuildData.mockResolvedValueOnce(null);
		{
			using trx = await writeSettingsTransaction(guild);
			let answer: (value: unknown) => void = () => undefined;
			mockFetchGuildData.mockReturnValueOnce(new Promise((resolve) => (answer = resolve)));
			const overlapping = readFreshSettings(guild);

			await trx.write({ language: "de" }).submit();
			answer(null);
			await overlapping;
		}

		expect(isGuildUnconfigured(guild)).toBe(false);
	});
});
