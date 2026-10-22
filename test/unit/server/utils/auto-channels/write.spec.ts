import type { AutoDelete, AutoMessage, AutoPurge } from "#shared/utils/auto-channels";
import { ChannelType } from "discord-api-types/v10";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Every write runs in a transaction that first takes the advisory lock of its
// table for the guild.
const database = vi.hoisted(() => {
	const tx = { execute: vi.fn(), orm: { transaction: true } };
	return {
		lockQuery: vi.fn((_strings: TemplateStringsArray, ...keys: number[]) => ({
			affectedCount: () => ({ build: () => ({ keys }) }),
		})),
		tx,
	};
});
vi.mock("#server/database/prisma", () => ({
	db: {
		orm: {},
		raw: { sql: database.lockQuery },
		transaction: (run: (tx: typeof database.tx) => unknown) => run(database.tx),
	},
}));

const cleanup = vi.hoisted(() => ({
	fetchAutoDeletes: vi.fn(),
	fetchAutoPurges: vi.fn(),
	removeAutoDelete: vi.fn(),
	removeAutoPurge: vi.fn(),
	upsertAutoDelete: vi.fn(),
	upsertAutoPurge: vi.fn(),
}));
vi.mock("#server/database/settings/cleanup/storage", () => cleanup);

const messages = vi.hoisted(() => ({
	fetchAutoMessages: vi.fn(),
	removeAutoMessage: vi.fn(),
	upsertAutoMessage: vi.fn(),
}));
vi.mock("#server/database/settings/messages/storage", () => messages);

import {
	assertGuildTextChannel,
	AutoChannelError,
	clearAutoChannel,
	setAutoDelete,
	setAutoMessage,
	setAutoPurge,
} from "#server/utils/auto-channels/write";

const GUILD_ID = "123456789012345678";
const NOW = Date.parse("2026-10-22T12:00:00Z");

function autoDelete(channelId: string): AutoDelete {
	return { allow: [], bots: false, channelId, delay: 60, id: channelId.slice(-3) };
}

function autoPurge(channelId: string, interval: number, nextRunAt: string): AutoPurge {
	return { channelId, filter: "any", id: "1", interval, nextRunAt, value: null };
}

async function codeOf(promise: Promise<unknown>) {
	const error = await promise.catch((caught: unknown) => caught);
	expect(error).toBeInstanceOf(AutoChannelError);
	return (error as AutoChannelError).code;
}

