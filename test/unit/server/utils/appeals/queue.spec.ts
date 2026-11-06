import type { APIGuild, APIGuildMember } from "discord-api-types/v10";
import { DiscordAPIError } from "@discordjs/rest";
import { PermissionFlagsBits, RESTJSONErrorCodes } from "discord-api-types/v10";
import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => {
	const tx = { execute: vi.fn(), orm: { transaction: true } };
	return {
		db: {
			orm: { root: true },
			transaction: (run: (tx: unknown) => unknown) => run(tx),
		},
		tx,
	};
});
vi.mock("#server/database/prisma", () => ({ db: database.db }));

const storage = vi.hoisted(() => ({
	countAppealsByStatus: vi.fn(),
	fetchAppealRequest: vi.fn(),
	fetchAppealRow: vi.fn(),
	fetchAppealRows: vi.fn(),
	fetchCaseTypes: vi.fn(),
	insertAppealRequest: vi.fn(),
	notifyAppealRequest: vi.fn(),
}));
vi.mock("#server/database/settings/appeals/queue", () => storage);

const forms = vi.hoisted(() => ({ fetchAppealForms: vi.fn() }));
vi.mock("#server/database/settings/appeals/storage", () => forms);

const settings = vi.hoisted(() => ({ readSettings: vi.fn() }));
vi.mock("#server/database/settings/functions", () => settings);

const discord = vi.hoisted(() => ({ getMember: vi.fn(), getUser: vi.fn() }));
vi.mock("#server/utils/shared", () => ({
	useApi: () => ({ guilds: { getMember: discord.getMember }, users: { get: discord.getUser } }),
}));

import {
	readAppealQueue,
	readAppealRequestOutcome,
	requestAppealDecision,
} from "#server/utils/appeals/queue";
import { AppealQueueError } from "#server/utils/appeals/queue-error";
import { MaximumAppealDecisionReasonLength } from "#shared/utils/appeal-queue";

const GUILD_ID = "100000000000000000";
const OWNER_ID = "100000000000000001";
const MOD_ID = "100000000000000002";
const BANNED_ID = "300000000000000001";
const MEMBER_ID = "300000000000000002";

function guild(): APIGuild {
	return { id: GUILD_ID, owner_id: OWNER_ID, roles: [] } as unknown as APIGuild;
}

function moderator(permissions: bigint = PermissionFlagsBits.BanMembers): APIGuildMember {
	return {
		user: { id: MOD_ID, username: "mod" },
		roles: [],
		permissions: String(permissions),
	} as unknown as APIGuildMember;
}

function appeal(overrides: Record<string, unknown> = {}) {
	return {
		id: "1",
		caseId: 42,
		userId: BANNED_ID,
		formId: null,
		answers: [{ questionId: "why", label: "Why?", value: "My brother." }],
		status: "pending",
		reviewerId: null,
		reason: null,
		createdAt: "2026-11-04T10:02:00.000Z",
		decidedAt: null,
		...overrides,
	};
}

function unknownMember() {
	return new DiscordAPIError(
		{ code: RESTJSONErrorCodes.UnknownMember, message: "Unknown Member" },
		RESTJSONErrorCodes.UnknownMember,
		404,
		"GET",
		"/members",
		{},
	);
}

function unknownUser() {
	return new DiscordAPIError(
		{ code: RESTJSONErrorCodes.UnknownUser, message: "Unknown User" },
		RESTJSONErrorCodes.UnknownUser,
		404,
		"GET",
		"/users",
		{},
	);
}

beforeEach(() => {
	vi.clearAllMocks();
	settings.readSettings.mockResolvedValue({
		appealsManagerRoles: [],
		rolesModerator: [],
		rolesAdmin: [],
	});
	forms.fetchAppealForms.mockResolvedValue([{ id: "7", name: "Ban appeal" }]);
	storage.countAppealsByStatus.mockResolvedValue({ pending: 2, accepted: 3, denied: 4 });
	storage.fetchCaseTypes.mockResolvedValue(new Map());
	storage.fetchAppealRows.mockResolvedValue([]);
	storage.insertAppealRequest.mockResolvedValue("55");
	// A banned member is no member: the user is read after.
	discord.getMember.mockRejectedValue(unknownMember());
	discord.getUser.mockResolvedValue({
		id: BANNED_ID,
		username: "alt_account",
		global_name: null,
		avatar: null,
	});
});

