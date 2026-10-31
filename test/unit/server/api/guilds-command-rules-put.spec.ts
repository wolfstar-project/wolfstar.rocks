import { beforeEach, describe, expect, it, vi } from "vitest";

const C1 = "400000000000000001";
const C2 = "400000000000000002";
const R1 = "300000000000000001";
const U1 = "500000000000000001";
const GUILD = "100000000000000009";

// vi.hoisted() ensures globals are present before the route module is evaluated.
const { mocks } = vi.hoisted(() => {
	const mocks = {
		audit: vi.fn(),
		submit: vi.fn(),
		write: vi.fn(),
		dispose: vi.fn(),
		fetchCommands: vi.fn(),
		execute: vi.fn(),
		firstRow: vi.fn(),
		body: {} as Record<string, unknown>,
		command: "ban" as string | undefined,
		settings: {} as { commandsDisabled: string[]; commandsRestrictions: unknown[] },
	};

	const globals = globalThis as Record<string, unknown>;
	globals.defineWrappedResponseHandler = (fn: unknown) => fn;
	globals.readValidatedBody = (_event: unknown, validate: (body: unknown) => unknown) =>
		Promise.resolve(validate(mocks.body));
	globals.getRouterParam = () => mocks.command;
	globals.fetchCommands = mocks.fetchCommands;
	globals.seconds = (n: number) => n;

	return { mocks };
});

vi.mock("#server/utils/guilds/manager", () => ({
	authorizeGuildManager: () => vi.fn(),
	useManagedGuild: () => ({
		guild: { id: "100000000000000009" },
		member: { user: { id: "user-1", username: "alice" } },
	}),
}));

vi.mock("#server/database/prisma", () => ({
	db: {
		raw: {
			sql: (strings: TemplateStringsArray) => ({
				affectedCount: () => ({ build: () => strings.join("?") }),
			}),
		},
	},
}));

vi.mock("#server/database", () => ({
	writeSettingsTransaction: () =>
		Promise.resolve({
			settings: mocks.settings,
			write(data: Record<string, unknown>) {
				mocks.write(data);
				return {
					submit: async (_extra: unknown, check?: (tx: unknown) => Promise<void>) => {
						await check?.({
							execute: mocks.execute,
							orm: { public: { GuildCommands: { first: mocks.firstRow } } },
						});
						mocks.submit();
						Object.assign(mocks.settings, data);
					},
				};
			},
			[Symbol.dispose]: mocks.dispose,
		}),
}));

vi.mock("evlog", async (importOriginal) => ({
	...(await importOriginal<typeof import("evlog")>()),
	useLogger: vi.fn().mockReturnValue({ set: vi.fn(), error: vi.fn() }),
	withAuditMethods: (log: object) => ({ ...log, audit: mocks.audit }),
}));

import type { H3Event } from "h3";
import putHandler from "#server/api/guilds/[guild]/command-rules/[command].put";
import { Tables, type TableName } from "#server/database/settings/columns";
import { getCommandRuleRevision, readCommandRuleState } from "#shared/utils/command-rules";

const callHandler = putHandler as unknown as (event: H3Event) => Promise<unknown>;

function storedRevision(): number {
	return readCommandRuleState(mocks.settings, "ban", GUILD).revision;
}

