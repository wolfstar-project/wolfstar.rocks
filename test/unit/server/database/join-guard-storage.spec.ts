import { beforeEach, describe, expect, it, vi } from "vitest";

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
		raw: { sql: database.sql },
		transaction: (run: (tx: unknown) => unknown) => run(database.tx),
	},
}));

import {
	countJoinGuardCheckpoints,
	fetchJoinGuardCheckpointPage,
	fetchLatestJoinGuardCheckpoint,
	JoinGuardQueueWindow,
	toJoinGuardCheckpoint,
} from "#server/database/settings/joinguard/checkpoints";
import {
	fetchJoinGuardRequestRow,
	insertJoinGuardRequest,
	JOIN_GUARD_REQUEST_CHANNEL,
	notifyJoinGuardRequest,
	submitJoinGuardRequest,
} from "#server/database/settings/joinguard/requests";
import {
	fetchJoinGuardRuleRows,
	insertJoinGuardRule,
	patchJoinGuardRule,
	removeJoinGuardRule,
} from "#server/database/settings/joinguard/rules";
import { isOnJoinGuardSharedBanList } from "#server/database/settings/joinguard/shared-bans";

const GUILD = "100000000000000000";
const USER = "300000000000000001";
const MOD = "100000000000000002";
const NOW = Date.parse("2026-11-05T12:00:00.000Z");

function ruleRow(overrides: Record<string, unknown> = {}) {
	return {
		id: 2n,
		guildId: BigInt(GUILD),
		name: "Raid",
		enabled: true,
		accountAgeMax: 604_800,
		defaultAvatar: true,
		generatedName: false,
		nameContains: null,
		unverifiedBot: false,
		sendToCheckpoint: true,
		roleId: 234567890123456789n,
		directMessage: false,
		alertChannelId: null,
		hardAction: null,
		createdAt: "2026-11-01 10:00:00.000",
		...overrides,
	};
}

function checkpointRow(overrides: Record<string, unknown> = {}) {
	return {
		id: 9n,
		guildId: BigInt(GUILD),
		userId: BigInt(USER),
		ruleId: 2n,
		ruleName: "Raid",
		status: "Waiting",
		resolution: null,
		moderatorId: null,
		caseId: null,
		accountCreatedAt: "2026-11-04 08:00:00.000",
		defaultAvatar: true,
		generatedName: false,
		trust: null,
		linkedAccounts: 0,
		createdAt: "2026-11-05 11:00:00.000",
		expiresAt: "2026-11-06 11:00:00.000",
		resolvedAt: null,
		...overrides,
	};
}

/** A query of the ORM that records what it was asked and answers `rows`. */
function query(rows: unknown[]) {
	const calls: { where: unknown[]; orderBy: number; limit: number | null } = {
		where: [],
		orderBy: 0,
		limit: null,
	};
	const chain = {
		where: vi.fn((filter: unknown) => {
			calls.where.push(filter);
			return chain;
		}),
		orderBy: vi.fn(() => {
			calls.orderBy++;
			return chain;
		}),
		limit: vi.fn((limit: number) => {
			calls.limit = limit;
			return chain;
		}),
		all: vi.fn().mockResolvedValue(rows),
	};
	return { chain, calls };
}

beforeEach(() => vi.clearAllMocks());

describe("the rules", () => {
	it("are read oldest first, with their IDs as text and their time in milliseconds", async () => {
		const { chain } = query([ruleRow({ id: 10n }), ruleRow()]);
		const orm = { public: { GuildJoinGuardRule: { where: vi.fn(() => chain) } } };

		const rules = await fetchJoinGuardRuleRows(orm as never, GUILD);

		expect(orm.public.GuildJoinGuardRule.where).toHaveBeenCalledWith({
			guildId: BigInt(GUILD),
		});
		expect(rules.map((rule) => rule.id)).toStrictEqual(["2", "10"]);
		expect(rules[0]).toStrictEqual({
			id: "2",
			name: "Raid",
			enabled: true,
			accountAgeMax: 604_800,
			defaultAvatar: true,
			generatedName: false,
			nameContains: null,
			unverifiedBot: false,
			sendToCheckpoint: true,
			roleId: "234567890123456789",
			directMessage: false,
			alertChannelId: null,
			hardAction: null,
			createdAt: Date.parse("2026-11-01T10:00:00.000Z"),
		});
	});

	it("are created with the guild's row, the IDs as bigint", async () => {
		const upsert = vi.fn();
		const create = vi.fn().mockResolvedValue(ruleRow());
		const orm = { public: { Guild: { upsert }, GuildJoinGuardRule: { create } } };

		await insertJoinGuardRule(orm as never, GUILD, {
			name: "Raid",
			enabled: true,
			accountAgeMax: 604_800,
			defaultAvatar: true,
			generatedName: false,
			nameContains: null,
			unverifiedBot: false,
			sendToCheckpoint: true,
			roleId: "234567890123456789",
			directMessage: false,
			alertChannelId: null,
			hardAction: null,
		});

		expect(upsert).toHaveBeenCalledWith({
			create: { id: BigInt(GUILD), language: "en-US" },
			update: { id: BigInt(GUILD) },
		});
		expect(create).toHaveBeenCalledWith(
			expect.objectContaining({
				guildId: BigInt(GUILD),
				roleId: 234567890123456789n,
				alertChannelId: null,
				name: "Raid",
			}),
		);
	});

	it("are edited and deleted in their guild only, and not at all for an ID that is not one", async () => {
		const updateAndCount = vi.fn().mockResolvedValue(1);
		const deleteAndCount = vi.fn().mockResolvedValue(0);
		const where = vi.fn(() => ({ updateAndCount, deleteAndCount }));
		const orm = { public: { GuildJoinGuardRule: { where } } };

		expect(
			await patchJoinGuardRule(orm as never, GUILD, "2", {
				alertChannelId: "400000000000000001",
			}),
		).toBe(true);
		expect(where).toHaveBeenCalledWith({ id: 2n, guildId: BigInt(GUILD) });
		expect(updateAndCount).toHaveBeenCalledWith({ alertChannelId: 400000000000000001n });

		expect(await removeJoinGuardRule(orm as never, GUILD, "2")).toBe(false);
		expect(await patchJoinGuardRule(orm as never, GUILD, "abc", {})).toBe(false);
		expect(await removeJoinGuardRule(orm as never, GUILD, "-1")).toBe(false);
		expect(where).toHaveBeenCalledTimes(2);
	});
});

