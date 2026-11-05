import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#server/database/prisma", () => ({ db: { orm: { root: true } } }));

const checkpoints = vi.hoisted(() => ({
	countJoinGuardCheckpoints: vi.fn(),
	fetchJoinGuardCheckpointPage: vi.fn(),
	fetchJoinGuardCheckpointRow: vi.fn(),
}));
vi.mock("#server/database/settings/joinguard/checkpoints", () => checkpoints);

const requests = vi.hoisted(() => ({
	fetchJoinGuardRequestRow: vi.fn(),
	submitJoinGuardRequest: vi.fn(),
}));
vi.mock("#server/database/settings/joinguard/requests", () => requests);

vi.mock("#server/utils/discord", () => ({ getMember: vi.fn() }));

const members = vi.hoisted(() => ({ resolveGuildMembers: vi.fn() }));
vi.mock("#server/utils/audit/resolve-members", async (importOriginal) => ({
	...(await importOriginal<typeof import("#server/utils/audit/resolve-members")>()),
	resolveGuildMembers: members.resolveGuildMembers,
}));

const discord = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock("#server/utils/shared", () => ({ useApi: () => ({ users: { get: discord.getUser } }) }));

import {
	JoinGuardQueueError,
	readJoinGuardQueue,
	readJoinGuardRequestState,
	requestJoinGuardModeratorAction,
} from "#server/utils/join-guard/queue";

const GUILD = "100000000000000000";
const MEMBER = "300000000000000001";
const LEFT = "300000000000000002";
const MOD = "100000000000000002";

function row(overrides: Record<string, unknown> = {}) {
	return {
		id: "9",
		guildId: GUILD,
		userId: MEMBER,
		ruleId: "2",
		ruleName: "Raid",
		status: "Waiting",
		resolution: null,
		moderatorId: null,
		caseId: null,
		accountCreatedAt: 1,
		defaultAvatar: true,
		generatedName: false,
		trust: null,
		linkedAccounts: 0,
		createdAt: 2,
		expiresAt: null,
		resolvedAt: null,
		...overrides,
	};
}

async function failure(promise: Promise<unknown>) {
	try {
		await promise;
	} catch (error) {
		return error;
	}
	throw new Error("expected the call to fail");
}

beforeEach(() => {
	vi.clearAllMocks();
	requests.submitJoinGuardRequest.mockResolvedValue("55");
});

describe("readJoinGuardQueue", () => {
	it("answers a page with its members, a moderator, and the counts", async () => {
		checkpoints.fetchJoinGuardCheckpointPage.mockResolvedValue({
			rows: [
				row(),
				row({
					id: "8",
					userId: LEFT,
					status: "Kicked",
					resolution: "Moderator",
					moderatorId: MOD,
					trust: 7,
				}),
			],
			nextCursor: "8",
		});
		checkpoints.countJoinGuardCheckpoints.mockResolvedValue({
			counts: { Waiting: 1, Verified: 0, Kicked: 1, Banned: 0, all: 2 },
			waiting: 1,
		});
		members.resolveGuildMembers.mockResolvedValue(
			new Map([
				[
					MEMBER,
					{
						nick: "Nick",
						user: {
							id: MEMBER,
							username: "member",
							global_name: "Member",
							avatar: "abc",
						},
					},
				],
				[MOD, { user: { id: MOD, username: "mod", global_name: null, avatar: null } }],
			]),
		);
		// The kicked member is no member anymore: the user is read after.
		discord.getUser.mockResolvedValue({
			id: LEFT,
			username: "gone",
			global_name: null,
			avatar: null,
		});

		const page = await readJoinGuardQueue({
			guildId: GUILD,
			status: "all",
			cursor: "10",
			now: 5,
		});

		expect(checkpoints.fetchJoinGuardCheckpointPage).toHaveBeenCalledWith(
			{ root: true },
			GUILD,
			{
				status: "all",
				cursor: "10",
				now: 5,
			},
		);
		expect(members.resolveGuildMembers).toHaveBeenCalledWith(GUILD, [MEMBER, LEFT, MOD]);
		expect(page.nextCursor).toBe("8");
		expect(page.waiting).toBe(1);
		expect(page.entries[0]?.member).toStrictEqual({
			id: MEMBER,
			username: "member",
			displayName: "Nick",
			avatarUrl: expect.stringContaining(`/avatars/${MEMBER}/abc`),
		});
		expect(page.entries[1]?.member).toStrictEqual({
			id: LEFT,
			username: "gone",
			displayName: "gone",
			avatarUrl: null,
		});
		expect(page.entries[1]?.moderator?.username).toBe("mod");
		// A trust the website does not know reads as none:
		expect(page.entries[1]?.trust).toBeNull();
	});

	it("names a user Discord does not know Unknown User", async () => {
		checkpoints.fetchJoinGuardCheckpointPage.mockResolvedValue({
			rows: [row()],
			nextCursor: null,
		});
		checkpoints.countJoinGuardCheckpoints.mockResolvedValue({ counts: {}, waiting: 0 });
		members.resolveGuildMembers.mockResolvedValue(new Map());
		discord.getUser.mockRejectedValue(new Error("Unknown User"));

		const page = await readJoinGuardQueue({ guildId: GUILD, status: "Waiting" });

		expect(page.entries[0]?.member).toStrictEqual({
			id: MEMBER,
			username: "Unknown User",
			displayName: "Unknown User",
			avatarUrl: null,
		});
	});
});

