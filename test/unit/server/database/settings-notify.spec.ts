import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockWriteGuildData } = vi.hoisted(() => ({ mockWriteGuildData: vi.fn() }));

// `db.raw.sql` builds a query; the fake keeps its parts so the test can read them.
vi.mock("#server/database/prisma", () => ({
	db: {
		orm: {},
		raw: {
			sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({
				affectedCount: () => ({ build: () => ({ text: strings.join("?"), values }) }),
			}),
		},
	},
}));
vi.mock("#server/database/settings/storage", () => ({
	fetchGuildData: vi.fn(async (_db: unknown, id: string) => ({ id, language: "en-US" })),
	writeGuildData: mockWriteGuildData,
}));
vi.mock("#server/database/settings/context/functions", () => ({
	getSettingsContext: vi.fn(),
	updateSettingsContext: vi.fn(),
}));

import { writeSettingsTransaction } from "#server/database/settings/functions";
import { GUILD_SETTINGS_UPDATE_CHANNEL } from "#server/database/settings/notify";

const GUILD_ID = "123456789012345678";

/** Runs the `extra` callback `writeGuildData` got against a fake transaction, and returns what it executed. */
async function runExtra() {
	const extra = mockWriteGuildData.mock.calls.at(-1)?.[3] as
		| ((tx: { execute: (query: unknown) => Promise<void> }) => Promise<void>)
		| undefined;
	const executed: { text: string; values: unknown[] }[] = [];
	await extra?.({
		execute: async (query) => {
			executed.push(query as { text: string; values: unknown[] });
		},
	});
	return executed;
}

describe("the settings write tells the bot", () => {
	beforeEach(() => {
		mockWriteGuildData.mockReset();
	});

	it("notifies the guild and the changed keys in the write's transaction", async () => {
		using trx = await writeSettingsTransaction(GUILD_ID);
		await trx.write({ honeypotChannel: "222222222222222222", honeypotAction: "Ban" }).submit();

		const [notify] = await runExtra();
		expect(notify?.text).toContain("pg_notify");
		expect(notify?.values[0]).toBe(GUILD_SETTINGS_UPDATE_CHANNEL);
		expect(JSON.parse(String(notify?.values[1]))).toStrictEqual({
			guildId: GUILD_ID,
			keys: ["honeypotAction", "honeypotChannel"],
		});
	});

	it("runs the caller's own writes before the notify", async () => {
		const order: string[] = [];
		using trx = await writeSettingsTransaction(GUILD_ID);
		await trx.write({ language: "de" }).submit(async () => {
			order.push("extra");
		});

		const executed = await runExtra();
		order.push(...executed.map(() => "notify"));
		expect(order).toStrictEqual(["extra", "notify"]);
	});
});
