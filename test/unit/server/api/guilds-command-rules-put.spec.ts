import { beforeEach, describe, expect, it, vi } from "vitest";

const C1 = "400000000000000001";
const C2 = "400000000000000002";
const R1 = "300000000000000001";
const U1 = "500000000000000001";

// vi.hoisted() ensures globals are present before the route module is evaluated.
const { mocks } = vi.hoisted(() => {
	const mocks = {
		audit: vi.fn(),
		submit: vi.fn(),
		write: vi.fn(),
		dispose: vi.fn(),
		fetchCommands: vi.fn(),
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
		guild: { id: "guild-1" },
		member: { user: { id: "user-1", username: "alice" } },
	}),
}));

vi.mock("#server/database", () => ({
	writeSettingsTransaction: () =>
		Promise.resolve({
			settings: mocks.settings,
			write(data: Record<string, unknown>) {
				mocks.write(data);
				return {
					submit: async () => {
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
import { getCommandRuleRevision, readCommandRuleState } from "#shared/utils/command-rules";

const callHandler = putHandler as unknown as (event: H3Event) => Promise<unknown>;

function storedRevision(): number {
	return readCommandRuleState(mocks.settings, "ban").revision;
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
		mocks.body = {
			revision: storedRevision(),
			enabled: false,
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
			],
		});
		expect(mocks.submit).toHaveBeenCalledOnce();
		expect(response).toMatchObject({
			command: "ban",
			enabled: false,
			commandsDisabled: ["kick", "ban"],
			revision: storedRevision(),
		});
	});

	it("audits the change by command, with JSON-safe values", async () => {
		await callHandler({} as H3Event);

		expect(mocks.audit).toHaveBeenCalledOnce();
		const [event] = mocks.audit.mock.calls[0] as [Record<string, unknown>];
		expect(event).toMatchObject({
			action: "guild.settings.update",
			actor: { type: "user", id: "user-1", displayName: "alice" },
			target: { type: "guild", id: "guild-1" },
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
