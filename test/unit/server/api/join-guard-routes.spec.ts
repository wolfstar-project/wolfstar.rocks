import type { H3Event } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

const GUILD = "100000000000000009";
const MOD_SNOWFLAKE = "200000000000000001";

const mocks = vi.hoisted(() => {
	const mocks = {
		authorize: vi.fn(),
		audit: vi.fn(),
		body: undefined as unknown,
		status: undefined as number | undefined,
		requestJoinGuardModeratorAction: vi.fn(),
		readJoinGuardRequestState: vi.fn(),
		readVerifyMemberId: vi.fn(),
		readJoinGuardVerifyPage: vi.fn(),
		readJoinGuardVerifyGuestPage: vi.fn(),
		session: null as unknown,
	};

	const globals = globalThis as Record<string, unknown>;
	// The wrapper is kept as what it was given, so a test reads the options too:
	globals.defineWrappedResponseHandler = (handler: unknown, options: unknown) => ({
		handler,
		options,
	});
	globals.seconds = (n: number) => n * 1000;
	globals.minutes = (n: number) => n * 60_000;
	globals.readBody = () => Promise.resolve(mocks.body);
	globals.getQuery = () => ({});
	globals.setResponseStatus = (_event: unknown, status: number) => {
		mocks.status = status;
	};
	globals.setResponseHeader = () => undefined;
	globals.getUserSession = () => Promise.resolve(mocks.session);
	return mocks;
});

vi.mock("#server/database/prisma", () => ({ db: {} }));
vi.mock("#server/utils/discord", () => ({}));
vi.mock("#server/utils/guilds/manager", () => ({
	authorizeGuildManager: () => mocks.authorize,
	useManagedGuild: () => ({
		guild: { id: GUILD },
		// Discord's member: its user ID is the snowflake, not the session's ID.
		member: { user: { id: MOD_SNOWFLAKE, username: "mod" } },
	}),
}));
vi.mock("#server/utils/join-guard/queue", () => ({
	JoinGuardQueueError: class extends Error {
		public constructor(public readonly code: string) {
			super(code);
		}
	},
	readJoinGuardQueue: vi.fn(),
	requestJoinGuardModeratorAction: mocks.requestJoinGuardModeratorAction,
	readJoinGuardRequestState: mocks.readJoinGuardRequestState,
}));
vi.mock("#server/utils/join-guard/verify", () => ({
	readJoinGuardVerifyPage: mocks.readJoinGuardVerifyPage,
	readJoinGuardVerifyGuestPage: mocks.readJoinGuardVerifyGuestPage,
	submitJoinGuardVerification: vi.fn(),
	throwJoinGuardVerifyError: (error: unknown) => {
		throw error;
	},
	readVerifyMemberId: mocks.readVerifyMemberId,
}));
vi.mock("evlog", async (importOriginal) => ({
	...(await importOriginal<typeof import("evlog")>()),
	useLogger: vi.fn().mockReturnValue({ set: vi.fn(), error: vi.fn() }),
	withAuditMethods: (log: object) => ({ ...log, audit: mocks.audit }),
}));

interface Route {
	handler: (event: H3Event) => Promise<unknown>;
	options: {
		auth?: boolean;
		authorize?: unknown;
		rateLimit?: { enabled?: boolean; limit?: number; window?: number; scope?: string };
	};
}

async function load(path: string): Promise<Route> {
	return (await import(path)).default as Route;
}

function eventWith(params: Record<string, string>) {
	return { context: { params } } as unknown as H3Event;
}

const MANAGER_ROUTES = [
	"#server/api/guilds/[guild]/joinguard/rules.get",
	"#server/api/guilds/[guild]/joinguard/rules.post",
	"#server/api/guilds/[guild]/joinguard/rules/[rule].patch",
	"#server/api/guilds/[guild]/joinguard/rules/[rule].delete",
	"#server/api/guilds/[guild]/joinguard/checkpoints.get",
	"#server/api/guilds/[guild]/joinguard/requests.post",
	"#server/api/guilds/[guild]/joinguard/requests/[request].get",
];

const MEMBER_ROUTES = [
	"#server/api/verify/[guild]/index.post",
	"#server/api/verify/[guild]/requests/[request].get",
];

beforeEach(() => {
	vi.clearAllMocks();
	mocks.status = undefined;
	mocks.session = null;
});

