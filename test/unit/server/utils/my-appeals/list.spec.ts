import type { MemberAppeal, MemberCase } from "#server/database/settings/appeals/member";
import type { AppealForm } from "#shared/utils/appeal-forms";
import type { MyAppealGuild } from "#shared/utils/my-appeals";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, getMember } = vi.hoisted(() => ({
	state: {
		cases: [] as MemberCase[],
		appeals: [] as MemberAppeal[],
		blocks: new Map<string, { reason: string | null }>(),
		settings: {} as Record<string, unknown>,
		forms: [] as AppealForm[],
		queried: [] as string[][],
	},
	getMember: vi.fn(),
}));

vi.mock("#server/database/prisma", () => ({ db: { orm: {} } }));
vi.mock("#server/database/settings/appeals/member", () => ({
	fetchMemberCases: (_orm: unknown, guildIds: string[]) => {
		state.queried.push(guildIds);
		return Promise.resolve(state.cases.filter((entry) => guildIds.includes(entry.guildId)));
	},
	fetchMemberAppeals: (_orm: unknown, guildIds: string[]) =>
		Promise.resolve(state.appeals.filter((entry) => guildIds.includes(entry.guildId))),
	fetchMemberBlocks: () => Promise.resolve(state.blocks),
}));
vi.mock("#server/database/settings/appeals/storage", () => ({
	fetchAppealForms: () => Promise.resolve(state.forms),
}));
vi.mock("#server/database/settings/functions", () => ({
	readSettings: () => state.settings,
}));
vi.mock("#server/utils/shared", () => ({ useApi: () => ({ guilds: { getMember } }) }));

import { MaximumMyAppealGuilds, readMyAppeals } from "#server/utils/my-appeals/list";

const day = 86_400_000;
const now = Date.UTC(2026, 10, 4);
const userId = "266624760782258186";
const guild: MyAppealGuild = { id: "254360814063058944", name: "WolfStar", icon: null };
const other: MyAppealGuild = { id: "737141877803057244", name: "Staryl", icon: "a_hash" };

function iso(offset: number) {
	return new Date(now + offset).toISOString();
}

function caseOf(id: number, overrides: Partial<MemberCase> = {}): MemberCase {
	return {
		guildId: guild.id,
		id,
		type: "Ban",
		undo: false,
		completed: false,
		archived: false,
		reason: "Raid",
		createdAt: iso(-id * day),
		duration: null,
		...overrides,
	};
}

function appealOf(caseId: number, overrides: Partial<MemberAppeal> = {}): MemberAppeal {
	return {
		guildId: guild.id,
		caseId,
		formId: null,
		answers: [],
		status: "pending",
		reason: null,
		createdAt: iso(-day),
		decidedAt: null,
		...overrides,
	};
}

function formOf(overrides: Partial<AppealForm> = {}): AppealForm {
	return {
		id: "10",
		guildId: guild.id,
		name: "Bans",
		description: null,
		icon: null,
		enabled: true,
		lockReason: null,
		types: [],
		requiredRoles: [],
		restrictedRoles: [],
		questions: [],
		position: 0,
		...overrides,
	} as AppealForm;
}

function read(guilds: MyAppealGuild[] = [guild]) {
	return readMyAppeals({ userId, guilds, now });
}

beforeEach(() => {
	state.cases = [];
	state.appeals = [];
	state.blocks = new Map();
	state.forms = [];
	state.queried = [];
	state.settings = {
		appealsEnabled: true,
		appealsBans: true,
		appealsMutes: true,
		appealsTimeouts: true,
		appealsCooldownDays: 7,
		appealsMaxActive: 1,
	};
	getMember.mockReset().mockResolvedValue({ roles: [] });
});

