import type {
	JoinGuardMember,
	JoinGuardModeratorRequestBody,
	JoinGuardQueueEntry,
	JoinGuardQueueFilter,
	JoinGuardQueuePage,
	JoinGuardRequestState,
	JoinGuardTrust,
} from "#shared/utils/join-guard";
import type { APIGuildMember, APIUser, Snowflake } from "discord-api-types/v10";
import { db } from "#server/database/prisma";
import {
	countJoinGuardCheckpoints,
	fetchJoinGuardCheckpointPage,
	fetchJoinGuardCheckpointRow,
	type JoinGuardCheckpointRecord,
} from "#server/database/settings/joinguard/checkpoints";
import {
	fetchJoinGuardRequestRow,
	submitJoinGuardRequest,
	type JoinGuardRequestData,
} from "#server/database/settings/joinguard/requests";
import { fallbackMember, resolveGuildMembers } from "#server/utils/audit/resolve-members";
import { mapWithConcurrency } from "#server/utils/mapWithConcurrency";
import { useApi } from "#server/utils/shared";
import { avatarURL } from "#shared/utils/discord";
import { JoinGuardTrustLevels, parseJoinGuardRequestError } from "#shared/utils/join-guard";

/** What goes wrong when a moderator asks for something from the queue, to answer with. */
export type JoinGuardQueueErrorCode = "unknown" | "notWaiting";

export class JoinGuardQueueError extends Error {
	public constructor(public readonly code: JoinGuardQueueErrorCode) {
		super(`Join guard queue error: ${code}`);
	}
}

/** How many users who left the guild are read from Discord at once. */
const USER_CONCURRENCY = 5;

type MemberUser = Pick<APIUser, "id" | "username" | "global_name" | "avatar">;

function toMember(user: MemberUser, nick: string | null | undefined = null): JoinGuardMember {
	return {
		id: user.id,
		username: user.username,
		displayName: nick ?? user.global_name ?? user.username,
		avatarUrl: user.avatar === null ? null : avatarURL(user),
	};
}

function fromGuildMember(member: APIGuildMember): JoinGuardMember {
	return toMember(member.user, member.nick);
}

/**
 * Who the members of a page are. A member the queue removed (kicked, banned,
 * left) is no member of the guild anymore, so the user is asked for after the
 * member, and one Discord does not know reads as `Unknown User`.
 */
async function resolveQueueMembers(
	guildId: Snowflake,
	userIds: readonly Snowflake[],
): Promise<Map<Snowflake, JoinGuardMember>> {
	const unique = [...new Set(userIds)];
	const members = await resolveGuildMembers(guildId, unique);
	const resolved = new Map<Snowflake, JoinGuardMember>(
		Array.from(members, ([id, member]) => [id, fromGuildMember(member)]),
	);

	const missing = unique.filter((id) => !resolved.has(id));
	const users = await mapWithConcurrency(missing, USER_CONCURRENCY, async (id) => {
		try {
			return toMember(await useApi().users.get(id));
		} catch {
			return fromGuildMember(fallbackMember(id));
		}
	});
	for (const user of users) resolved.set(user.id, user);
	return resolved;
}

function toTrust(value: number | null): JoinGuardTrust | null {
	return (JoinGuardTrustLevels as readonly number[]).includes(value ?? -1)
		? (value as JoinGuardTrust)
		: null;
}

function toEntry(
	row: JoinGuardCheckpointRecord,
	members: ReadonlyMap<Snowflake, JoinGuardMember>,
): JoinGuardQueueEntry {
	const memberOf = (id: Snowflake) => members.get(id) ?? fromGuildMember(fallbackMember(id));
	return {
		id: row.id,
		member: memberOf(row.userId),
		ruleId: row.ruleId,
		ruleName: row.ruleName,
		status: row.status,
		resolution: row.resolution,
		moderator: row.moderatorId === null ? null : memberOf(row.moderatorId),
		caseId: row.caseId,
		accountCreatedAt: row.accountCreatedAt,
		defaultAvatar: row.defaultAvatar,
		generatedName: row.generatedName,
		trust: toTrust(row.trust),
		linkedAccounts: row.linkedAccounts,
		createdAt: row.createdAt,
		expiresAt: row.expiresAt,
		resolvedAt: row.resolvedAt,
	};
}