describe("PUT /api/guilds/:guild/command-rules/:command", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.command = "ban";
		mocks.fetchCommands.mockResolvedValue([
			{ name: "ban", command: "ban", guarded: false },
			{ name: "settings", command: "settings", guarded: true },
		]);
		mocks.settings = {
			commandsDisabled: ["kick"],
			commandsRestrictions: [
				{ command: "ban", allowedRoles: [R1], allowedUsers: [U1] },
				{ channel: C2, commands: ["kick"] },
			],
		};
		mocks.firstRow.mockResolvedValue({
			disabled: [...mocks.settings.commandsDisabled],
			disabledInChannels: [...mocks.settings.commandsRestrictions],
		});
		mocks.body = {
			revision: storedRevision(),
			enabled: false,
			onlyAllowed: false,
			allowedChannels: [C1],
			ignoredChannels: [],
			allowedRoles: [],
			ignoredRoles: [],
		};
	});

	it("writes the status and the rule together, keeping the member lists", async () => {
		const response = await callHandler({} as H3Event);

		expect(mocks.write).toHaveBeenCalledWith({
			commandsDisabled: ["kick", "ban"],
			commandsRestrictions: [
				expect.objectContaining({ command: "kick", ignoredChannels: [C2] }),
				expect.objectContaining({
					command: "ban",
					allowedChannels: [C1],
					allowedRoles: [],
					allowedUsers: [U1],
				}),
				{ format: 2 },
			],
		});
		expect(mocks.submit).toHaveBeenCalledOnce();
		expect(response).toMatchObject({
			command: "ban",
			enabled: false,
			commandsDisabled: ["kick", "ban"],
			commandsRestrictions: expect.arrayContaining([{ format: 2 }]),
			revision: storedRevision(),
		});
	});

	it("reads and writes the rule's status as @everyone", async () => {
		mocks.body = { ...mocks.body, onlyAllowed: true, allowedRoles: [R1] };

		const response = await callHandler({} as H3Event);

		expect(mocks.write).toHaveBeenCalledWith(
			expect.objectContaining({
				commandsRestrictions: expect.arrayContaining([
					expect.objectContaining({ command: "ban", ignoredRoles: [GUILD] }),
				]),
			}),
		);
		expect(response).toMatchObject({
			onlyAllowed: true,
			rule: { command: "ban", ignoredRoles: [] },
		});
	});

	it("audits the change by command, with JSON-safe values", async () => {
		await callHandler({} as H3Event);

		expect(mocks.audit).toHaveBeenCalledOnce();
		const [event] = mocks.audit.mock.calls[0] as [Record<string, unknown>];
		expect(event).toMatchObject({
			action: "guild.settings.update",
			actor: { type: "user", id: "user-1", displayName: "alice" },
			target: { type: "guild", id: GUILD },
			outcome: "success",
		});
		const changes = event.changes as { patch: { path: string; value: unknown }[] };
		expect(changes.patch).toEqual([
			{ op: "replace", path: "/commandsDisabled", value: ["kick", "ban"], from: ["kick"] },
			{
				op: "replace",
				path: "/commandsRestrictions/ban/allowedChannels",
				value: [C1],
				from: [],
			},
			{
				op: "replace",
				path: "/commandsRestrictions/ban/allowedRoles",
				value: [],
				from: [R1],
			},
			{
				op: "replace",
				path: "/commandsRestrictions/ban/ignoredRoles",
				value: [],
				from: [GUILD],
			},
		]);
		expect(JSON.parse(JSON.stringify(event.changes))).toEqual(event.changes);
	});

	it("refuses a stale revision with 409 and writes nothing", async () => {
		mocks.body.revision = getCommandRuleRevision(
			{
				command: "ban",
				allowedChannels: [],
				ignoredChannels: [],
				allowedRoles: [],
				ignoredRoles: [],
				allowedUsers: [],
				ignoredUsers: [],
			},
			false,
		);

		await expect(callHandler({} as H3Event)).rejects.toMatchObject({
			status: 409,
			code: "conflict",
		});
		expect(mocks.write).not.toHaveBeenCalled();
		expect(mocks.audit).not.toHaveBeenCalled();
		expect(mocks.dispose).toHaveBeenCalledOnce();
	});

	it("takes the locks first in the save's transaction", async () => {
		await callHandler({} as H3Event);

		expect(mocks.execute.mock.calls[0]?.[0]).toContain("pg_advisory_xact_lock");
		expect(mocks.firstRow).toHaveBeenCalledWith({ id: BigInt(GUILD) });
	});

	// A settings save writes the tables in this order: the other way round, each
	// waits for a row the other holds, and Postgres aborts one of them.
	it("locks the rows in the order a settings save writes them", async () => {
		await callHandler({} as H3Event);

		const locked = mocks.execute.mock.calls.flatMap(([query]) => {
			const table = /"public"\."(\w+)"/.exec(String(query))?.[1];
			return table ? [table as TableName] : [];
		});
		expect(locked).toStrictEqual(["Guild", "Modules", "GuildCommands"]);
		expect(locked).toStrictEqual(Tables.filter((name) => locked.includes(name)));
	});

	it("refuses a save when someone else wrote since it read, even another command", async () => {
		mocks.firstRow.mockResolvedValue({
			disabled: ["kick"],
			disabledInChannels: [
				...mocks.settings.commandsRestrictions,
				{ command: "mute", ignoredRoles: [R1] },
			],
		});

		await expect(callHandler({} as H3Event)).rejects.toMatchObject({
			status: 409,
			code: "conflict",
		});
		expect(mocks.submit).not.toHaveBeenCalled();
		expect(mocks.audit).not.toHaveBeenCalled();
	});

	it("saves on a guild that has no row yet", async () => {
		mocks.settings = { commandsDisabled: [], commandsRestrictions: [] };
		mocks.firstRow.mockResolvedValue(null);
		mocks.body.revision = storedRevision();

		await callHandler({} as H3Event);

		expect(mocks.submit).toHaveBeenCalledOnce();
	});

	it("refuses and audits a protected command", async () => {
		mocks.command = "settings";

		await expect(callHandler({} as H3Event)).rejects.toMatchObject({
			status: 403,
			code: "protected",
		});
		expect(mocks.audit).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "guild.settings.access-denied",
				outcome: "denied",
			}),
		);
		expect(mocks.write).not.toHaveBeenCalled();
	});

	it("answers 404 for a command the bot does not have", async () => {
		mocks.command = "nope";

		await expect(callHandler({} as H3Event)).rejects.toMatchObject({ status: 404 });
		expect(mocks.write).not.toHaveBeenCalled();
	});

	it("answers 400 for a path that is not a command name", async () => {
		mocks.command = "ban add";

		await expect(callHandler({} as H3Event)).rejects.toMatchObject({ status: 400 });
	});
});
