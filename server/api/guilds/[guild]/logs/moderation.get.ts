import type { ModerationLogEntry } from "#shared/types/moderation-log";
import type { ModerationAction } from "#shared/types/moderation-types";
import type { ResultType } from "@prisma/orm-postgres/components/runtime";
import type { APIGuildMember } from "discord-api-types/v10";
import { db } from "#server/database/prisma";
import { fallbackMember, resolveGuildMembers } from "#server/utils/audit/resolve-members";
import { ModerationLogQuerySchema } from "#shared/schemas";
import {
	decodeModerationMetadata,
	MODERATION_ACTION_CODE,
	moderationActionFromCode,
} from "#shared/types/moderation-types";
import { createError, useLogger } from "evlog";
import { parse } from "valibot";

type ModerationRow = ResultType<typeof db.orm.public.ModerationAction>;

function mapModerationRow(
	row: ModerationRow,
	memberMap: Map<string, APIGuildMember>,
): ModerationLogEntry {
	const targetId = String(row.targetId);
	const moderatorId = String(row.moderatorId);
	// V7 stores the action by name, so the name is the identity and the numeric
	// code is looked up from it rather than the other way round.
	const action = row.action as ModerationAction;

	return {
		caseId: row.id,
		guildId: String(row.guildId),
		userId: targetId,
		targetMember: memberMap.get(targetId) ?? fallbackMember(targetId),
		moderatorId,
		moderatorMember: memberMap.get(moderatorId) ?? fallbackMember(moderatorId),
		typeCode: MODERATION_ACTION_CODE[action],
		typeName: action,
		reason: row.reason ?? null,
		referenceId: row.referenceId ?? null,
		duration: row.duration,
		metadata: decodeModerationMetadata(row.metadata),
		createdAt: row.createdAt,
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
			// An unrecognised code must not reach the database as an enum literal,
			// so it selects nothing instead.
			const action = moderationActionFromCode(typeCode);
			if (action === null) return { entries: [], total: 0 };
			filtered = filtered.where((row) => row.action.eq(action));
		}
		if (from) filtered = filtered.where((row) => row.createdAt.gte(asTimestampString(from)));
		if (to) filtered = filtered.where((row) => row.createdAt.lte(asTimestampString(to)));
		if (q) filtered = filtered.where((row) => row.reason.ilike(`%${q}%`));

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
