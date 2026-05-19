import type { ModerationLogEntry } from "#shared/types/moderation-log";
import type { APIGuildMember } from "discord-api-types/v10";
import prisma from "#server/database/prisma";
import { fallbackMember, resolveGuildMembers } from "#server/utils/audit/resolve-members";
import { ModerationLogQuerySchema } from "#shared/schemas";
import { decodeModerationType, decodeModerationMetadata } from "#shared/types/moderation-types";
import { createError, useLogger } from "evlog";
import { parse } from "valibot";

type ModerationRow = Awaited<ReturnType<typeof prisma.moderation.findMany>>[number];

function mapModerationRow(
	row: ModerationRow,
	memberMap: Map<string, APIGuildMember>,
): ModerationLogEntry {
	return {
		caseId: row.caseId,
		guildId: row.guildId,
		userId: row.userId ?? null,
		targetMember: row.userId ? (memberMap.get(row.userId) ?? fallbackMember(row.userId)) : null,
		moderatorId: row.moderatorId,
		moderatorMember: memberMap.get(row.moderatorId) ?? fallbackMember(row.moderatorId),
		typeCode: row.type,
		typeName: decodeModerationType(row.type),
		reason: row.reason ?? null,
		imageURL: row.imageURL ?? null,
		duration: row.duration ?? null,
		metadata: decodeModerationMetadata(row.metadata),
		createdAt: row.createdAt?.toISOString() ?? null,
	};
}

export default defineWrappedCachedResponseHandler(
	async (event) => {
		const log = useLogger(event);

		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const guild = await getGuild(guildId);
		if (!guild) {
			throw createError({ message: "Guild not found", status: 404 });
		}
		const member = await getCurrentMember(event, guild.id);
		log.set({ member: { id: member.user.id } });
		await canManage(guild, member);

		const { limit, offset, userId, moderatorId, typeCode, from, to, q } =
			await getValidatedQuery(event, (body) => parse(ModerationLogQuerySchema, body));

		const where = {
			guildId,
			...(userId && { userId }),
			...(moderatorId && { moderatorId }),
			...(typeCode !== undefined && { type: typeCode }),
			...(from || to
				? {
						createdAt: {
							...(from && { gte: new Date(from) }),
							...(to && { lte: new Date(to) }),
						},
					}
				: {}),
			...(q && { reason: { contains: q, mode: "insensitive" as const } }),
		};

		const [rows, total] = await Promise.all([
			prisma.moderation.findMany({
				where,
				orderBy: [{ createdAt: "desc" }, { caseId: "desc" }],
				take: limit,
				skip: offset,
			}),
			prisma.moderation.count({ where }),
		]);

		const idsToResolve = [
			...new Set([
				...rows.map((r) => r.userId).filter((id): id is string => id !== null),
				...rows.map((r) => r.moderatorId),
			]),
		];

		const memberMap = await resolveGuildMembers(guildId, idsToResolve);
		const entries: ModerationLogEntry[] = rows.map((row) => mapModerationRow(row, memberMap));

		return { entries, total };
	},
	{
		auth: true,
		maxAge: 30,
		swr: false,
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
