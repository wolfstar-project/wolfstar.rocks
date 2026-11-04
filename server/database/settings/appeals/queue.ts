import type { Database, Models } from "#server/database/prisma";
import type { ModerationActionName, ModerationTypeName } from "#shared/types/moderation-types";
import type { AppealQueueAnswer, AppealStatus } from "#shared/utils/appeal-queue";
import type { Snowflake } from "discord-api-types/v10";
import { db } from "#server/database/prisma";
import { isRowId } from "#server/database/settings/ids";
import { timestampStringToUtcIso } from "#server/utils/timestamp-string";
import { decodeModerationRecord } from "#shared/types/moderation-types";
import { AppealStatuses } from "#shared/utils/appeal-queue";
import { and } from "@prisma/orm-postgres/orm-client";

type Orm = Database["orm"];
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
type AppealRowAnswers = Models.public_Appeal["answers"];

/**
 * The Postgres channel the bot listens on to learn that the dashboard made a
 * request about an appeal; its payload is the ID of the `AppealRequest` row.
 */
export const APPEAL_REQUEST_CHANNEL = "appeal_request";

/** An appeal as the database has it, with its texts ready to read. */
export interface AppealRecord {
	id: string;
	caseId: number;
	userId: Snowflake;
	formId: string | null;
	answers: AppealQueueAnswer[];
	status: AppealStatus;
	reviewerId: Snowflake | null;
	reason: string | null;
	/** An ISO 8601 date. */
	createdAt: string;
	/** An ISO 8601 date, `null` while pending. */
	decidedAt: string | null;
}

/**
 * The answers of an appeal for a person to read: the text, the labels picked,
 * or the names of the files. The files stay on the site, so there is nothing
 * to link to yet.
 */
export function flattenAppealAnswers(answers: AppealRowAnswers): AppealQueueAnswer[] {
	return answers.map((answer) => ({
		questionId: answer.questionId,
		label: answer.label,
		value:
			answer.kind === "text"
				? answer.value
				: answer.kind === "choice"
					? answer.value.join(", ")
					: answer.value.map((file) => file.name).join(", "),
	}));
}

function toAppeal(row: Omit<Models.public_Appeal, "guild">): AppealRecord {
	return {
		id: String(row.id),
		caseId: row.caseId,
		userId: String(row.userId),
		formId: row.formId === null ? null : String(row.formId),
		answers: flattenAppealAnswers(row.answers),
		// A status the dashboard does not know reads as pending, as the bot reads it:
		status: (AppealStatuses as readonly string[]).includes(row.status)
			? (row.status as AppealStatus)
			: "pending",
		reviewerId: row.reviewerId === null ? null : String(row.reviewerId),
		reason: row.reason,
		createdAt: timestampStringToUtcIso(row.createdAt),
		decidedAt: row.decidedAt === null ? null : timestampStringToUtcIso(row.decidedAt),
	};
}

/**
 * Reads the appeals of a guild, the latest first.
 *
 * Mirrors `fetchAppeals()` of `projects/database/src/settings/appeals/storage.ts`
 * in the bot.
 *
 * @param orm The ORM surface to read through, `db.orm` or a transaction's `tx.orm`.
 * @param guildId The guild's ID.
 * @param options One status, or every one when it is left out, and the page.
 */
export async function fetchAppealRows(
	orm: Orm,
	guildId: Snowflake,
	options: { status?: AppealStatus | undefined; limit: number; offset: number },
): Promise<AppealRecord[]> {
	const { status, limit, offset } = options;
	const rows = await orm.public.Appeal.where({
		guildId: BigInt(guildId),
		...(status === undefined ? {} : { status }),
	})
		.orderBy((appeal) => appeal.id.desc())
		.limit(limit)
		.offset(offset)
		.all();
	return rows.map((row) => toAppeal(row));
}