describe("readAppealQueue", () => {
	it("lists the appeals with the type of their case, the form and who is who", async () => {
		storage.fetchAppealRows.mockResolvedValue([
			appeal({ formId: "7" }),
			appeal({
				id: "2",
				caseId: 46,
				userId: MEMBER_ID,
				status: "denied",
				reviewerId: MOD_ID,
				reason: "No.",
				decidedAt: "2026-11-04T11:00:00.000Z",
			}),
		]);
		storage.fetchCaseTypes.mockResolvedValue(
			new Map([
				[42, "Ban"],
				[46, "Timeout"],
			]),
		);
		discord.getMember.mockImplementation((_guild: string, id: string) =>
			id === BANNED_ID
				? Promise.reject(unknownMember())
				: Promise.resolve({
						user: { id, username: `user-${id}`, global_name: "Global", avatar: "abc" },
					}),
		);

		const queue = await readAppealQueue({
			guild: guild(),
			member: moderator(),
			status: "all",
			limit: 25,
			offset: 0,
		});

		expect(queue.counts).toStrictEqual({ pending: 2, accepted: 3, denied: 4 });
		expect(queue.total).toBe(9);
		expect(queue.canReview).toBe(true);
		expect(queue.entries[0]).toMatchObject({
			id: "1",
			caseId: 42,
			caseType: "Ban",
			formName: "Ban appeal",
			status: "pending",
			reviewer: null,
			user: { id: BANNED_ID, displayName: "alt_account", avatar: null },
			answers: [{ questionId: "why", label: "Why?", value: "My brother." }],
		});
		expect(queue.entries[1]).toMatchObject({
			caseType: "Timeout",
			formName: null,
			status: "denied",
			reason: "No.",
			user: { id: MEMBER_ID, displayName: "Global", avatar: "abc" },
			reviewer: { id: MOD_ID, displayName: "Global" },
		});
	});

	it("counts the page by the status it was asked for", async () => {
		const queue = await readAppealQueue({
			guild: guild(),
			member: moderator(),
			status: "denied",
			limit: 25,
			offset: 50,
		});

		expect(queue.total).toBe(4);
		expect(storage.fetchAppealRows).toHaveBeenCalledWith(database.db.orm, GUILD_ID, {
			status: "denied",
			limit: 25,
			offset: 50,
		});
	});

	it("leaves the status out of the read when it asks for all of them", async () => {
		await readAppealQueue({
			guild: guild(),
			member: moderator(),
			status: "all",
			limit: 25,
			offset: 0,
		});

		expect(storage.fetchAppealRows).toHaveBeenCalledWith(database.db.orm, GUILD_ID, {
			status: undefined,
			limit: 25,
			offset: 0,
		});
	});

	it("has no type for a case that is gone or whose type is not known", async () => {
		storage.fetchAppealRows.mockResolvedValue([appeal(), appeal({ id: "2", caseId: 43 })]);
		storage.fetchCaseTypes.mockResolvedValue(new Map([[43, "Unknown"]]));

		const { entries } = await readAppealQueue({
			guild: guild(),
			member: moderator(),
			status: "all",
			limit: 25,
			offset: 0,
		});

		expect(entries.map((entry) => entry.caseType)).toStrictEqual([null, null]);
	});

	it("asks Discord for a user once, however many appeals they have on the page", async () => {
		storage.fetchAppealRows.mockResolvedValue([appeal(), appeal({ id: "2", caseId: 43 })]);

		await readAppealQueue({
			guild: guild(),
			member: moderator(),
			status: "all",
			limit: 25,
			offset: 0,
		});

		expect(discord.getMember).toHaveBeenCalledTimes(1);
		expect(discord.getUser).toHaveBeenCalledTimes(1);
	});

	it("shows Unknown User for a user Discord does not know, and does not fail", async () => {
		storage.fetchAppealRows.mockResolvedValue([appeal()]);
		discord.getUser.mockRejectedValue(unknownUser());

		const { entries } = await readAppealQueue({
			guild: guild(),
			member: moderator(),
			status: "all",
			limit: 25,
			offset: 0,
		});

		expect(entries[0]?.user).toStrictEqual({
			id: BANNED_ID,
			displayName: "Unknown User",
			avatar: null,
		});
	});

	it("does not look for the user of a member it failed to read for another reason", async () => {
		storage.fetchAppealRows.mockResolvedValue([appeal()]);
		discord.getMember.mockRejectedValue(new Error("Discord is down"));

		const { entries } = await readAppealQueue({
			guild: guild(),
			member: moderator(),
			status: "all",
			limit: 25,
			offset: 0,
		});

		expect(discord.getUser).not.toHaveBeenCalled();
		expect(entries[0]?.user.displayName).toBe("Unknown User");
	});

	it("says whether who asks can decide", async () => {
		const asked = { guild: guild(), status: "all", limit: 25, offset: 0 } as const;

		expect((await readAppealQueue({ ...asked, member: moderator(0n) })).canReview).toBe(false);
		expect(
			(
				await readAppealQueue({
					...asked,
					member: moderator(PermissionFlagsBits.ManageGuild),
				})
			).canReview,
		).toBe(true);
	});
});