describe("requestJoinGuardModeratorAction", () => {
	it("asks for a verify of a member who waits, by the moderator's Discord ID", async () => {
		checkpoints.fetchJoinGuardCheckpointRow.mockResolvedValue(row());

		const result = await requestJoinGuardModeratorAction({
			guildId: GUILD,
			moderatorId: MOD,
			body: { kind: "Verify", checkpointId: "9" },
		});

		expect(checkpoints.fetchJoinGuardCheckpointRow).toHaveBeenCalledWith(
			{ root: true },
			GUILD,
			"9",
		);
		expect(requests.submitJoinGuardRequest).toHaveBeenCalledWith({
			kind: "Verify",
			guildId: GUILD,
			userId: MEMBER,
			checkpointId: "9",
			moderatorId: MOD,
		});
		expect(result.requestId).toBe("55");
		expect(result.checkpoint?.userId).toBe(MEMBER);
	});

	it("asks for a kick with its reason, none for an empty one", async () => {
		checkpoints.fetchJoinGuardCheckpointRow.mockResolvedValue(row());

		await requestJoinGuardModeratorAction({
			guildId: GUILD,
			moderatorId: MOD,
			body: { kind: "Kick", checkpointId: "9", reason: " raid " },
		});
		await requestJoinGuardModeratorAction({
			guildId: GUILD,
			moderatorId: MOD,
			body: { kind: "Kick", checkpointId: "9", reason: "  " },
		});

		expect(
			requests.submitJoinGuardRequest.mock.calls.map(([data]) => data.reason),
		).toStrictEqual(["raid", null]);
	});

	it("asks for the button with no row", async () => {
		const result = await requestJoinGuardModeratorAction({
			guildId: GUILD,
			moderatorId: MOD,
			body: { kind: "PostButton" },
		});

		expect(checkpoints.fetchJoinGuardCheckpointRow).not.toHaveBeenCalled();
		expect(requests.submitJoinGuardRequest).toHaveBeenCalledWith({
			kind: "PostButton",
			guildId: GUILD,
			moderatorId: MOD,
		});
		expect(result.checkpoint).toBeNull();
	});

	it("refuses a row of another guild, and a member who does not wait", async () => {
		checkpoints.fetchJoinGuardCheckpointRow.mockResolvedValueOnce(null);
		const unknown = await failure(
			requestJoinGuardModeratorAction({
				guildId: GUILD,
				moderatorId: MOD,
				body: { kind: "Verify", checkpointId: "9" },
			}),
		);
		expect(unknown).toBeInstanceOf(JoinGuardQueueError);
		expect(unknown).toMatchObject({ code: "unknown" });

		checkpoints.fetchJoinGuardCheckpointRow.mockResolvedValueOnce(row({ status: "Verified" }));
		expect(
			await failure(
				requestJoinGuardModeratorAction({
					guildId: GUILD,
					moderatorId: MOD,
					body: { kind: "Kick", checkpointId: "9" },
				}),
			),
		).toMatchObject({ code: "notWaiting" });
		expect(requests.submitJoinGuardRequest).not.toHaveBeenCalled();
	});
});

describe("readJoinGuardRequestState", () => {
	it("tells a request not done yet, done, or refused with the bot's code", async () => {
		requests.fetchJoinGuardRequestRow
			.mockResolvedValueOnce({ id: "55", kind: "Verify", processed: false, error: null })
			.mockResolvedValueOnce({ id: "55", kind: "Verify", processed: true, error: null })
			.mockResolvedValueOnce({
				id: "55",
				kind: "Kick",
				processed: true,
				error: "MissingPermissions: Kick Members",
			});

		expect(await readJoinGuardRequestState(GUILD, "55")).toStrictEqual({
			id: "55",
			kind: "Verify",
			processed: false,
			error: null,
		});
		expect((await readJoinGuardRequestState(GUILD, "55"))?.processed).toBe(true);
		expect((await readJoinGuardRequestState(GUILD, "55"))?.error).toStrictEqual({
			code: "MissingPermissions",
			detail: "Kick Members",
		});
	});

	it("reads with the member's scope, and none for a request it cannot see", async () => {
		requests.fetchJoinGuardRequestRow.mockResolvedValue(null);

		expect(await readJoinGuardRequestState(GUILD, "55", { userId: MEMBER })).toBeNull();
		expect(requests.fetchJoinGuardRequestRow).toHaveBeenCalledWith(
			{ root: true },
			GUILD,
			"55",
			{
				userId: MEMBER,
			},
		);
	});
});
