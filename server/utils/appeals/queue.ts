import type {
	AppealQueueEntry,
	AppealQueueFilter,
	AppealQueueResponse,
	AppealQueueUser,
	AppealDecision,
	AppealRequestOutcome,
} from "#shared/utils/appeal-queue";
import type { APIGuild, APIGuildMember, APIUser } from "discord-api-types/v10";
import { db } from "#server/database/prisma";
import {
	countAppealsByStatus,
	fetchAppealRequest,
	fetchAppealRow,
	fetchAppealRows,
	fetchCaseTypes,
	insertAppealRequest,
	notifyAppealRequest,
	type AppealRecord,
} from "#server/database/settings/appeals/queue";
import { fetchAppealForms } from "#server/database/settings/appeals/storage";
import { readSettings } from "#server/database/settings/functions";
import { isAppealReviewer } from "#server/utils/appeals/access";
import { AppealQueueError } from "#server/utils/appeals/queue-error";
import { memberPermissions } from "#server/utils/discord/admin";
import { mapWithConcurrency } from "#server/utils/mapWithConcurrency";
import { useApi } from "#server/utils/shared";
import { MaximumAppealDecisionReasonLength, parseAppealFailure } from "#shared/utils/appeal-queue";
import { DiscordAPIError } from "@discordjs/rest";
import { RESTJSONErrorCodes } from "discord-api-types/v10";

/** How many users of a page are read from Discord at once. */
const USER_CONCURRENCY = 5;

const UNKNOWN_USER = "Unknown User";

function toUser(
	user: Pick<APIUser, "id" | "username" | "global_name" | "avatar">,
): AppealQueueUser {
	return { id: user.id, displayName: user.global_name ?? user.username, avatar: user.avatar };
}

function isUnknown(error: unknown): boolean {
	return (
		error instanceof DiscordAPIError &&
		(error.code === RESTJSONErrorCodes.UnknownMember ||
			error.code === RESTJSONErrorCodes.UnknownUser)
	);
}

/**
 * Who a user is, for the queue. A banned member is no member of the server, so
 * the member is asked for first and the user after, and a user Discord does not
 * know reads as `Unknown User`.
 */
async function resolveUser(guildId: string, userId: string): Promise<AppealQueueUser> {
	const api = useApi();
	try {
		return toUser((await api.guilds.getMember(guildId, userId)).user);
	} catch (error) {
		if (!isUnknown(error)) return { id: userId, displayName: UNKNOWN_USER, avatar: null };
	}
	try {
		return toUser(await api.users.get(userId));
	} catch {
		return { id: userId, displayName: UNKNOWN_USER, avatar: null };
	}
}

/** The users of a page, each asked for once however many appeals they have on it. */
async function resolveUsers(
	guildId: string,
	userIds: readonly string[],
): Promise<Map<string, AppealQueueUser>> {
	const unique = [...new Set(userIds)];
	const users = await mapWithConcurrency(unique, USER_CONCURRENCY, (id) =>
		resolveUser(guildId, id),
	);
	return new Map(unique.map((id, index) => [id, users[index]!]));
}

/** The settings and the member say whether who asks reviews the appeals of the guild. */
async function canReviewAppeals(guild: APIGuild, member: APIGuildMember): Promise<boolean> {
	const settings = await readSettings(guild.id);
	return isAppealReviewer({
		userId: member.user.id,
		ownerId: guild.owner_id,
		roleIds: member.roles,
		permissions: memberPermissions(guild, member),
		settings,
	});
}

function toEntry(
	row: AppealRecord,
	context: {
		caseTypes: Awaited<ReturnType<typeof fetchCaseTypes>>;
		formNames: ReadonlyMap<string, string>;
		users: ReadonlyMap<string, AppealQueueUser>;
	},
): AppealQueueEntry {
	const unknown = (id: string): AppealQueueUser => ({
		id,
		displayName: UNKNOWN_USER,
		avatar: null,
	});
	const caseType = context.caseTypes.get(row.caseId);
	return {
		id: row.id,
		caseId: row.caseId,
		caseType: caseType === undefined || caseType === "Unknown" ? null : caseType,
		formName: row.formId === null ? null : (context.formNames.get(row.formId) ?? null),
		user: context.users.get(row.userId) ?? unknown(row.userId),
		status: row.status,
		answers: row.answers,
		reason: row.reason,
		reviewer:
			row.reviewerId === null
				? null
				: (context.users.get(row.reviewerId) ?? unknown(row.reviewerId)),
		createdAt: row.createdAt,
		decidedAt: row.decidedAt,
	};
}

