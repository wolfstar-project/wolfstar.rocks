import type { OnboardingDiscordFacts } from "#server/utils/onboarding/discord";
import type { OnboardingStore } from "#server/utils/onboarding/store";
import type { OnboardingStage, OnboardingState } from "#shared/utils/onboarding";
import type { APIGuild, APIGuildMember } from "discord-api-types/v10";
import type { H3Event } from "h3";
import { GuildFeature, PermissionFlagsBits } from "discord-api-types/v10";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryOnboardingStore } from "../utils/onboarding/memory-store";

const GUILD = "100000000000000009";
const ADMIN_SNOWFLAKE = "200000000000000001";
const BOT_ROLE = "300000000000000000";
const MEMBER_ROLE = "300000000000000001";
const OWNER_ROLE = "300000000000000002";
const LOGS = "400000000000000001";
const VERIFY = "400000000000000002";

const mocks = vi.hoisted(() => {
	const mocks = {
		audit: vi.fn(),
		authorize: vi.fn(),
		body: undefined as unknown,
		facts: undefined as unknown,
		query: {} as Record<string, unknown>,
		status: undefined as number | undefined,
		store: undefined as unknown,
	};

	const globals = globalThis as Record<string, unknown>;
	// The wrapper is kept as what it was given, so a test reads the options too:
	globals.defineWrappedResponseHandler = (handler: unknown, options: unknown) => ({
		handler,
		options,
	});
	globals.seconds = (n: number) => n * 1000;
	return mocks;
});

vi.mock("#server/database/prisma", () => ({ db: {} }));
vi.mock("#server/utils/guilds/manager", () => ({
	authorizeGuildManager: () => mocks.authorize,
	useManagedGuild: () => ({
		guild: { features: [], id: GUILD },
		// Discord's member: its user ID is the snowflake, not the session's ID.
		member: { user: { id: ADMIN_SNOWFLAKE, username: "admin" } },
	}),
}));
// The onboarding is kept in memory, with the database's rules for a revision.
vi.mock("#server/database/settings/onboarding/store", () => ({
	onboardingStore: {
		change: (...args: Parameters<OnboardingStore["change"]>) =>
			(mocks.store as OnboardingStore).change(...args),
		countWeek: (...args: Parameters<OnboardingStore["countWeek"]>) =>
			(mocks.store as OnboardingStore).countWeek(...args),
		read: (...args: Parameters<OnboardingStore["read"]>) =>
			(mocks.store as OnboardingStore).read(...args),
	},
}));
// Discord is not asked: the facts it would answer are the test's.
vi.mock("#server/utils/onboarding/discord", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	fetchOnboardingDiscordFacts: () => Promise.resolve(mocks.facts),
}));
vi.mock("evlog", async (importOriginal) => ({
	...(await importOriginal<typeof import("evlog")>()),
	useLogger: vi.fn().mockReturnValue({ error: vi.fn(), set: vi.fn() }),
	withAuditMethods: (log: object) => ({ ...log, audit: mocks.audit }),
}));
vi.mock("#server/utils/wrappedEventHandler", () => ({
	defineWrappedResponseHandler: (...args: unknown[]) =>
		(
			Reflect.get(globalThis, "defineWrappedResponseHandler") as (
				...args: unknown[]
			) => unknown
		)(...args),
}));
vi.mock("nuxt/server", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	getQuery: () => mocks.query,
	readBody: () => Promise.resolve(mocks.body),
	setResponseStatus: (_event: unknown, status: number) => {
		mocks.status = status;
	},
}));

interface Route {
	handler: (event: H3Event) => Promise<OnboardingState>;
	options: {
		auth?: boolean;
		authorize?: unknown;
		rateLimit?: { enabled?: boolean };
	};
}

async function load(path: string): Promise<Route> {
	return (await import(path)).default as Route;
}

function eventWith(params: Record<string, string> = {}) {
	return { context: { params: { guild: GUILD, ...params } } } as unknown as H3Event;
}

const ROUTES = {
	create: "#server/api/guilds/[guild]/onboarding/stages.post",
	edit: "#server/api/guilds/[guild]/onboarding/stages/[stage].patch",
	order: "#server/api/guilds/[guild]/onboarding/stages/order.put",
	read: "#server/api/guilds/[guild]/onboarding.get",
	remove: "#server/api/guilds/[guild]/onboarding/stages/[stage].delete",
	settings: "#server/api/guilds/[guild]/onboarding.patch",
} as const;

