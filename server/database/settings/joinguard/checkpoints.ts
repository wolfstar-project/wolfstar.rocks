import type { Database, Models } from "#server/database/prisma";
import type {
	JoinGuardCheckpointStatus,
	JoinGuardQueueFilter,
	JoinGuardResolution,
} from "#shared/utils/join-guard";
import type { Snowflake } from "discord-api-types/v10";
import { isRowId } from "#server/database/settings/ids";
import { asTimestampString, timestampStringToDate } from "#server/utils/timestamp-string";

type Orm = Database["orm"];
type CheckpointRow = Omit<Models.public_JoinGuardCheckpoint, "guild" | "rule">;

/** A row of the queue as the database has it, the IDs as text and the times in milliseconds. */
export interface JoinGuardCheckpointRecord {
	id: string;
	guildId: Snowflake;
	userId: Snowflake;
	ruleId: string | null;
	ruleName: string;
	status: JoinGuardCheckpointStatus;
	resolution: JoinGuardResolution | null;
	moderatorId: Snowflake | null;
	caseId: number | null;
	accountCreatedAt: number;
	defaultAvatar: boolean;
	generatedName: boolean;
	trust: number | null;
	linkedAccounts: number;
	createdAt: number;
	expiresAt: number | null;
	resolvedAt: number | null;
}

/** How far back the queue and its counts read: the last 7 days. */
export const JoinGuardQueueWindow = 7 * 24 * 60 * 60 * 1000;

/** How many rows a page of the queue has. */
const JoinGuardQueuePageSize = 25;

function toMilliseconds(value: string | null): number | null {
	return value === null ? null : timestampStringToDate(value).getTime();
}

/** A moment, as a `timestamp(3)` column compares with it: UTC without a zone. */
function toTimestamp(milliseconds: number) {
	return asTimestampString(new Date(milliseconds).toISOString().slice(0, -1));
}

export function toJoinGuardCheckpoint(row: CheckpointRow): JoinGuardCheckpointRecord {
	return {
		id: String(row.id),
		guildId: String(row.guildId),
		userId: String(row.userId),
		ruleId: row.ruleId === null ? null : String(row.ruleId),
		ruleName: row.ruleName,
		status: row.status,
		resolution: row.resolution,
		moderatorId: row.moderatorId === null ? null : String(row.moderatorId),
		caseId: row.caseId,
		accountCreatedAt: timestampStringToDate(row.accountCreatedAt).getTime(),
		defaultAvatar: row.defaultAvatar,
		generatedName: row.generatedName,
		trust: row.trust,
		linkedAccounts: row.linkedAccounts,
		createdAt: timestampStringToDate(row.createdAt).getTime(),
		expiresAt: toMilliseconds(row.expiresAt),
		resolvedAt: toMilliseconds(row.resolvedAt),
	};
}

/**
 * Reads a page of the queue of a guild: the rows of the last 7 days, newest
 * first, of one status or of every one, after the row `cursor` names.
 *
 * @param orm The ORM surface to read through.
 * @param guildId The guild's ID.
 * @param options The status (`all` for every one), the ID of the last row of
 * the page before, the moment the 7 days end, and how many rows to read.
 * @returns The rows, and the cursor of the next page: `null` on the last one.
 */
export async function fetchJoinGuardCheckpointPage(
	orm: Orm,
	guildId: Snowflake,
	options: {
		status: JoinGuardQueueFilter;
		cursor?: string | undefined;
		now: number;
		limit?: number;
	},
): Promise<{ rows: JoinGuardCheckpointRecord[]; nextCursor: string | null }> {
	const { status, cursor, now, limit = JoinGuardQueuePageSize } = options;
	if (cursor !== undefined && !isRowId(cursor)) return { rows: [], nextCursor: null };

	const since = toTimestamp(now - JoinGuardQueueWindow);
	// Who waits is listed however long ago they were stopped: with a timeout of 0
	// nobody kicks them, and the "waiting" count counts them all.
	let query = orm.public.JoinGuardCheckpoint.where({
		guildId: BigInt(guildId),
		...(status === "all" ? {} : { status }),
	});
	if (status !== "Waiting") query = query.where((row) => row.createdAt.gte(since));
	if (cursor !== undefined) query = query.where((row) => row.id.lt(BigInt(cursor)));
	const rows = await query
		.orderBy((row) => row.id.desc())
		// One more than the page, to know whether another page follows:
		.limit(limit + 1)
		.all();

	const page = rows.slice(0, limit).map((row) => toJoinGuardCheckpoint(row));
	const last = page.at(-1);
	return { rows: page, nextCursor: rows.length > limit && last ? last.id : null };
}

/** The statuses the queue counts on their own; `all` adds `Left` to them. */
const CountedStatuses = ["Waiting", "Verified", "Kicked", "Banned", "Left"] as const;

/**
 * Counts the rows of the queue of a guild of the last 7 days by filter, and
 * the members who wait at its checkpoint now, however long ago they were stopped.
 */
export async function countJoinGuardCheckpoints(
	orm: Orm,
	guildId: Snowflake,
	now: number,
): Promise<{ counts: Record<JoinGuardQueueFilter, number>; waiting: number }> {
	const id = BigInt(guildId);
	const since = toTimestamp(now - JoinGuardQueueWindow);
	const checkpoints = orm.public.JoinGuardCheckpoint;
	const [waiting, ...totals] = await Promise.all([
		checkpoints
			.where({ guildId: id, status: "Waiting" })
			.aggregate((aggregate) => ({ total: aggregate.count() })),
		...CountedStatuses.map((status) =>
			checkpoints
				.where({ guildId: id, status })
				.where((row) => row.createdAt.gte(since))
				.aggregate((aggregate) => ({ total: aggregate.count() })),
		),
	]);

	const [windowedWaiting = 0, Verified = 0, Kicked = 0, Banned = 0, Left = 0] = totals.map(
		({ total }) => Number(total),
	);
	return {
		counts: {
			// The Waiting filter lists everyone who waits, so it counts them all.
			Waiting: Number(waiting.total),
			Verified,
			Kicked,
			Banned,
			all: windowedWaiting + Verified + Kicked + Banned + Left,
		},
		waiting: Number(waiting.total),
	};
}

/**
 * Reads a row of the queue of a guild by its ID.
 * @returns The row, `null` when the guild has none with that ID, or the ID is not one.
 */
export async function fetchJoinGuardCheckpointRow(
	orm: Orm,
	guildId: Snowflake,
	checkpointId: string,
): Promise<JoinGuardCheckpointRecord | null> {
	if (!isRowId(checkpointId)) return null;

	const row = await orm.public.JoinGuardCheckpoint.first({
		id: BigInt(checkpointId),
		guildId: BigInt(guildId),
	});
	return row === null ? null : toJoinGuardCheckpoint(row);
}

/**
 * Reads the latest row of a member in the queue of a guild: the one that
 * waits when one does (a member waits once at most), else the last resolved.
 * @returns The row, `null` when the guard never stopped the member.
 */
export async function fetchLatestJoinGuardCheckpoint(
	orm: Orm,
	guildId: Snowflake,
	userId: Snowflake,
): Promise<JoinGuardCheckpointRecord | null> {
	const [row] = await orm.public.JoinGuardCheckpoint.where({
		guildId: BigInt(guildId),
		userId: BigInt(userId),
	})
		.orderBy((checkpoint) => checkpoint.id.desc())
		.limit(1)
		.all();
	return row === undefined ? null : toJoinGuardCheckpoint(row);
}
