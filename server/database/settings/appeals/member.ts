import type { Database } from "#server/database/prisma";
import type { ModerationActionName } from "#shared/types/moderation-types";
import type { AppealQueueAnswer, AppealStatus } from "#shared/utils/appeal-queue";
import type { MyAppealCaseType } from "#shared/utils/my-appeals";
import type { Snowflake } from "discord-api-types/v10";
import { flattenAppealAnswers } from "#server/database/settings/appeals/queue";
import { timestampStringToUtcIso } from "#server/utils/timestamp-string";
import { decodeModerationRecord } from "#shared/types/moderation-types";
import { AppealStatuses } from "#shared/utils/appeal-queue";
import { MyAppealCaseTypes } from "#shared/utils/my-appeals";
import { and } from "@prisma/orm-postgres/orm-client";

// What the member's own appeals area reads of the servers a member is in, in
// one query per table for all of them: every query filters on the guilds and
// the member, which the indexes of the tables start with.

type Orm = Database["orm"];

/** A case of the member of a kind that can be appealed, decoded as the bot decodes it. */
export interface MemberCase {
	guildId: Snowflake;
	/** The number of the case in its server. */
	id: number;
	type: MyAppealCaseType;
	undo: boolean;
	completed: boolean;
	archived: boolean;
	reason: string | null;
	/** An ISO 8601 date. */
	createdAt: string;
	/** In milliseconds, `null` for a permanent one: the table counts seconds. */
	duration: number | null;
}

/** An appeal of the member. */
export interface MemberAppeal {
	guildId: Snowflake;
	caseId: number;
	formId: string | null;
	answers: AppealQueueAnswer[];
	status: AppealStatus;
	reason: string | null;
	/** ISO 8601 dates. */
	createdAt: string;
	decidedAt: string | null;
}

function isAppealableKind(type: string): type is MyAppealCaseType {
	return MyAppealCaseTypes.includes(type as MyAppealCaseType);
}

/**
 * The bans, mutes and timeouts of a member in some servers, the cases that
 * undid them included, which tell what is still in course.
 */
export async function fetchMemberCases(
	orm: Orm,
	guildIds: readonly Snowflake[],
	userId: Snowflake,
): Promise<MemberCase[]> {
	if (guildIds.length === 0) return [];

	const rows = await orm.public.ModerationAction.where((row) =>
		and(row.guildId.in(guildIds.map((id) => BigInt(id))), row.targetId.eq(BigInt(userId))),
	).all();
	return rows.flatMap((row): MemberCase[] => {
		const { type, metadata } = decodeModerationRecord(
			row.action as ModerationActionName,
			row.metadata,
		);
		if (!isAppealableKind(type)) return [];
		return [
			{
				guildId: String(row.guildId),
				id: row.id,
				type,
				undo: metadata.undo,
				completed: metadata.completed,
				archived: metadata.archived,
				reason: row.reason ?? null,
				createdAt: timestampStringToUtcIso(row.createdAt),
				duration: row.duration > 0 ? row.duration * 1000 : null,
			},
		];
	});
}

/** The appeals a member sent in some servers. */
export async function fetchMemberAppeals(
	orm: Orm,
	guildIds: readonly Snowflake[],
	userId: Snowflake,
): Promise<MemberAppeal[]> {
	if (guildIds.length === 0) return [];

	const rows = await orm.public.Appeal.where((row) =>
		and(row.guildId.in(guildIds.map((id) => BigInt(id))), row.userId.eq(BigInt(userId))),
	).all();
	return rows.map((row) => ({
		guildId: String(row.guildId),
		caseId: row.caseId,
		formId: row.formId === null ? null : String(row.formId),
		answers: flattenAppealAnswers(row.answers),
		// A status the dashboard does not know reads as pending, as the bot reads it:
		status: (AppealStatuses as readonly string[]).includes(row.status)
			? (row.status as AppealStatus)
			: "pending",
		reason: row.reason,
		createdAt: timestampStringToUtcIso(row.createdAt),
		decidedAt: row.decidedAt === null ? null : timestampStringToUtcIso(row.decidedAt),
	}));
}

/** The servers that keep the member from appealing, with the reason they gave. */
export async function fetchMemberBlocks(
	orm: Orm,
	guildIds: readonly Snowflake[],
	userId: Snowflake,
): Promise<Map<Snowflake, { reason: string | null }>> {
	if (guildIds.length === 0) return new Map();

	const rows = await orm.public.AppealBlock.where((row) =>
		and(row.guildId.in(guildIds.map((id) => BigInt(id))), row.userId.eq(BigInt(userId))),
	).all();
	return new Map(rows.map((row) => [String(row.guildId), { reason: row.reason }]));
}