/** Counts the appeals of a guild in each status. */
export async function countAppealsByStatus(
	orm: Orm,
	guildId: Snowflake,
): Promise<Record<AppealStatus, number>> {
	const totals = await Promise.all(
		AppealStatuses.map((status) =>
			orm.public.Appeal.where({ guildId: BigInt(guildId), status }).aggregate(
				(aggregate) => ({
					total: aggregate.count(),
				}),
			),
		),
	);
	const [pending, accepted, denied] = totals.map(({ total }) => Number(total));
	return { pending: pending ?? 0, accepted: accepted ?? 0, denied: denied ?? 0 };
}

/**
 * Reads an appeal of a guild by its ID.
 * @returns The appeal, `null` when the guild has none with that ID, or the ID is not one.
 */
export async function fetchAppealRow(
	orm: Orm,
	guildId: Snowflake,
	appealId: string,
): Promise<AppealRecord | null> {
	if (!isRowId(appealId)) return null;

	const row = await orm.public.Appeal.first({
		id: BigInt(appealId),
		guildId: BigInt(guildId),
	});
	return row === null ? null : toAppeal(row);
}

/**
 * The type of each of the cases a page of appeals is about, decoded as the bot
 * does: the table's `action` is only the closest one its enum has.
 *
 * @returns The type by case number; a case that is gone has no entry.
 */
export async function fetchCaseTypes(
	orm: Orm,
	guildId: Snowflake,
	caseIds: readonly number[],
): Promise<Map<number, ModerationTypeName | "Unknown">> {
	const types = new Map<number, ModerationTypeName | "Unknown">();
	if (caseIds.length === 0) return types;

	const rows = await orm.public.ModerationAction.where((row) =>
		and(row.guildId.eq(BigInt(guildId)), row.id.in([...new Set(caseIds)])),
	).all();
	for (const row of rows) {
		types.set(
			row.id,
			decodeModerationRecord(row.action as ModerationActionName, row.metadata).type,
		);
	}
	return types;
}

export interface AppealRequestData {
	guildId: Snowflake;
	kind: "Approve" | "Deny";
	appealId: string;
	moderatorId: Snowflake;
	reason: string | null;
}

/**
 * Writes a request for the bot to decide an appeal. It belongs in the
 * transaction that also announces it (see {@linkcode notifyAppealRequest}).
 *
 * @returns The ID of the request.
 */
export async function insertAppealRequest(orm: Orm, data: AppealRequestData): Promise<string> {
	const row = await orm.public.AppealRequest.create({
		guildId: BigInt(data.guildId),
		kind: data.kind,
		appealId: BigInt(data.appealId),
		moderatorId: BigInt(data.moderatorId),
		reason: data.reason,
	});
	return String(row.id);
}

/**
 * Tells the bot a request waits for it. Run inside the transaction that
 * writes the request: Postgres delivers a notification only when that
 * transaction commits, so the bot never hears of a request that was rolled
 * back. The payload is the ID alone.
 */
export async function notifyAppealRequest(
	tx: Pick<Transaction, "execute">,
	requestId: string,
): Promise<void> {
	await tx.execute(
		db.raw.sql`SELECT pg_notify(${APPEAL_REQUEST_CHANNEL}, ${requestId})`
			.affectedCount()
			.build(),
	);
}

/** What the dashboard reads of a request to tell where it is. */
export interface AppealRequestRecord {
	id: string;
	guildId: Snowflake;
	/** `null` while the bot has not done it. */
	processedAt: string | null;
	/** Why the bot could not do it, as `<code>: <detail>`; `null` when it did. */
	error: string | null;
}

/**
 * Reads a request of the dashboard.
 * @returns The request, `null` when there is none with that ID.
 */
export async function fetchAppealRequest(
	orm: Orm,
	requestId: string,
): Promise<AppealRequestRecord | null> {
	if (!isRowId(requestId)) return null;

	const row = await orm.public.AppealRequest.first({ id: BigInt(requestId) });
	if (row === null) return null;

	return {
		id: String(row.id),
		guildId: String(row.guildId),
		processedAt: row.processedAt === null ? null : timestampStringToUtcIso(row.processedAt),
		error: row.error,
	};
}