describe("readMyAppeals", () => {
	it("opens a case in course that the server takes, and counts it", async () => {
		state.cases = [caseOf(1)];

		const result = await read();

		expect(result.openCount).toBe(1);
		expect(result.entries).toStrictEqual([
			{
				key: `${guild.id}:1`,
				guild,
				case: {
					id: 1,
					type: "Ban",
					reason: "Raid",
					createdAt: iso(-day),
					duration: null,
					state: "active",
				},
				status: "open",
				appeal: null,
				againAt: null,
				closed: null,
			},
		]);
	});

	it("gives the status of a sent appeal, with the name of its form", async () => {
		state.cases = [caseOf(1), caseOf(2, { type: "Mute" })];
		state.appeals = [
			appealOf(1, { formId: "10" }),
			appealOf(2, { status: "accepted", decidedAt: iso(0) }),
		];
		state.forms = [formOf()];

		const { entries, openCount } = await read();

		expect(openCount).toBe(0);
		expect(
			entries.map((entry) => [entry.case.id, entry.status, entry.appeal?.formName]),
		).toStrictEqual([
			[1, "pending", "Bans"],
			[2, "accepted", null],
		]);
	});

	it("keeps a decided case once it ended, as lifted when its appeal was accepted", async () => {
		state.cases = [
			caseOf(1, { completed: true }),
			caseOf(2, { type: "Mute", completed: true }),
			caseOf(3, { type: "Timeout", completed: true }),
		];
		state.appeals = [
			appealOf(1, { status: "accepted" }),
			appealOf(2, { status: "denied", decidedAt: iso(-10 * day) }),
		];

		const { entries } = await read();

		expect(entries.map((entry) => [entry.case.id, entry.case.state])).toStrictEqual([
			[1, "lifted"],
			[2, "ended"],
		]);
	});

	it("says when the member can appeal again after a recent denial", async () => {
		state.cases = [caseOf(1), caseOf(2, { type: "Mute" })];
		state.appeals = [appealOf(1, { status: "denied", decidedAt: iso(-2 * day) })];

		const { entries } = await read();

		expect(entries.find((entry) => entry.case.id === 1)).toMatchObject({
			status: "denied",
			againAt: iso(5 * day),
		});
		expect(entries.find((entry) => entry.case.id === 2)).toMatchObject({
			status: "closed",
			againAt: iso(5 * day),
			closed: { reason: "cooldown", detail: null },
		});
	});

	it("does not say when once the cooldown passed", async () => {
		state.cases = [caseOf(1)];
		state.appeals = [appealOf(1, { status: "denied", decidedAt: iso(-8 * day) })];

		expect((await read()).entries[0]).toMatchObject({ status: "denied", againAt: null });
	});

	it.each([
		["off", { appealsEnabled: false }, null],
		["type", { appealsBans: false }, null],
	] as const)("closes a case for %s", async (reason, settings, detail) => {
		state.cases = [caseOf(1)];
		state.settings = { ...state.settings, ...settings };

		expect((await read()).entries[0]).toMatchObject({
			status: "closed",
			closed: { reason, detail },
		});
	});

	it("closes the cases of a blocked member with the reason, and while too many appeals wait", async () => {
		state.cases = [caseOf(1), caseOf(2, { type: "Mute" })];
		state.appeals = [appealOf(2)];

		expect((await read()).entries[0]).toMatchObject({ closed: { reason: "maxActive" } });

		state.blocks = new Map([[guild.id, { reason: "Spam" }]]);
		expect((await read()).entries[0]).toMatchObject({
			closed: { reason: "blocked", detail: "Spam" },
		});
	});

	it("asks Discord for the roles only when a form names some", async () => {
		state.cases = [caseOf(1)];
		state.forms = [formOf()];
		await read();
		expect(getMember).not.toHaveBeenCalled();

		state.forms = [formOf({ requiredRoles: ["5"] })];
		getMember.mockRejectedValueOnce(new Error("Unknown Member"));
		expect((await read()).entries[0]).toMatchObject({ closed: { reason: "noForm" } });
		expect(getMember).toHaveBeenCalledWith(guild.id, userId);
	});

	it("leaves out what was lifted and the cases that undid others", async () => {
		state.cases = [
			caseOf(1),
			caseOf(2, { undo: true }),
			caseOf(3, { type: "Mute", completed: true }),
		];

		expect((await read()).entries).toStrictEqual([]);
	});

	it("lists every server newest case first, and the servers once", async () => {
		state.cases = [caseOf(3), caseOf(1, { guildId: other.id })];

		const { entries } = await read([guild, other, guild]);

		expect(entries.map((entry) => entry.key)).toStrictEqual([`${other.id}:1`, `${guild.id}:3`]);
		expect(entries[0]?.guild).toStrictEqual(other);
		expect(state.queried).toStrictEqual([[guild.id, other.id]]);
	});

	it("reads no more servers than a member can be in", async () => {
		const many = Array.from({ length: MaximumMyAppealGuilds + 5 }, (_, index) => ({
			id: String(100_000_000_000_000_000n + BigInt(index)),
			name: `Server ${index}`,
			icon: null,
		}));

		await read(many);

		expect(state.queried[0]).toHaveLength(MaximumMyAppealGuilds);
	});
});