describe("the queue", () => {
	it("reads a row with its times in milliseconds", () => {
		expect(toJoinGuardCheckpoint(checkpointRow() as never)).toStrictEqual({
			id: "9",
			guildId: GUILD,
			userId: USER,
			ruleId: "2",
			ruleName: "Raid",
			status: "Waiting",
			resolution: null,
			moderatorId: null,
			caseId: null,
			accountCreatedAt: Date.parse("2026-11-04T08:00:00.000Z"),
			defaultAvatar: true,
			generatedName: false,
			trust: null,
			linkedAccounts: 0,
			createdAt: Date.parse("2026-11-05T11:00:00.000Z"),
			expiresAt: Date.parse("2026-11-06T11:00:00.000Z"),
			resolvedAt: null,
		});
	});

	it("reads a page newest first, one more row than the page to know a next one follows", async () => {
		const rows = [
			checkpointRow({ id: 9n }),
			checkpointRow({ id: 8n }),
			checkpointRow({ id: 7n }),
		];
		const { chain, calls } = query(rows);
		const orm = { public: { JoinGuardCheckpoint: chain } };

		const page = await fetchJoinGuardCheckpointPage(orm as never, GUILD, {
			status: "Waiting",
			now: NOW,
			limit: 2,
		});

		expect(calls.where[0]).toStrictEqual({ guildId: BigInt(GUILD), status: "Waiting" });
		// Whoever waits is listed however old the row is: no window, no cursor.
		expect(calls.where).toHaveLength(1);
		expect(calls.orderBy).toBe(1);
		expect(calls.limit).toBe(3);
		expect(page.rows.map((row) => row.id)).toStrictEqual(["9", "8"]);
		expect(page.nextCursor).toBe("8");
	});

	it("reads every status for all, and ends on the last page", async () => {
		const { chain, calls } = query([checkpointRow()]);
		const orm = { public: { JoinGuardCheckpoint: chain } };

		const page = await fetchJoinGuardCheckpointPage(orm as never, GUILD, {
			status: "all",
			cursor: "10",
			now: NOW,
		});

		expect(calls.where[0]).toStrictEqual({ guildId: BigInt(GUILD) });
		// The other statuses stay in the last 7 days, and after the cursor.
		expect(calls.where).toHaveLength(3);
		expect(page.nextCursor).toBeNull();
	});

	it("reads nothing after a cursor that is not a row ID", async () => {
		const where = vi.fn();
		const orm = { public: { JoinGuardCheckpoint: { where } } };

		expect(
			await fetchJoinGuardCheckpointPage(orm as never, GUILD, {
				status: "all",
				cursor: "x",
				now: NOW,
			}),
		).toStrictEqual({ rows: [], nextCursor: null });
		expect(where).not.toHaveBeenCalled();
	});

	it("counts the 7 days by status, Left in all only, and everyone who waits under Waiting", async () => {
		const totals: Record<string, number> = {
			Waiting: 3,
			Verified: 4,
			Kicked: 2,
			Banned: 1,
			Left: 5,
		};
		const where = vi.fn((filter: { status: string }) => {
			const scoped = {
				where: vi.fn(() => scoped),
				aggregate: vi.fn().mockResolvedValue({ total: totals[filter.status] }),
			};
			// The count of who waits now reads no time:
			return filter.status === "Waiting" && where.mock.calls.length === 1
				? { aggregate: vi.fn().mockResolvedValue({ total: 6 }) }
				: scoped;
		});
		const orm = { public: { JoinGuardCheckpoint: { where } } };

		expect(await countJoinGuardCheckpoints(orm as never, GUILD, NOW)).toStrictEqual({
			counts: { Waiting: 6, Verified: 4, Kicked: 2, Banned: 1, all: 15 },
			waiting: 6,
		});
		expect(JoinGuardQueueWindow).toBe(7 * 86_400_000);
	});

	it("reads the latest row of a member, none when the guard never stopped them", async () => {
		const { chain, calls } = query([checkpointRow({ status: "Left" })]);
		const orm = { public: { JoinGuardCheckpoint: chain } };

		expect((await fetchLatestJoinGuardCheckpoint(orm as never, GUILD, USER))?.status).toBe(
			"Left",
		);
		expect(calls.where[0]).toStrictEqual({ guildId: BigInt(GUILD), userId: BigInt(USER) });
		expect(calls.limit).toBe(1);

		chain.all.mockResolvedValueOnce([]);
		expect(await fetchLatestJoinGuardCheckpoint(orm as never, GUILD, USER)).toBeNull();
	});
});

