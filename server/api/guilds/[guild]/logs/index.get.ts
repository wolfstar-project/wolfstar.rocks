import type { DashboardAuditEntry } from "#shared/types/audit-log";
import { db } from "#server/database/prisma";
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

		// One filtered collection, reused by the page query and the count: chaining
		// returns a new collection each time, so neither terminal disturbs the other.
		let filtered = db.orm.public.AuditEvent.where((row) =>
			row.tenantId.eq(BigInt(guild.id)),
		).where((row) => row.action.in([...DASHBOARD_AUDIT_ACTIONS]));
		if (actorId) filtered = filtered.where((row) => row.actorId.eq(BigInt(actorId)));
		if (from) filtered = filtered.where((row) => row.timestamp.gte(asTimestampString(from)));
		if (to) filtered = filtered.where((row) => row.timestamp.lte(asTimestampString(to)));
		if (q) filtered = filtered.where((row) => row.reason.ilike(`%${q}%`));

		const [rows, { total }] = await Promise.all([
			filtered
				.orderBy((row) => row.timestamp.desc())
				.limit(limit)
				.offset(offset)
				.all(),
			filtered.aggregate((aggregate) => ({ total: aggregate.count() })),
		]);

		const memberMap = await resolveGuildMembers(
			guild.id,
			rows.map((row) => String(row.actorId)),
		);

		const entries: DashboardAuditEntry[] = rows.map((row) => ({
			id: row.hash,
			guildId: row.tenantId === null ? guild.id : String(row.tenantId),
			action: row.action as DashboardAuditEntry["action"],
			outcome: row.outcome as DashboardAuditEntry["outcome"],
			member: memberMap.get(String(row.actorId)) ?? fallbackMember(String(row.actorId)),
			changes: patchToChanges(
				// `changes` is a JSON column, so its type admits scalars and arrays;
				// the drain only ever writes the patch object this expects.
				typeof row.changes === "object" &&
					row.changes !== null &&
					!Array.isArray(row.changes)
					? (row.changes as Record<string, unknown>)
					: {},
			),
			reason: row.reason,
			timestamp: row.timestamp,
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