const LOG_FLAGS =
	PermissionFlagsBits.ViewChannel |
	PermissionFlagsBits.SendMessages |
	PermissionFlagsBits.EmbedLinks;

function facts(botPermissions: bigint = LOG_FLAGS | PermissionFlagsBits.ManageRoles) {
	const discord: OnboardingDiscordFacts = {
		bot: { roles: [BOT_ROLE], user: { id: "200000000000000000" } } as unknown as APIGuildMember,
		channels: [
			{ id: LOGS, permission_overwrites: [], type: 0 },
			{ id: VERIFY, permission_overwrites: [], type: 0 },
		],
		guild: {
			features: [GuildFeature.Community],
			id: GUILD,
			roles: [
				{ id: GUILD, managed: false, permissions: "0", position: 0 },
				{ id: MEMBER_ROLE, managed: false, permissions: "0", position: 1 },
				{ id: BOT_ROLE, managed: true, permissions: String(botPermissions), position: 2 },
				{ id: OWNER_ROLE, managed: false, permissions: "0", position: 3 },
			],
		} as unknown as APIGuild,
		nativeOnboarding: true,
	};
	return discord;
}

function makeStage(overrides: Partial<OnboardingStage> = {}): OnboardingStage {
	return {
		answers: [],
		challenge: "Button",
		createdAt: 0,
		enabled: true,
		failureAction: "None",
		failureTimeout: null,
		id: "1",
		maxAttempts: 3,
		name: "Are you human?",
		position: 0,
		question: null,
		roleId: null,
		timeLimit: 600,
		trigger: "Join",
		...overrides,
	};
}

let memory = createMemoryOnboardingStore();

function open(initial: Parameters<typeof createMemoryOnboardingStore>[0] = {}) {
	memory = createMemoryOnboardingStore({ messageChannelId: VERIFY, ...initial });
	mocks.store = memory.store;
}

/** The changes the last audit event recorded: one entry per field, with what it was and what it is. */
function audited(): unknown {
	const event = mocks.audit.mock.calls.at(-1)?.[0] as
		| { changes?: { patch?: unknown } }
		| undefined;
	return event?.changes?.patch;
}

beforeEach(() => {
	vi.clearAllMocks();
	mocks.body = undefined;
	mocks.query = {};
	mocks.status = undefined;
	mocks.facts = facts();
	open();
});

describe("the onboarding routes", () => {
	it.each(Object.values(ROUTES))(
		"%s is signed in, checks the manager, and is rate limited",
		async (path) => {
			const { options } = await load(path);

			expect(options.auth).toBe(true);
			expect(options.authorize).toBe(mocks.authorize);
			expect(options.rateLimit?.enabled).toBe(true);
		},
	);

	it("answers the onboarding with its revision and what is blocked", async () => {
		open({
			logChannelId: LOGS,
			messageChannelId: null,
			revision: 4,
			stages: [makeStage({ roleId: OWNER_ROLE })],
		});
		const { handler } = await load(ROUTES.read);

		const state = await handler(eventWith());

		expect(state).toMatchObject({
			blockers: [
				{ code: "noVerificationMessage" },
				{ code: "roleUnmanageable", roleId: OWNER_ROLE, stageId: "1" },
			],
			enabled: true,
			logChannelId: LOGS,
			messageChannelId: null,
			revision: 4,
			week: { failed: 0, passed: 0, waiting: 0 },
		});
		expect(state.stages.map((stage) => stage.name)).toStrictEqual(["Are you human?"]);
	});
});

