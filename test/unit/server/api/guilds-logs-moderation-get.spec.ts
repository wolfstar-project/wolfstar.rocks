import type { H3Event } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

// A stand-in for the ORM's filter expressions: each column method returns a
// plain description of itself, so a test can read back what the route asked for.
type Expression =
	| { column: string; op: string; value?: unknown }
	| { op: "and" | "or"; args: Expression[] };

const columnProxy = new Proxy(
	{},
	{
		get: (_target, column: string) =>
			new Proxy(
				{},
				{
					get:
						(_inner, op: string) =>
						(value?: unknown): Expression => ({ column, op, value }),
				},
			),
	},
);

const { state, mockGetGuild, mockResolveGuildMembers, mockCanManage, mockGetCurrentMember } =
	vi.hoisted(() => {
		const state = {
			actionWheres: [] as Expression[][],
			caseDataWheres: [] as Expression[],
			rows: [] as Record<string, unknown>[],
			caseData: [] as Record<string, unknown>[],
			query: {} as Record<string, unknown>,
		};
		const mockGetGuild = vi.fn();
		const mockResolveGuildMembers = vi.fn();
		const mockCanManage = vi.fn();
		const mockGetCurrentMember = vi.fn();

		const globals = globalThis as Record<string, unknown>;
		globals["defineWrappedCachedResponseHandler"] = (fn: unknown, options: unknown) =>
			Object.assign(fn as object, { options });
		globals["getGuildParam"] = () => "123456789012345678";
		globals["getGuild"] = mockGetGuild;
		globals["getCurrentMember"] = mockGetCurrentMember;
		globals["canManage"] = mockCanManage;
		globals["getRequestURL"] = () => new URL("http://localhost/?status=open");
		globals["getValidatedQuery"] = (_event: unknown, validate: (body: unknown) => unknown) =>
			Promise.resolve(validate(state.query));
		globals["timestampStringToUtcIso"] = (value: string) => `${value.replace(" ", "T")}Z`;
		globals["asTimestampString"] = (value: string) => value;
		globals["containsPattern"] = (value: string) => `%${value}%`;
		globals["seconds"] = (value: number) => value * 1000;

		return {
			state,
			mockGetGuild,
			mockResolveGuildMembers,
			mockCanManage,
			mockGetCurrentMember,
		};
	});

vi.mock("#server/database/prisma", () => {
	// Each `where` returns a new collection carrying every filter so far, as the ORM does.
	function actionCollection(filters: Expression[]): unknown {
		return {
			where: (build: (row: unknown) => Expression) =>
				actionCollection([...filters, build(columnProxy)]),
			orderBy: () => ({
				limit: () => ({
					offset: () => ({
						all: () => {
							state.actionWheres.push(filters);
							return Promise.resolve(state.rows);
						},
					}),
				}),
			}),
			aggregate: () => Promise.resolve({ total: state.rows.length }),
		};
	}

	return {
		db: {
			orm: {
				public: {
					ModerationAction: actionCollection([]),
					ModerationCaseData: {
						where: (build: (row: unknown) => Expression) => {
							state.caseDataWheres.push(build(columnProxy));
							return { all: () => Promise.resolve(state.caseData) };
						},
					},
				},
			},
		},
	};
});

vi.mock("@prisma/orm-postgres/orm-client", () => ({
	and: (...args: Expression[]) => ({ op: "and", args }),
	or: (...args: Expression[]) => ({ op: "or", args }),
}));

vi.mock("#server/utils/audit/resolve-members", () => ({
	fallbackMember: (id: string) => ({ user: { id, username: id } }),
	resolveGuildMembers: mockResolveGuildMembers,
}));

vi.mock("evlog", () => ({
	useLogger: vi.fn().mockReturnValue({ set: vi.fn(), error: vi.fn() }),
	createError: vi.fn((opts: Record<string, unknown>) =>
		Object.assign(new Error(String(opts["message"])), opts),
	),
}));

import handler from "#server/api/guilds/[guild]/logs/moderation.get";
import { MODERATION_TYPE_ENCODED_MARKER } from "#shared/types/moderation-types";

type Handler = ((
	event: H3Event,
) => Promise<{ entries: Record<string, unknown>[]; total: number }>) & {
	options: { authorize: (event: H3Event) => Promise<void> };
};
const callHandler = handler as unknown as Handler;
const event = {} as H3Event;

// The bot's encoding: a marker, the type in the second byte, the flags in the first.
const MUTE = 2;
const ARCHIVED = 1 << 3;
const COMPLETED = 1 << 4;
const muteMetadata = (flags: number) => MODERATION_TYPE_ENCODED_MARKER | (MUTE << 8) | flags;

