import type { ReportEntry, ReportListResponse } from "#shared/types/report";
import type { ResultType } from "@prisma/orm-postgres/components/runtime";
import { db } from "#server/database/prisma";
import { ReportQuerySchema } from "#shared/schemas";
import { createError, useLogger } from "evlog";
import { parse } from "valibot";

type ReportRow = ResultType<typeof db.orm.public.Report>;

function mapReportRow(row: ReportRow): ReportEntry {
	return {
		id: String(row.id),
		targetId: String(row.targetId),
		targetTag: row.targetTag,
		reason: row.reason,
		status: row.status,
		createdAt: timestampStringToUtcIso(row.createdAt),
		closedAt: row.closedAt ? timestampStringToUtcIso(row.closedAt) : null,
	};
}

/**
 * The member reports of a guild, newest first, for the review queue of the
 * Moderation section. Who filed a report is left out: a report can be
 * anonymous, and the queue is about the reported member.
 */
export default defineWrappedCachedResponseHandler(
	async (event): Promise<ReportListResponse> => {
		const log = useLogger(event);

		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const { limit, offset, status } = await getValidatedQuery(event, (body) =>
			parse(ReportQuerySchema, body),
		);

		let filtered = db.orm.public.Report.where((row) => row.guildId.eq(BigInt(guildId)));
		if (status) filtered = filtered.where((row) => row.status.eq(status));

		const [rows, { total }] = await Promise.all([
			filtered
				.orderBy((row) => row.id.desc())
				.limit(limit)
				.offset(offset)
				.all(),
			filtered.aggregate((aggregate) => ({ total: aggregate.count() })),
		]);

		return { entries: rows.map(mapReportRow), total };
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
			return `guild:${guildId}:reports${url.search}`;
		},
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 30, window: seconds(60) },
	},
);