describe("POST …/onboarding/stages", () => {
	it("creates the stage, audits it under its name, and answers 201 with the next revision", async () => {
		open({ revision: 2 });
		const { handler } = await load(ROUTES.create);
		mocks.body = { revision: 2, stage: { name: "Quick check", roleId: MEMBER_ROLE } };

		const state = await handler(eventWith());

		expect(mocks.status).toBe(201);
		expect(state.revision).toBe(3);
		expect(state.stages).toMatchObject([
			{ challenge: "Button", maxAttempts: 3, name: "Quick check", roleId: MEMBER_ROLE },
		]);
		expect(mocks.audit).toHaveBeenCalledOnce();
		expect(JSON.stringify(audited())).toContain("onboardingStage.Quick check");
	});

	it("refuses an old revision with 409, and neither writes nor audits", async () => {
		open({ revision: 5 });
		const { handler } = await load(ROUTES.create);
		mocks.body = { revision: 4, stage: { name: "Quick check" } };

		await expect(handler(eventWith())).rejects.toMatchObject({
			data: { code: "conflict" },
			statusCode: 409,
		});
		expect(memory.record().stages).toStrictEqual([]);
		expect(mocks.audit).not.toHaveBeenCalled();
	});

	it("refuses a role WolfStar cannot give with 422, before writing anything", async () => {
		const { handler } = await load(ROUTES.create);
		mocks.body = { revision: 0, stage: { name: "Quick check", roleId: OWNER_ROLE } };

		await expect(handler(eventWith())).rejects.toMatchObject({
			data: { code: "role" },
			statusCode: 422,
		});
		expect(memory.record()).toMatchObject({ revision: 0, stages: [] });
	});

	it("answers the problem of a stage the bot could not run", async () => {
		const { handler } = await load(ROUTES.create);
		mocks.body = { revision: 0, stage: { challenge: "Question", name: "Server rules" } };

		await expect(handler(eventWith())).rejects.toMatchObject({
			data: { code: "stage", problem: "question" },
			statusCode: 400,
		});
	});

	it.each([
		["no revision", { stage: { name: "Quick check" } }],
		["a challenge that is none", { revision: 0, stage: { challenge: "Dance", name: "x" } }],
		["a role that is no Discord ID", { revision: 0, stage: { name: "x", roleId: "member" } }],
	])("refuses a body with %s with 400", async (_label, body) => {
		const { handler } = await load(ROUTES.create);
		mocks.body = body;

		await expect(handler(eventWith())).rejects.toMatchObject({
			data: { code: "invalid" },
			statusCode: 400,
		});
		expect(memory.record().revision).toBe(0);
	});
});

describe("PATCH …/onboarding/stages/:stage", () => {
	it("audits only the fields that changed", async () => {
		open({ revision: 1, stages: [makeStage()] });
		const { handler } = await load(ROUTES.edit);
		mocks.body = { revision: 1, stage: { enabled: false, name: "Are you human?" } };

		const state = await handler(eventWith({ stage: "1" }));

		expect(state.stages[0]?.enabled).toBe(false);
		expect(audited()).toStrictEqual([
			{
				from: true,
				op: "replace",
				path: "/onboardingStage.Are you human?/enabled",
				value: false,
			},
		]);
	});

	it("audits nothing for a change that changes nothing", async () => {
		open({ revision: 1, stages: [makeStage()] });
		const { handler } = await load(ROUTES.edit);
		mocks.body = { revision: 1, stage: { enabled: true } };

		await handler(eventWith({ stage: "1" }));

		expect(mocks.audit).not.toHaveBeenCalled();
	});

	it("switches off a stage whose role WolfStar can no longer give", async () => {
		open({ revision: 1, stages: [makeStage({ roleId: OWNER_ROLE })] });
		const { handler } = await load(ROUTES.edit);
		mocks.body = { revision: 1, stage: { enabled: false } };

		const state = await handler(eventWith({ stage: "1" }));

		expect(state.stages[0]).toMatchObject({ enabled: false, roleId: OWNER_ROLE });
	});

	it("answers 404 for a stage that is gone, and 400 for an ID that is none", async () => {
		const { handler } = await load(ROUTES.edit);
		mocks.body = { revision: 0, stage: { enabled: false } };

		await expect(handler(eventWith({ stage: "9" }))).rejects.toMatchObject({
			data: { code: "unknown" },
			statusCode: 404,
		});
		await expect(handler(eventWith({ stage: "nine" }))).rejects.toMatchObject({
			data: { code: "invalid" },
			statusCode: 400,
		});
	});
});

