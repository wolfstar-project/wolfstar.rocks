import type { WarnThreshold } from "#shared/utils/warn-thresholds";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Every write runs in a transaction that first takes the advisory lock of the
// guild's thresholds, then tells the bot what changed.
const database = vi.hoisted(() => {
	const tx = { execute: vi.fn(), orm: { transaction: true } };
	return {
		sql: vi.fn((_strings: TemplateStringsArray, ...values: unknown[]) => ({
			affectedCount: () => ({ build: () => ({ values }) }),
		})),
		tx,
	};
});
vi.mock("#server/database/prisma", () => ({
	db: {
		orm: {},
		raw: { sql: database.sql },
		transaction: (run: (tx: typeof database.tx) => unknown) => run(database.tx),
	},
}));

const storage = vi.hoisted(() => ({
	fetchWarnThresholds: vi.fn(),
	removeWarnThreshold: vi.fn(),
	upsertWarnThreshold: vi.fn(),
}));
vi.mock("#server/database/settings/warnings/storage", () => storage);

import {
	clearWarnThreshold,
	setWarnThreshold,
	WarnThresholdError,
} from "#server/utils/warn-thresholds";

const GUILD_ID = "123456789012345678";

function threshold(count: number): WarnThreshold {
	return { action: "Kick", count, duration: null, period: 0 };
}

async function codeOf(promise: Promise<unknown>) {
	const error = await promise.catch((caught: unknown) => caught);
	expect(error).toBeInstanceOf(WarnThresholdError);
	return (error as WarnThresholdError).code;
}

function notifiedPayloads() {
	return database.sql.mock.calls
		.filter(([strings]) => strings.join("?").includes("pg_notify"))
		.map(([, , payload]) => JSON.parse(payload as string) as unknown);
}

describe("warning threshold writes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		storage.upsertWarnThreshold.mockImplementation(
			async (_orm: unknown, _guild: string, count: number, data: object) => ({
				count,
				...data,
			}),
		);
	});

	describe("setWarnThreshold", () => {
		it("adds a threshold, says there was none, and tells the bot", async () => {
			storage.fetchWarnThresholds.mockResolvedValue([]);

			const change = await setWarnThreshold(GUILD_ID, 3, {
				action: "Mute",
				duration: 1800,
				period: 0,
			});

			expect(change).toEqual({
				after: { action: "Mute", count: 3, duration: 1800, period: 0 },
				before: null,
			});
			expect(notifiedPayloads()).toEqual([{ guildId: GUILD_ID, keys: ["warnThresholds"] }]);
		});

		it("refuses an eleventh threshold, but still replaces one of the ten", async () => {
			const existing = Array.from({ length: 10 }, (_, index) => threshold(index + 1));
			storage.fetchWarnThresholds.mockResolvedValue(existing);
			const data = { action: "Ban" as const, duration: null, period: 0 };

			expect(await codeOf(setWarnThreshold(GUILD_ID, 20, data))).toBe("limit");
			expect(storage.upsertWarnThreshold).not.toHaveBeenCalled();

			const change = await setWarnThreshold(GUILD_ID, 4, data);
			expect(change.before).toBe(existing[3]);
		});
	});

	describe("clearWarnThreshold", () => {
		it("removes a threshold and answers with it", async () => {
			const existing = threshold(5);
			storage.fetchWarnThresholds.mockResolvedValue([existing]);
			storage.removeWarnThreshold.mockResolvedValue(true);

			expect(await clearWarnThreshold(GUILD_ID, 5)).toBe(existing);
			expect(storage.removeWarnThreshold).toHaveBeenCalledWith(database.tx.orm, GUILD_ID, 5);
		});

		it("says a number with no threshold is unknown", async () => {
			storage.fetchWarnThresholds.mockResolvedValue([threshold(5)]);

			expect(await codeOf(clearWarnThreshold(GUILD_ID, 6))).toBe("unknown");
			expect(storage.removeWarnThreshold).not.toHaveBeenCalled();
		});
	});
});
