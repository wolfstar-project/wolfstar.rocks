import type { Database } from "#server/database/prisma";
import { upsertAutoPurge } from "#server/database/settings/cleanup/storage";
import { upsertAutoMessage } from "#server/database/settings/messages/storage";
import { afterEach, describe, expect, it, vi } from "vitest";

const GUILD_ID = "123456789012345678";
const CHANNEL_ID = "234567890123456789";
const NOW = Date.parse("2026-10-23T12:00:00Z");

type Row = Record<string, unknown>;

/**
 * A stand-in for a table of channels: `where(...).updateAndCount`, `create`
 * and `first` on one row, which the bot may have moved on since it was read.
 */
function createOrm(existing: Row | null) {
	let row = existing;
	const table = {
		create: vi.fn(async (input: Row) => {
			row = { id: 7n, ...input };
		}),
		first: vi.fn(async () => row),
		where: vi.fn(() => ({
			updateAndCount: vi.fn(async (columns: Row) => {
				if (!row) return 0;
				row = { ...row, ...columns };
				return 1;
			}),
		})),
	};
	return {
		public: { Guild: { upsert: vi.fn() }, GuildAutoMessage: table, GuildAutoPurge: table },
	} as unknown as Database["orm"];
}

const purge = {
	row: (nextRunAt: string): Row => ({
		channelId: BigInt(CHANNEL_ID),
		filter: "any",
		guildId: BigInt(GUILD_ID),
		id: 7n,
		interval: 86_400,
		nextRunAt,
		value: null,
	}),
	write: (orm: Database["orm"], nextRunAt: number | null) =>
		upsertAutoPurge(
			orm,
			GUILD_ID,
			CHANNEL_ID,
			{ filter: "any", interval: 86_400, value: null },
			nextRunAt,
		),
};

const message = {
	row: (nextRunAt: string): Row => ({
		channelId: BigInt(CHANNEL_ID),
		content: "Hi",
		guildId: BigInt(GUILD_ID),
		id: 7n,
		interval: 86_400,
		mentions: false,
		nextRunAt,
	}),
	write: (orm: Database["orm"], nextRunAt: number | null) =>
		upsertAutoMessage(
			orm,
			GUILD_ID,
			CHANNEL_ID,
			{ content: "Hi", interval: 86_400, mentions: false },
			nextRunAt,
		),
};

describe.each([
	["purge", purge],
	["automatic message", message],
])("writing the %s of a channel", (_name, kind) => {
	afterEach(() => {
		vi.useRealTimers();
	});

	// The bot moves the next run after each run, under no lock of the
	// dashboard: an edit that keeps the interval must not write back the time
	// it read before that.
	it("keeps the next run the bot set when it is not given one", async () => {
		const orm = createOrm(kind.row("2026-10-24T12:00:00.000"));

		const after = await kind.write(orm, null);

		expect(after.nextRunAt).toBe("2026-10-24T12:00:00.000Z");
	});

	it("moves the next run when it is given one", async () => {
		const orm = createOrm(kind.row("2026-10-24T12:00:00.000"));

		const after = await kind.write(orm, NOW + 600_000);

		expect(after.nextRunAt).toBe("2026-10-23T12:10:00.000Z");
	});

	it("runs a row that went away meanwhile an interval from now", async () => {
		vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
		const orm = createOrm(null);

		const after = await kind.write(orm, null);

		expect(after.nextRunAt).toBe("2026-10-24T12:00:00.000Z");
	});
});