describe("automatic channel writes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
		cleanup.upsertAutoDelete.mockImplementation(
			async (_orm: unknown, _guild: string, channelId: string, data: object) => ({
				...data,
				channelId,
				id: "9",
			}),
		);
		cleanup.upsertAutoPurge.mockImplementation(
			async (
				_orm: unknown,
				_guild: string,
				channelId: string,
				data: object,
				next: number,
			) => ({
				...data,
				channelId,
				id: "9",
				nextRunAt: new Date(next).toISOString(),
			}),
		);
		messages.upsertAutoMessage.mockImplementation(
			async (
				_orm: unknown,
				_guild: string,
				channelId: string,
				data: object,
				next: number,
			) => ({
				...data,
				channelId,
				id: "9",
				nextRunAt: new Date(next).toISOString(),
			}),
		);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("setAutoDelete", () => {
		it("adds a channel, and tells there was none before", async () => {
			cleanup.fetchAutoDeletes.mockResolvedValue([]);

			const change = await setAutoDelete(GUILD_ID, "111111111111111111", {
				allow: ["links"],
				bots: true,
				delay: 30,
			});

			expect(change.before).toBeNull();
			expect(change.after).toMatchObject({ bots: true, channelId: "111111111111111111" });
		});

		it("refuses a 26th channel, but still edits one of the 25", async () => {
			const rows = Array.from({ length: 25 }, (_, index) =>
				autoDelete(String(100_000_000_000_000_000n + BigInt(index))),
			);
			cleanup.fetchAutoDeletes.mockResolvedValue(rows);
			const data = { allow: [], bots: false, delay: 0 };

			expect(await codeOf(setAutoDelete(GUILD_ID, "222222222222222222", data))).toBe("limit");
			expect(cleanup.upsertAutoDelete).not.toHaveBeenCalled();

			const change = await setAutoDelete(GUILD_ID, rows[0]!.channelId, data);
			expect(change.before).toBe(rows[0]);
		});

		// Each table locks under its own namespace, so the tables do not wait
		// for each other.
		it("writes under the lock of its table and guild", async () => {
			cleanup.fetchAutoDeletes.mockResolvedValue([]);
			messages.fetchAutoMessages.mockResolvedValue([]);

			await setAutoDelete(GUILD_ID, "111111111111111111", {
				allow: [],
				bots: false,
				delay: 0,
			});
			await setAutoMessage(GUILD_ID, "111111111111111111", {
				content: "Hi",
				interval: 600,
				mentions: false,
			});

			const namespaces = database.lockQuery.mock.calls.map((call) => call[1]);
			expect(new Set(namespaces).size).toBe(2);
		});
	});

	describe("setAutoPurge", () => {
		it("runs a new purge an interval from now", async () => {
			cleanup.fetchAutoPurges.mockResolvedValue([]);

			const change = await setAutoPurge(GUILD_ID, "111111111111111111", {
				filter: "any",
				interval: 3600,
				value: null,
			});

			expect(change.after?.nextRunAt).toBe("2026-10-22T13:00:00.000Z");
		});

		it("keeps the next run while the interval stays, and moves it when the interval does", async () => {
			const next = "2026-10-25T04:00:00.000Z";
			cleanup.fetchAutoPurges.mockResolvedValue([
				autoPurge("111111111111111111", 86_400, next),
			]);

			const kept = await setAutoPurge(GUILD_ID, "111111111111111111", {
				filter: "bots",
				interval: 86_400,
				value: null,
			});
			expect(kept.after?.nextRunAt).toBe(next);

			const moved = await setAutoPurge(GUILD_ID, "111111111111111111", {
				filter: "bots",
				interval: 600,
				value: null,
			});
			expect(moved.after?.nextRunAt).toBe("2026-10-22T12:10:00.000Z");
		});
	});

	describe("clearAutoChannel", () => {
		it("clears the row of a channel and hands it back", async () => {
			const row = { channelId: "111111111111111111", content: "Hi" } as AutoMessage;
			messages.fetchAutoMessages.mockResolvedValue([row]);
			messages.removeAutoMessage.mockResolvedValue(true);

			expect(await clearAutoChannel("autoMessage", GUILD_ID, row.channelId)).toBe(row);
			expect(messages.removeAutoMessage).toHaveBeenCalledWith(
				database.tx.orm,
				GUILD_ID,
				row.channelId,
			);
		});

		it("refuses a channel that has none", async () => {
			cleanup.fetchAutoPurges.mockResolvedValue([]);

			expect(
				await codeOf(clearAutoChannel("autoPurge", GUILD_ID, "111111111111111111")),
			).toBe("unknown");
			expect(cleanup.removeAutoPurge).not.toHaveBeenCalled();
		});
	});
});

describe("assertGuildTextChannel", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"getGuildChannels",
			vi.fn(async () => [
				{ id: "111111111111111111", type: ChannelType.GuildText },
				{ id: "222222222222222222", type: ChannelType.GuildAnnouncement },
				{ id: "333333333333333333", type: ChannelType.GuildVoice },
			]),
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("takes a text or announcement channel of the guild", async () => {
		await expect(
			assertGuildTextChannel(GUILD_ID, "111111111111111111"),
		).resolves.toBeUndefined();
		await expect(
			assertGuildTextChannel(GUILD_ID, "222222222222222222"),
		).resolves.toBeUndefined();
	});

	// The channel is unique in each table whatever the guild: a channel of
	// another guild would hold that guild's row.
	it("refuses a channel of another guild, and one that is not a text channel", async () => {
		expect(await codeOf(assertGuildTextChannel(GUILD_ID, "444444444444444444"))).toBe(
			"channel",
		);
		expect(await codeOf(assertGuildTextChannel(GUILD_ID, "333333333333333333"))).toBe(
			"channel",
		);
	});
});
