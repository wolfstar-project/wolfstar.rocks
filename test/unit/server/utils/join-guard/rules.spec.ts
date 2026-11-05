import type { JoinGuardRule, JoinGuardRuleInput } from "#shared/utils/join-guard";
import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => {
	const tx = { execute: vi.fn(), orm: { transaction: true } };
	return {
		db: {
			orm: { root: true },
			raw: {
				sql: () => ({ affectedCount: () => ({ build: () => "lock" }) }),
			},
			transaction: (run: (tx: unknown) => unknown) => run(tx),
		},
		tx,
	};
});
vi.mock("#server/database/prisma", () => ({ db: database.db }));

const storage = vi.hoisted(() => ({
	fetchJoinGuardRuleRows: vi.fn(),
	insertJoinGuardRule: vi.fn(),
	patchJoinGuardRule: vi.fn(),
	removeJoinGuardRule: vi.fn(),
}));
vi.mock("#server/database/settings/joinguard/rules", () => storage);

import {
	createJoinGuardRule,
	deleteJoinGuardRule,
	JoinGuardRuleError,
	updateJoinGuardRule,
} from "#server/utils/join-guard/rules";

const GUILD = "100000000000000000";

function input(overrides: Partial<JoinGuardRuleInput> = {}): JoinGuardRuleInput {
	return {
		name: "Raid",
		enabled: true,
		accountAgeMax: 604_800,
		defaultAvatar: false,
		generatedName: false,
		nameContains: null,
		unverifiedBot: false,
		sendToCheckpoint: true,
		roleId: null,
		directMessage: false,
		alertChannelId: null,
		hardAction: null,
		...overrides,
	};
}

function stored(id: string, overrides: Partial<JoinGuardRuleInput> = {}): JoinGuardRule {
	return { ...input(overrides), id, createdAt: 0 };
}

async function failure(promise: Promise<unknown>) {
	try {
		await promise;
	} catch (error) {
		return error as JoinGuardRuleError;
	}
	throw new Error("expected the write to fail");
}

beforeEach(() => {
	vi.clearAllMocks();
	storage.fetchJoinGuardRuleRows.mockResolvedValue([]);
	storage.insertJoinGuardRule.mockImplementation((_orm, _guild, data: JoinGuardRuleInput) =>
		Promise.resolve({ ...data, id: "1", createdAt: 0 }),
	);
	storage.patchJoinGuardRule.mockResolvedValue(true);
	storage.removeJoinGuardRule.mockResolvedValue(true);
});

describe("createJoinGuardRule", () => {
	it("writes the rule under the guild's lock, in the transaction", async () => {
		const rule = await createJoinGuardRule(GUILD, input());

		expect(rule.id).toBe("1");
		expect(database.tx.execute).toHaveBeenCalledWith("lock");
		expect(storage.fetchJoinGuardRuleRows).toHaveBeenCalledWith(database.tx.orm, GUILD);
		expect(storage.insertJoinGuardRule).toHaveBeenCalledWith(database.tx.orm, GUILD, input());
	});

	it("refuses a rule the bot could not run, with its problem, before writing", async () => {
		const error = await failure(createJoinGuardRule(GUILD, input({ sendToCheckpoint: false })));

		expect(error).toBeInstanceOf(JoinGuardRuleError);
		expect(error).toMatchObject({ code: "invalid", problem: "actions" });
		expect(storage.insertJoinGuardRule).not.toHaveBeenCalled();
	});

	it("refuses an eleventh rule", async () => {
		storage.fetchJoinGuardRuleRows.mockResolvedValue(
			Array.from({ length: 10 }, (_, index) =>
				stored(String(index + 1), { name: `R${index}` }),
			),
		);

		expect(await failure(createJoinGuardRule(GUILD, input()))).toMatchObject({ code: "limit" });
	});

	it("refuses a name another rule has, whatever its case", async () => {
		storage.fetchJoinGuardRuleRows.mockResolvedValue([stored("1", { name: "RAID" })]);

		expect(await failure(createJoinGuardRule(GUILD, input()))).toMatchObject({
			code: "nameTaken",
		});
	});

	it("reads the unique index of the names as a name taken", async () => {
		storage.insertJoinGuardRule.mockRejectedValue(
			new Error("insert failed", {
				cause: new Error(
					'duplicate key value violates unique constraint "GuildJoinGuardRule_guild_id_name_key"',
				),
			}),
		);

		expect(await failure(createJoinGuardRule(GUILD, input()))).toMatchObject({
			code: "nameTaken",
		});
	});

	it("lets any other failure of the database through", async () => {
		const error = new Error("connection lost");
		storage.insertJoinGuardRule.mockRejectedValue(error);

		expect(await failure(createJoinGuardRule(GUILD, input()))).toBe(error);
	});
});

describe("updateJoinGuardRule", () => {
	beforeEach(() => {
		storage.fetchJoinGuardRuleRows.mockResolvedValue([
			stored("1"),
			stored("2", { name: "Bots", unverifiedBot: true }),
		]);
	});

	it("writes only what changes, and answers the rule before and after", async () => {
		const change = await updateJoinGuardRule(GUILD, "1", { enabled: false, name: "Raid" });

		expect(change.changed).toStrictEqual(["enabled"]);
		expect(change.after.enabled).toBe(false);
		expect(change.before.enabled).toBe(true);
		expect(storage.patchJoinGuardRule).toHaveBeenCalledWith(database.tx.orm, GUILD, "1", {
			enabled: false,
		});
	});

	it("writes nothing when nothing changes", async () => {
		const change = await updateJoinGuardRule(GUILD, "1", { enabled: true });

		expect(change.changed).toStrictEqual([]);
		expect(storage.patchJoinGuardRule).not.toHaveBeenCalled();
	});

	it("checks the rule the change makes with the stored fields", async () => {
		expect(await failure(updateJoinGuardRule(GUILD, "1", { hardAction: "Ban" }))).toMatchObject(
			{
				code: "invalid",
				problem: "hardActionConflict",
			},
		);
		expect(
			await updateJoinGuardRule(GUILD, "1", { hardAction: "Ban", sendToCheckpoint: false }),
		).toMatchObject({ changed: ["hardAction", "sendToCheckpoint"] });
	});

	it("refuses a name another rule has, and a rule the guild does not have", async () => {
		expect(await failure(updateJoinGuardRule(GUILD, "1", { name: "bots" }))).toMatchObject({
			code: "nameTaken",
		});
		expect(await failure(updateJoinGuardRule(GUILD, "3", { enabled: false }))).toMatchObject({
			code: "unknown",
		});
	});
});

describe("deleteJoinGuardRule", () => {
	it("answers the rule it deleted, and refuses one the guild does not have", async () => {
		storage.fetchJoinGuardRuleRows.mockResolvedValue([stored("1")]);

		expect((await deleteJoinGuardRule(GUILD, "1")).name).toBe("Raid");
		expect(storage.removeJoinGuardRule).toHaveBeenCalledWith(database.tx.orm, GUILD, "1");
		expect(await failure(deleteJoinGuardRule(GUILD, "2"))).toMatchObject({ code: "unknown" });
	});
});
