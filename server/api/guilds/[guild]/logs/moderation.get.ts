import type { ModerationLogEntry } from "#shared/types/moderation-log";
import type {
	ModerationActionName,
	ModerationCaseStatus,
	ModerationTypeName,
} from "#shared/types/moderation-types";
import type { ResultType } from "@prisma/orm-postgres/components/runtime";
import type { APIGuildMember } from "discord-api-types/v10";
import { db } from "#server/database/prisma";
import { fallbackMember, resolveGuildMembers } from "#server/utils/audit/resolve-members";
import { ModerationLogQuerySchema } from "#shared/schemas";
import {
	decodeModerationRecord,
	MODERATION_TYPE_CODE,
	MODERATION_TYPE_ENCODED_MARKER,
	moderationCaseStatus,
	moderationRecordFilter,
	moderationTypeFromCode,
} from "#shared/types/moderation-types";
import { parseModerationCaseExtra } from "#shared/utils/moderation-case";
import { and, or } from "@prisma/orm-postgres/orm-client";
import { createError, useLogger } from "evlog";
import { parse } from "valibot";

type ModerationRow = ResultType<typeof db.orm.public.ModerationAction>;
type CaseDataRow = ResultType<typeof db.orm.public.ModerationCaseData>;
type ModerationCollection = ReturnType<typeof db.orm.public.ModerationAction.where>;

function mapModerationRow(
	row: ModerationRow,
	memberMap: Map<string, APIGuildMember>,
	caseData: CaseDataRow | undefined,
): ModerationLogEntry {
	const targetId = String(row.targetId);
	const moderatorId = String(row.moderatorId);
	// `action` is only the closest action the table's enum has: a mute is stored
	// as `AddRole`, a voice kick as `Kick`. The case type is decoded as the bot does.
	const { type, metadata } = decodeModerationRecord(
		row.action as ModerationActionName,
		row.metadata,
	);
	const channelId = caseData?.channelId ?? null;
	const messageId = caseData?.messageId ?? null;

	return {
		caseId: row.id,
		guildId: String(row.guildId),
		userId: targetId,
		targetMember: memberMap.get(targetId) ?? fallbackMember(targetId),
		moderatorId,
		moderatorMember: memberMap.get(moderatorId) ?? fallbackMember(moderatorId),
		typeCode: type === "Unknown" ? 0 : MODERATION_TYPE_CODE[type],
		typeName: type,
		reason: row.reason ?? null,
		referenceId: row.referenceId ?? null,
		duration: row.duration,
		metadata,
		status: moderationCaseStatus(metadata),
		extra: parseModerationCaseExtra(caseData?.extraData ?? null),
		message:
			channelId === null || messageId === null
				? null
				: { channelId: String(channelId), messageId: String(messageId) },
		createdAt: timestampStringToUtcIso(row.createdAt),
	};
}

/**
 * Narrows the cases to one type, one state, or both. Filtering on `action`
 * would mix the types that share one, and the state lives in the flags, so the
 * rows are matched on every `metadata` value that encodes them, or, on a row
 * written without the marker, on its `action` and its plain flags.
 */
function whereTypeAndStatus(
	collection: ModerationCollection,
	type: ModerationTypeName | undefined,
	status: ModerationCaseStatus | undefined,
): ModerationCollection {
	if (type === undefined && status === undefined) return collection;

	const { encodedMetadata, legacyActions, legacyMetadata } = moderationRecordFilter(type, status);
	return collection.where((row) => {
		const encoded = row.metadata.in(encodedMetadata);
		// No row written without the marker can hold this type.
		if (legacyActions?.length === 0) return encoded;

		return or(
			encoded,
			and(
				legacyMetadata === null
					? row.metadata.lt(MODERATION_TYPE_ENCODED_MARKER)
					: row.metadata.in(legacyMetadata),
				...(legacyActions === null ? [] : [row.action.in(legacyActions)]),
			),
		);
	});
}

/** What the cases on the page hold besides their rows, by case id. */
async function fetchCasesData(guildId: string, caseIds: number[]) {
	if (caseIds.length === 0) return new Map<number, CaseDataRow>();
	const rows = await db.orm.public.ModerationCaseData.where((row) =>
		and(row.guildId.eq(BigInt(guildId)), row.caseId.in(caseIds)),
	).all();
	return new Map(rows.map((row) => [row.caseId, row]));
}

export default defineWrappedCachedResponseHandler(
	async (event) => {
		const log = useLogger(event);

		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		// Authorization runs in the `authorize` hook on every request; the
		// cached resolver only needs the guild for data assembly.
		const guild = await getGuild(guildId);
		if (!guild) {
			throw createError({ message: "Guild not found", status: 404 });
		}

		const { limit, offset, userId, moderatorId, typeCode, status, from, to, q } =
			await getValidatedQuery(event, (body) => parse(ModerationLogQuerySchema, body));

		const type = typeCode === undefined ? undefined : moderationTypeFromCode(typeCode);
		if (type === null) return { entries: [], total: 0 };

		// One filtered collection, reused by the page query and the count: chaining
		// returns a new collection each time, so neither terminal disturbs the other.
		let filtered = db.orm.public.ModerationAction.where((row) =>
			row.guildId.eq(BigInt(guildId)),
		);
		if (userId) filtered = filtered.where((row) => row.targetId.eq(BigInt(userId)));
		if (moderatorId) {
			filtered = filtered.where((row) => row.moderatorId.eq(BigInt(moderatorId)));
		}
		filtered = whereTypeAndStatus(filtered, type, status);
		if (from) filtered = filtered.where((row) => row.createdAt.gte(asTimestampString(from)));
		if (to) filtered = filtered.where((row) => row.createdAt.lte(asTimestampString(to)));
		if (q) filtered = filtered.where((row) => row.reason.ilike(containsPattern(q)));

		const [rows, { total }] = await Promise.all([
			filtered
				.orderBy([(row) => row.createdAt.desc(), (row) => row.id.desc()])
				.limit(limit)
				.offset(offset)
				.all(),
			filtered.aggregate((aggregate) => ({ total: aggregate.count() })),
		]);

		const idsToResolve = [
			...new Set(rows.flatMap((row) => [String(row.targetId), String(row.moderatorId)])),
		];

		const [memberMap, casesData] = await Promise.all([
			resolveGuildMembers(guildId, idsToResolve),
			fetchCasesData(
				guildId,
				rows.map((row) => row.id),
			),
		]);
		const entries: ModerationLogEntry[] = rows.map((row) =>
			mapModerationRow(row, memberMap, casesData.get(row.id)),
		);

		return { entries, total };
	},
	{
		auth: true,
		maxAge: 30,
		swr: false,
		authorize: async (event) => {
			const guildId = getGuildParam(event);
			const guild = await getGuild(guildId);
			if (!guild) {
				throw createError({ message: "Guild not found", status: 404 });
			}
			const member = await getCurrentMember(event, guild.id);
			useLogger(event).set({ guild: { id: guildId }, member: { id: member.user.id } });
			await canManage(guild, member);
		},
		getKey: (event) => {
			const guildId = getGuildParam(event);
			const url = getRequestURL(event);
			return `guild:${guildId}:logs:moderation${url.search}`;
		},
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 30, window: seconds(60) },
	},
);