describe("the requests", () => {
	it("are written with what each kind needs", async () => {
		const create = vi.fn().mockResolvedValue({ id: 55n });
		const orm = { public: { JoinGuardRequest: { create } } };

		expect(
			await insertJoinGuardRequest(orm as never, {
				kind: "Pass",
				guildId: GUILD,
				userId: USER,
				checkpointId: "9",
				trust: 2,
				linkedAccounts: 1,
			}),
		).toBe("55");
		await insertJoinGuardRequest(orm as never, {
			kind: "Kick",
			guildId: GUILD,
			userId: USER,
			checkpointId: "9",
			moderatorId: MOD,
			reason: "raid",
		});
		await insertJoinGuardRequest(orm as never, {
			kind: "PostButton",
			guildId: GUILD,
			moderatorId: MOD,
		});

		expect(create.mock.calls.map(([data]) => data)).toStrictEqual([
			{
				guildId: BigInt(GUILD),
				kind: "Pass",
				userId: BigInt(USER),
				checkpointId: 9n,
				trust: 2,
				linkedAccounts: 1,
			},
			{
				guildId: BigInt(GUILD),
				kind: "Kick",
				userId: BigInt(USER),
				checkpointId: 9n,
				moderatorId: BigInt(MOD),
				reason: "raid",
			},
			{ guildId: BigInt(GUILD), kind: "PostButton", moderatorId: BigInt(MOD) },
		]);
	});

	it("announces the ID of the request, alone, on the channel the bot listens on", async () => {
		const execute = vi.fn();

		await notifyJoinGuardRequest({ execute }, "55");

		expect(JOIN_GUARD_REQUEST_CHANNEL).toBe("join_guard_request");
		expect(execute).toHaveBeenCalledExactlyOnceWith({ values: ["join_guard_request", "55"] });
	});

	it("is written and announced in one transaction", async () => {
		const create = vi.fn().mockResolvedValue({ id: 56n });
		Object.assign(database.tx.orm, { public: { JoinGuardRequest: { create } } });

		const id = await submitJoinGuardRequest({
			kind: "PostButton",
			guildId: GUILD,
			moderatorId: MOD,
		});

		expect(id).toBe("56");
		expect(create).toHaveBeenCalledOnce();
		expect(database.tx.execute).toHaveBeenCalledExactlyOnceWith({
			values: ["join_guard_request", "56"],
		});
	});

	it("is read in its guild, and only as the member's own pass for the page", async () => {
		const first = vi.fn().mockResolvedValue({
			id: 55n,
			kind: "Pass",
			userId: BigInt(USER),
			processedAt: "2026-11-05 12:00:01.000",
			error: "NotMember: The member is not in the guild.",
		});
		const orm = { public: { JoinGuardRequest: { first } } };

		expect(await fetchJoinGuardRequestRow(orm as never, GUILD, "55")).toStrictEqual({
			id: "55",
			kind: "Pass",
			userId: USER,
			processed: true,
			error: "NotMember: The member is not in the guild.",
		});
		expect(first).toHaveBeenLastCalledWith({ id: 55n, guildId: BigInt(GUILD) });

		await fetchJoinGuardRequestRow(orm as never, GUILD, "55", { userId: USER });
		expect(first).toHaveBeenLastCalledWith({
			id: 55n,
			guildId: BigInt(GUILD),
			kind: "Pass",
			userId: BigInt(USER),
		});

		expect(await fetchJoinGuardRequestRow(orm as never, GUILD, "nope")).toBeNull();
		expect(first).toHaveBeenCalledTimes(2);
	});
});

describe("the shared ban list", () => {
	it("is looked up by the account", async () => {
		const first = vi
			.fn()
			.mockResolvedValueOnce({ userId: BigInt(USER) })
			.mockResolvedValueOnce(null);
		const orm = { public: { JoinGuardSharedBan: { first } } };

		expect(await isOnJoinGuardSharedBanList(orm as never, USER)).toBe(true);
		expect(await isOnJoinGuardSharedBanList(orm as never, USER)).toBe(false);
		expect(first).toHaveBeenCalledWith({ userId: BigInt(USER) });
	});
});