function moderationRow(overrides: Record<string, unknown> = {}) {
	return {
		id: 7,
		guildId: 123456789012345678n,
		action: "AddRole",
		metadata: muteMetadata(COMPLETED),
		createdAt: "2026-05-15 00:00:00.000",
		duration: 3600,
		targetId: 111111111111111111n,
		moderatorId: 222222222222222222n,
		reason: "Spam",
		referenceId: null,
		...overrides,
	};
}

function lastActionFilters(): Expression[] {
	return state.actionWheres.at(-1) ?? [];
}

describe("GET /api/guilds/:guild/logs/moderation", () => {
	beforeEach(() => {
		state.actionWheres = [];
		state.caseDataWheres = [];
		state.rows = [moderationRow()];
		state.caseData = [];
		state.query = {};
		mockGetGuild.mockResolvedValue({ id: "123456789012345678" });
		mockResolveGuildMembers.mockResolvedValue(new Map());
		mockGetCurrentMember.mockResolvedValue({ user: { id: "333333333333333333" } });
		mockCanManage.mockResolvedValue(undefined);
	});

	it("filters by nothing but the server when no filter is set", async () => {
		await callHandler(event);

		expect(lastActionFilters()).toStrictEqual([
			{ column: "guildId", op: "eq", value: 123456789012345678n },
		]);
	});

	it("selects the archived cases of every type, encoded or not", async () => {
		state.query = { status: "archived" };
		await callHandler(event);

		const statusFilter = lastActionFilters()[1];
		expect(statusFilter).toMatchObject({ op: "or" });
		if (statusFilter?.op !== "or") throw new Error("expected an `or` filter");

		const [encoded, legacy] = statusFilter.args;
		expect(encoded).toMatchObject({ column: "metadata", op: "in" });
		const encodedValues = (encoded as { value: number[] }).value;
		expect(encodedValues).toContain(muteMetadata(ARCHIVED));
		expect(encodedValues).not.toContain(muteMetadata(COMPLETED));

		// Unmarked rows: any action, flags that leave the case archived.
		expect(legacy).toMatchObject({ op: "and" });
		const legacyArgs = (legacy as { args: Expression[] }).args;
		expect(legacyArgs).toHaveLength(1);
		expect(legacyArgs[0]).toMatchObject({ column: "metadata", op: "in" });
		expect((legacyArgs[0] as { value: number[] }).value).toContain(ARCHIVED);
	});

	it("combines the type and the state in one filter", async () => {
		state.query = { status: "open", typeCode: "1" };
		await callHandler(event);

		const filter = lastActionFilters()[1];
		if (filter?.op !== "or") throw new Error("expected an `or` filter");
		const legacyArgs = (filter.args[1] as { args: Expression[] }).args;
		expect(legacyArgs[1]).toStrictEqual({
			column: "action",
			op: "in",
			value: ["AddWarning", "RemoveWarning"],
		});
	});

	it("refuses a state the bot does not know", async () => {
		state.query = { status: "pending" };
		await expect(callHandler(event)).rejects.toThrow(/"open" \| "completed" \| "archived"/u);
	});

	it("answers each case with its state, the roles it holds and the message it is about", async () => {
		state.caseData = [
			{
				caseId: 7,
				guildId: 123456789012345678n,
				extraData: ["444444444444444444"],
				channelId: 555555555555555555n,
				messageId: 666666666666666666n,
			},
		];
		const { entries } = await callHandler(event);

		expect(state.caseDataWheres[0]).toStrictEqual({
			op: "and",
			args: [
				{ column: "guildId", op: "eq", value: 123456789012345678n },
				{ column: "caseId", op: "in", value: [7] },
			],
		});
		expect(entries[0]).toMatchObject({
			caseId: 7,
			typeName: "Mute",
			status: "completed",
			extra: { kind: "roles", roleIds: ["444444444444444444"] },
			message: { channelId: "555555555555555555", messageId: "666666666666666666" },
			userId: "111111111111111111",
		});
		// Snowflakes cross the API as strings: a `bigint` would make the answer unserializable.
		expect(() => JSON.stringify(entries)).not.toThrow();
	});

	it("answers a case without stored data with neither extra data nor message", async () => {
		const { entries } = await callHandler(event);

		expect(entries[0]).toMatchObject({ extra: null, message: null });
	});

	it("does not look for case data when the page is empty", async () => {
		state.rows = [];
		await callHandler(event);

		expect(state.caseDataWheres).toHaveLength(0);
	});

	it("checks the manage permission in `authorize`, so a cached answer is guarded too", async () => {
		mockCanManage.mockRejectedValueOnce(Object.assign(new Error("Forbidden"), { status: 403 }));

		await expect(callHandler.options.authorize(event)).rejects.toMatchObject({ status: 403 });
		expect(mockCanManage).toHaveBeenCalledOnce();
	});
});