/**
 * The appeals of a guild for the review queue: a page of them, how many the
 * guild has in each status, and whether who asks can decide them.
 */
export async function readAppealQueue(input: {
	guild: APIGuild;
	member: APIGuildMember;
	status: AppealQueueFilter;
	limit: number;
	offset: number;
}): Promise<AppealQueueResponse> {
	const { guild, member, status, limit, offset } = input;
	const [rows, counts, forms, canReview] = await Promise.all([
		fetchAppealRows(db.orm, guild.id, {
			status: status === "all" ? undefined : status,
			limit,
			offset,
		}),
		countAppealsByStatus(db.orm, guild.id),
		fetchAppealForms(db.orm, guild.id),
		canReviewAppeals(guild, member),
	]);

	const [caseTypes, users] = await Promise.all([
		fetchCaseTypes(
			db.orm,
			guild.id,
			rows.map((row) => row.caseId),
		),
		resolveUsers(
			guild.id,
			rows.flatMap((row) =>
				row.reviewerId === null ? [row.userId] : [row.userId, row.reviewerId],
			),
		),
	]);
	const formNames = new Map(forms.map((form) => [form.id, form.name]));

	return {
		entries: rows.map((row) => toEntry(row, { caseTypes, formNames, users })),
		total: status === "all" ? counts.pending + counts.accepted + counts.denied : counts[status],
		counts,
		canReview,
	};
}

/**
 * Asks the bot to approve or deny a pending appeal: a request row, announced
 * in the transaction that writes it, which the bot claims and runs. The bot
 * decides, so the answer is only that the request was made; see
 * {@linkcode readAppealRequestOutcome} for how it went.
 *
 * @returns The ID of the request, and the case the appeal is about.
 * @throws {@linkcode AppealQueueError} When who asks does not review the
 * appeals of the guild, the appeal is not the guild's or was decided already,
 * or the reason is too long.
 */
export async function requestAppealDecision(input: {
	guild: APIGuild;
	member: APIGuildMember;
	appealId: string;
	decision: AppealDecision;
	reason: string | null | undefined;
}): Promise<{ requestId: string; caseId: number }> {
	const { guild, member, appealId, decision } = input;
	const reason = input.reason?.trim() || null;
	if (reason !== null && reason.length > MaximumAppealDecisionReasonLength) {
		throw new AppealQueueError("invalid");
	}
	if (!(await canReviewAppeals(guild, member))) throw new AppealQueueError("noAccess");

	const appeal = await fetchAppealRow(db.orm, guild.id, appealId);
	if (appeal === null) throw new AppealQueueError("unknown");
	if (appeal.status !== "pending") throw new AppealQueueError("decided");

	const requestId = await db.transaction(async (tx) => {
		const id = await insertAppealRequest(tx.orm, {
			guildId: guild.id,
			kind: decision,
			appealId: appeal.id,
			moderatorId: member.user.id,
			reason,
		});
		await notifyAppealRequest(tx, id);
		return id;
	});
	return { requestId, caseId: appeal.caseId };
}

/**
 * Where a request of the dashboard is: not claimed yet, done, or refused with
 * the code the bot wrote in its row.
 *
 * @returns The outcome, `null` when the request is not one of the guild.
 */
export async function readAppealRequestOutcome(
	guildId: string,
	requestId: string,
): Promise<AppealRequestOutcome | null> {
	const request = await fetchAppealRequest(db.orm, requestId);
	if (request === null || request.guildId !== guildId) return null;

	if (request.processedAt === null) {
		return { id: request.id, state: "pending", code: null, detail: null };
	}
	if (request.error === null) return { id: request.id, state: "done", code: null, detail: null };

	const { code, detail } = parseAppealFailure(request.error);
	return { id: request.id, state: "failed", code, detail };
}
