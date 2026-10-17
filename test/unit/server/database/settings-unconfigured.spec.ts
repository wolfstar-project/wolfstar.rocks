import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFetchGuildData, mockWriteGuildData } = vi.hoisted(() => ({
	mockFetchGuildData: vi.fn(),
	mockWriteGuildData: vi.fn(),
}));

vi.mock("#server/database/prisma", () => ({ db: { orm: {} } }));
vi.mock("#server/database/settings/storage", () => ({
	fetchGuildData: mockFetchGuildData,
	writeGuildData: mockWriteGuildData,
}));
vi.mock("#server/database/settings/context/functions", () => ({
	getSettingsContext: vi.fn(),
	updateSettingsContext: vi.fn(),
}));

import {
	isGuildUnconfigured,
	readSettings,
	writeSettingsTransaction,
} from "#server/database/settings/functions";

// The module keeps what it read, so each test takes a guild of its own.
let nextGuild = 100_000_000_000_000_000n;
function guildId() {
	nextGuild += 1n;
	return String(nextGuild);
}

describe("isGuildUnconfigured", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("is false for a guild that was not read yet", () => {
		expect(isGuildUnconfigured(guildId())).toBe(false);
	});

	it("is true once a read finds no rows, and the guild reads as the defaults", async () => {
		const id = guildId();
		mockFetchGuildData.mockResolvedValue(null);

		const settings = await readSettings(id);

		expect(settings.id).toBe(id);
		expect(isGuildUnconfigured(id)).toBe(true);
	});

	it("is false for a guild that has rows", async () => {
		const id = guildId();
		mockFetchGuildData.mockResolvedValue({ id, language: "it-IT" });

		await readSettings(id);

		expect(isGuildUnconfigured(id)).toBe(false);
	});

	it("turns false when a write goes through, and stays true when it fails", async () => {
		const id = guildId();
		mockFetchGuildData.mockResolvedValue(null);
		await readSettings(id);

		mockWriteGuildData.mockRejectedValueOnce(new Error("database down"));
		const failing = await writeSettingsTransaction(id);
		await expect(failing.write({ language: "it-IT" }).submit()).rejects.toThrow(
			"database down",
		);
		failing.dispose();
		expect(isGuildUnconfigured(id)).toBe(true);

		mockWriteGuildData.mockResolvedValueOnce(undefined);
		const working = await writeSettingsTransaction(id);
		await working.write({ language: "it-IT" }).submit();
		working.dispose();
		expect(isGuildUnconfigured(id)).toBe(false);
	});
});