/**
 * A page of the checkpoint queue of a guild, with its members, the counts of
 * the last 7 days and how many members wait now.
 */
export async function readJoinGuardQueue(input: {
	guildId: Snowflake;
	status: JoinGuardQueueFilter;
	cursor?: string | undefined;
	now?: number;
}): Promise<JoinGuardQueuePage> {
	const { guildId, status, cursor, now = Date.now() } = input;
	const [page, { counts, waiting }] = await Promise.all([
		fetchJoinGuardCheckpointPage(db.orm, guildId, { status, cursor, now }),
		countJoinGuardCheckpoints(db.orm, guildId, now),
	]);

	const members = await resolveQueueMembers(
		guildId,
		page.rows.flatMap((row) =>
			row.moderatorId === null ? [row.userId] : [row.userId, row.moderatorId],
		),
	);
	return {
		entries: page.rows.map((row) => toEntry(row, members)),
		nextCursor: page.nextCursor,
		counts,
		waiting,
	};
}

/** The request a moderator's body makes, checked against the queue. */
async function toRequestData(
	guildId: Snowflake,
	moderatorId: Snowflake,
	body: JoinGuardModeratorRequestBody,
): Promise<{ data: JoinGuardRequestData; checkpoint: JoinGuardCheckpointRecord | null }> {
	if (body.kind === "PostButton") {
		return { data: { kind: "PostButton", guildId, moderatorId }, checkpoint: null };
	}

	const checkpoint = await fetchJoinGuardCheckpointRow(db.orm, guildId, body.checkpointId);
	if (checkpoint === null) throw new JoinGuardQueueError("unknown");
	if (checkpoint.status !== "Waiting") throw new JoinGuardQueueError("notWaiting");

	const target = { guildId, userId: checkpoint.userId, checkpointId: checkpoint.id, moderatorId };
	return {
		data:
			body.kind === "Verify"
				? { kind: "Verify", ...target }
				: { kind: "Kick", ...target, reason: body.reason?.trim() || null },
		checkpoint,
	};
}

/**
 * Asks the bot to verify or kick a member who waits at the checkpoint, or to
 * post the button of the checkpoint: a request row, announced in the
 * transaction that writes it. The bot acts, so the answer is only that the
 * request was made; see {@linkcode readJoinGuardRequestState} for how it went.
 *
 * @param input.moderatorId The moderator's Discord ID (never the session's user ID).
 * @returns The ID of the request, and the row of the queue it is about.
 * @throws {@linkcode JoinGuardQueueError} When the row is not the guild's, or
 * the member does not wait anymore.
 */
export async function requestJoinGuardModeratorAction(input: {
	guildId: Snowflake;
	moderatorId: Snowflake;
	body: JoinGuardModeratorRequestBody;
}): Promise<{ requestId: string; checkpoint: JoinGuardCheckpointRecord | null }> {
	const { data, checkpoint } = await toRequestData(input.guildId, input.moderatorId, input.body);
	return { requestId: await submitJoinGuardRequest(data), checkpoint };
}

/**
 * Where a request is: done or not, and why the bot could not do it.
 *
 * @param scope `userId` reads only that member's `Pass` requests, for the verification page.
 * @returns The state, `null` when the request is not one of the guild (for the scope).
 */
export async function readJoinGuardRequestState(
	guildId: Snowflake,
	requestId: string,
	scope: { userId?: Snowflake } = {},
): Promise<JoinGuardRequestState | null> {
	const request = await fetchJoinGuardRequestRow(db.orm, guildId, requestId, scope);
	if (request === null) return null;

	return {
		id: request.id,
		kind: request.kind,
		processed: request.processed,
		error: request.error === null ? null : parseJoinGuardRequestError(request.error),
	};
}
