import type { DashboardAuditEntry } from "#shared/types/audit-log";
import prisma from "#server/database/prisma";
import { patchToChanges } from "#server/utils/audit/patch-to-changes";
import { fallbackMember, resolveGuildMembers } from "#server/utils/audit/resolve-members";
import { DASHBOARD_AUDIT_ACTIONS } from "#shared/audit/actions";
import { DashboardActivityQuerySchema } from "#shared/schemas";
import { createError, useLogger } from "evlog";
import { parse } from "valibot";

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

		const { limit, offset, actorId, from, to, q } = await getValidatedQuery(event, (body) =>
			parse(DashboardActivityQuerySchema, body),
		);

		const where = {
			tenantId: guild.id,
			action: { in: [...DASHBOARD_AUDIT_ACTIONS] },
			...(actorId && { actorId }),
			...(from || to
				? {
						timestamp: {
							...(from && { gte: new Date(from) }),
							...(to && { lte: new Date(to) }),
						},
					}
				: {}),
			...(q && { reason: { contains: q, mode: "insensitive" as const } }),
		};

		const [rows, total] = await Promise.all([
			prisma.auditEvent.findMany({
				where,
				orderBy: { timestamp: "desc" },
				take: limit,
				skip: offset,
			}),
			prisma.auditEvent.count({ where }),
		]);

		const memberMap = await resolveGuildMembers(
			guild.id,
			rows.map((r) => r.actorId),
		);

		const entries: DashboardAuditEntry[] = rows.map((row) => ({
			id: row.hash,
			guildId: row.tenantId ?? guild.id,
			action: row.action as DashboardAuditEntry["action"],
			outcome: row.outcome as DashboardAuditEntry["outcome"],
			member: memberMap.get(row.actorId) ?? fallbackMember(row.actorId),
			changes: patchToChanges(row.changes ?? {}),
			reason: row.reason,
			timestamp: row.timestamp.toISOString(),
		}));

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
			return `guild:${guildId}:logs:activity${url.search}`;
		},
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 15, window: seconds(60) },
	},
);