describe("the join guard routes of the dashboard", () => {
	it.each(MANAGER_ROUTES)(
		"%s is signed in, checks the manager, and is rate limited",
		async (path) => {
			const { options } = await load(path);

			expect(options.auth).toBe(true);
			expect(options.authorize).toBe(mocks.authorize);
			expect(options.rateLimit?.enabled).toBe(true);
		},
	);

	it("asks for a verify in the moderator's Discord ID, audits it, and answers 202", async () => {
		const { handler } = await load("#server/api/guilds/[guild]/joinguard/requests.post");
		mocks.body = { kind: "Verify", checkpointId: "9" };
		mocks.requestJoinGuardModeratorAction.mockResolvedValue({
			requestId: "55",
			checkpoint: { userId: "300000000000000001" },
		});

		expect(await handler(eventWith({ guild: GUILD }))).toStrictEqual({ id: "55" });
		expect(mocks.requestJoinGuardModeratorAction).toHaveBeenCalledWith({
			guildId: GUILD,
			moderatorId: MOD_SNOWFLAKE,
			body: { kind: "Verify", checkpointId: "9" },
		});
		expect(mocks.status).toBe(202);
		expect(mocks.audit).toHaveBeenCalledOnce();
	});

	it("refuses a body that is no request with 400, before asking anything", async () => {
		const { handler } = await load("#server/api/guilds/[guild]/joinguard/requests.post");
		mocks.body = { kind: "Pass", checkpointId: "9" };

		await expect(handler(eventWith({ guild: GUILD }))).rejects.toMatchObject({
			statusCode: 400,
			data: { code: "invalid" },
		});
		expect(mocks.requestJoinGuardModeratorAction).not.toHaveBeenCalled();
		expect(mocks.audit).not.toHaveBeenCalled();
	});

	it("answers a rule the bot could not run with its problem as the code", async () => {
		const { handler } = await load("#server/api/guilds/[guild]/joinguard/rules.post");
		mocks.body = { name: "Nothing set" };

		await expect(handler(eventWith({ guild: GUILD }))).rejects.toMatchObject({
			statusCode: 400,
			data: { code: "conditions", problem: "conditions" },
		});
		expect(mocks.audit).not.toHaveBeenCalled();
	});

	it("answers a field of the wrong type as invalid", async () => {
		const { handler } = await load("#server/api/guilds/[guild]/joinguard/rules.post");
		mocks.body = { name: "Bots", enabled: "yes" };

		await expect(handler(eventWith({ guild: GUILD }))).rejects.toMatchObject({
			statusCode: 400,
			data: { code: "invalid" },
		});
	});

	it("answers 404 for a request of another guild", async () => {
		const { handler } = await load(
			"#server/api/guilds/[guild]/joinguard/requests/[request].get",
		);
		mocks.readJoinGuardRequestState.mockResolvedValue(null);

		await expect(handler(eventWith({ guild: GUILD, request: "55" }))).rejects.toMatchObject({
			statusCode: 404,
			data: { code: "unknown" },
		});
	});
});

describe("the routes of the verification page", () => {
	it.each(MEMBER_ROUTES)("%s is signed in, with no manager check", async (path) => {
		const { options } = await load(path);

		expect(options.auth).toBe(true);
		expect(options.authorize).toBeUndefined();
		expect(options.rateLimit?.enabled).toBe(true);
	});

	it("answers the page to anyone, the member's page when signed in, the guild's when not", async () => {
		const route = await load("#server/api/verify/[guild]/index.get");
		expect(route.options.auth).toBe(false);
		expect(route.options.authorize).toBeUndefined();
		mocks.readJoinGuardVerifyGuestPage.mockResolvedValue({ signedIn: false });
		mocks.readJoinGuardVerifyPage.mockResolvedValue({ signedIn: true });
		const event = eventWith({ guild: GUILD });

		expect(await route.handler(event)).toStrictEqual({ signedIn: false });
		expect(mocks.readJoinGuardVerifyGuestPage).toHaveBeenCalledWith(GUILD);
		expect(mocks.readJoinGuardVerifyPage).not.toHaveBeenCalled();

		mocks.session = { user: { id: "session-user" } };
		expect(await route.handler(event)).toStrictEqual({ signedIn: true });
		expect(mocks.readJoinGuardVerifyPage).toHaveBeenCalledWith(event, GUILD);
	});

	it("lets a member pass a few times a minute at most, on a window of its own", async () => {
		const { options } = await load("#server/api/verify/[guild]/index.post");

		expect(options.rateLimit).toMatchObject({ limit: 5, window: 60_000, scope: "route" });
	});

	it("reads only the member's own requests", async () => {
		const { handler } = await load("#server/api/verify/[guild]/requests/[request].get");
		mocks.readVerifyMemberId.mockResolvedValue("300000000000000001");
		mocks.readJoinGuardRequestState.mockResolvedValue({
			id: "55",
			kind: "Pass",
			processed: false,
			error: null,
		});

		await handler(eventWith({ guild: GUILD, request: "55" }));

		expect(mocks.readJoinGuardRequestState).toHaveBeenCalledWith(GUILD, "55", {
			userId: "300000000000000001",
		});
	});

	it("refuses a guild that is no Discord ID with 400", async () => {
		const { handler } = await load("#server/api/verify/[guild]/index.get");

		await expect(handler(eventWith({ guild: "../x" }))).rejects.toMatchObject({
			statusCode: 400,
		});
	});
});
