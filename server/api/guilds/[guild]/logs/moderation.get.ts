import type { ModerationLogEntry } from "#shared/types/moderation-log";
import type { ModerationActionName } from "#shared/types/moderation-types";
import type { ResultType } from "@prisma/orm-postgres/components/runtime";
import type { APIGuildMember } from "discord-api-types/v10";
import { db } from "#server/database/prisma";
import { fallbackMember, resolveGuildMembers } from "#server/utils/audit/resolve-members";
import { ModerationLogQuerySchema } from "#shared/schemas";
import {
	decodeModerationRecord,
	MODERATION_TYPE_CODE,
	MODERATION_TYPE_ENCODED_MARKER,
	moderationRecordFilter,
	moderationTypeFromCode,
} from "#shared/types/moderation-types";
import { and, or } from "@prisma/orm-postgres/orm-client";
import { createError, useLogger } from "evlog";
import { parse } from "valibot";

type ModerationRow = ResultType<typeof db.orm.public.ModerationAction>;

function mapModerationRow(
	row: ModerationRow,
	memberMap: Map<string, APIGuildMember>,
): ModerationLogEntry {
	const targetId = String(row.targetId);
	const moderatorId = String(row.moderatorId);
	// `action` is only the closest action the table's enum has: a mute is stored
	// as `AddRole`, a voice kick as `Kick`. The case type is decoded as the bot does.
	const { type, metadata } = decodeModerationRecord(
		row.action as ModerationActionName,
		row.metadata,
	);

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
		createdAt: timestampStringToUtcIso(row.createdAt),
	};
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

		const { limit, offset, userId, moderatorId, typeCode, from, to, q } =
			await getValidatedQuery(event, (body) => parse(ModerationLogQuerySchema, body));

		// One filtered collection, reused by the page query and the count: chaining
		// returns a new collection each time, so neither terminal disturbs the other.
		let filtered = db.orm.public.ModerationAction.where((row) =>
			row.guildId.eq(BigInt(guildId)),
		);
		if (userId) filtered = filtered.where((row) => row.targetId.eq(BigInt(userId)));
		if (moderatorId) {
			filtered = filtered.where((row) => row.moderatorId.eq(BigInt(moderatorId)));
		}
		if (typeCode !== undefined) {
			const type = moderationTypeFromCode(typeCode);
			if (type === null) return { entries: [], total: 0 };
			// Filtering on `action` would mix the types that share one, so the rows
			// are matched on the encoded type, or on `action` where none is encoded.
			const { encodedMetadata, legacyActions } = moderationRecordFilter(type);
			filtered = filtered.where((row) =>
				legacyActions.length > 0
					? or(
							row.metadata.in(encodedMetadata),
							and(
								row.metadata.lt(MODERATION_TYPE_ENCODED_MARKER),
								row.action.in(legacyActions),
							),
						)
					: row.metadata.in(encodedMetadata),
			);
		}
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

		const memberMap = await resolveGuildMembers(guildId, idsToResolve);
		const entries: ModerationLogEntry[] = rows.map((row) => mapModerationRow(row, memberMap));

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