describe("requestAppealDecision", () => {
	const asked = { appealId: "1", decision: "Approve", reason: undefined } as const;

	beforeEach(() => {
		storage.fetchAppealRow.mockResolvedValue(appeal());
	});

	it("writes the request and announces it in one transaction", async () => {
		const result = await requestAppealDecision({
			...asked,
			guild: guild(),
			member: moderator(),
			reason: "  Fair.  ",
		});

		expect(result).toStrictEqual({ requestId: "55", caseId: 42 });
		expect(storage.insertAppealRequest).toHaveBeenCalledExactlyOnceWith(database.tx.orm, {
			guildId: GUILD_ID,
			kind: "Approve",
			appealId: "1",
			moderatorId: MOD_ID,
			reason: "Fair.",
		});
		expect(storage.notifyAppealRequest).toHaveBeenCalledExactlyOnceWith(database.tx, "55");
	});

	it("writes no reason when it is blank", async () => {
		await requestAppealDecision({
			...asked,
			decision: "Deny",
			guild: guild(),
			member: moderator(),
			reason: "  ",
		});

		expect(storage.insertAppealRequest).toHaveBeenCalledWith(
			database.tx.orm,
			expect.objectContaining({ kind: "Deny", reason: null }),
		);
	});

	async function refused(input: Partial<Parameters<typeof requestAppealDecision>[0]> = {}) {
		const error = await requestAppealDecision({
			...asked,
			guild: guild(),
			member: moderator(),
			reason: null,
			...input,
		}).catch((caught: unknown) => caught);
		expect(error).toBeInstanceOf(AppealQueueError);
		expect(storage.insertAppealRequest).not.toHaveBeenCalled();
		expect(storage.notifyAppealRequest).not.toHaveBeenCalled();
		return (error as AppealQueueError).code;
	}

	it("refuses who does not review the appeals of the guild", async () => {
		expect(await refused({ member: moderator(0n) })).toBe("noAccess");
	});

	it("refuses an appeal that is not the guild's", async () => {
		storage.fetchAppealRow.mockResolvedValue(null);

		expect(await refused()).toBe("unknown");
	});

	it("refuses an appeal that was decided already", async () => {
		storage.fetchAppealRow.mockResolvedValue(appeal({ status: "accepted" }));

		expect(await refused()).toBe("decided");
	});

	it("refuses a reason that is too long", async () => {
		expect(await refused({ reason: "x".repeat(MaximumAppealDecisionReasonLength + 1) })).toBe(
			"invalid",
		);
	});
});

describe("readAppealRequestOutcome", () => {
	function request(overrides: Record<string, unknown> = {}) {
		return { id: "55", guildId: GUILD_ID, processedAt: null, error: null, ...overrides };
	}

	it("is pending while the bot has not done it", async () => {
		storage.fetchAppealRequest.mockResolvedValue(request());

		expect(await readAppealRequestOutcome(GUILD_ID, "55")).toStrictEqual({
			id: "55",
			state: "pending",
			code: null,
			detail: null,
		});
	});

	it("is done once the bot marked it with no error", async () => {
		storage.fetchAppealRequest.mockResolvedValue(
			request({ processedAt: "2026-11-04T10:03:00.000Z" }),
		);

		expect(await readAppealRequestOutcome(GUILD_ID, "55")).toStrictEqual({
			id: "55",
			state: "done",
			code: null,
			detail: null,
		});
	});

	it("has failed with the code and the sentence the bot wrote", async () => {
		storage.fetchAppealRequest.mockResolvedValue(
			request({
				processedAt: "2026-11-04T10:03:00.000Z",
				error: "undoFailed: The case could not be undone, the appeal is still pending.",
			}),
		);

		expect(await readAppealRequestOutcome(GUILD_ID, "55")).toStrictEqual({
			id: "55",
			state: "failed",
			code: "undoFailed",
			detail: "The case could not be undone, the appeal is still pending.",
		});
	});

	it("is none for a request of another guild or that does not exist", async () => {
		storage.fetchAppealRequest.mockResolvedValue(request({ guildId: "999" }));
		expect(await readAppealRequestOutcome(GUILD_ID, "55")).toBeNull();

		storage.fetchAppealRequest.mockResolvedValue(null);
		expect(await readAppealRequestOutcome(GUILD_ID, "56")).toBeNull();
	});
});