describe("DELETE …/onboarding/stages/:stage", () => {
	it("reads the revision off the query, deletes the stage and audits what it was", async () => {
		open({
			revision: 3,
			stages: [makeStage(), makeStage({ id: "2", name: "Rules", position: 1 })],
		});
		const { handler } = await load(ROUTES.remove);
		mocks.query = { revision: "3" };

		const state = await handler(eventWith({ stage: "1" }));

		expect(state.stages.map((stage) => [stage.name, stage.position])).toStrictEqual([
			["Rules", 0],
		]);
		expect(state.revision).toBe(4);
		expect(JSON.stringify(audited())).toContain("onboardingStage.Are you human?");
	});

	it("refuses a query with no revision with 400", async () => {
		open({ stages: [makeStage()] });
		const { handler } = await load(ROUTES.remove);

		await expect(handler(eventWith({ stage: "1" }))).rejects.toMatchObject({
			data: { code: "invalid" },
			statusCode: 400,
		});
		expect(memory.record().stages).toHaveLength(1);
	});
});

describe("PUT …/onboarding/stages/order", () => {
	it("reorders the stages and audits the order by their names", async () => {
		open({
			revision: 1,
			stages: [makeStage(), makeStage({ id: "2", name: "Rules", position: 1 })],
		});
		const { handler } = await load(ROUTES.order);
		mocks.body = { order: ["2", "1"], revision: 1 };

		const state = await handler(eventWith());

		expect(state.stages.map((stage) => stage.name)).toStrictEqual(["Rules", "Are you human?"]);
		expect(audited()).toStrictEqual([
			{
				from: ["Are you human?", "Rules"],
				op: "replace",
				path: "/onboarding.order",
				value: ["Rules", "Are you human?"],
			},
		]);
	});

	it("refuses an order that leaves a stage out with 400", async () => {
		open({
			revision: 1,
			stages: [makeStage(), makeStage({ id: "2", name: "Rules", position: 1 })],
		});
		const { handler } = await load(ROUTES.order);
		mocks.body = { order: ["2"], revision: 1 };

		await expect(handler(eventWith())).rejects.toMatchObject({
			data: { code: "invalid" },
			statusCode: 400,
		});
	});
});

describe("PATCH …/onboarding", () => {
	it("saves the log channel and audits the change", async () => {
		open({ revision: 1 });
		const { handler } = await load(ROUTES.settings);
		mocks.body = { logChannelId: LOGS, revision: 1 };

		const state = await handler(eventWith());

		expect(state).toMatchObject({ blockers: [], logChannelId: LOGS, revision: 2 });
		expect(audited()).toStrictEqual([
			{ from: null, op: "replace", path: "/onboarding.logChannel", value: LOGS },
		]);
	});

	it("names the permissions WolfStar lacks in the channel, and keeps the saved one", async () => {
		open({ logChannelId: VERIFY, revision: 1 });
		mocks.facts = facts(PermissionFlagsBits.ViewChannel);
		const { handler } = await load(ROUTES.settings);
		mocks.body = { logChannelId: LOGS, revision: 1 };

		await expect(handler(eventWith())).rejects.toMatchObject({
			data: { code: "logPermissions", missing: ["SendMessages", "EmbedLinks"] },
			statusCode: 422,
		});
		expect(memory.record()).toMatchObject({ logChannelId: VERIFY, revision: 1 });
		expect(mocks.audit).not.toHaveBeenCalled();
	});

	it("refuses a channel the server does not have with 422", async () => {
		const { handler } = await load(ROUTES.settings);
		mocks.body = { logChannelId: "499999999999999999", revision: 0 };

		await expect(handler(eventWith())).rejects.toMatchObject({
			data: { code: "logChannel" },
			statusCode: 422,
		});
	});

	it("removes the log channel without asking what WolfStar can do in it", async () => {
		open({ logChannelId: LOGS, revision: 1 });
		mocks.facts = facts(0n);
		const { handler } = await load(ROUTES.settings);
		mocks.body = { logChannelId: null, revision: 1 };

		const state = await handler(eventWith());

		expect(state.logChannelId).toBeNull();
	});

	it("refuses an old revision with 409, and keeps the saved channel", async () => {
		open({ logChannelId: VERIFY, revision: 3 });
		const { handler } = await load(ROUTES.settings);
		mocks.body = { logChannelId: LOGS, revision: 2 };

		await expect(handler(eventWith())).rejects.toMatchObject({
			data: { code: "conflict" },
			statusCode: 409,
		});
		expect(memory.record().logChannelId).toBe(VERIFY);
	});
});
