import type { DashboardAuditChanges, DashboardAuditEntry } from "#shared/types/audit-log";
import prisma from "#server/database/prisma";
import { fallbackMember, resolveAuditMembers } from "#server/utils/audit/resolve-members";
import { DASHBOARD_AUDIT_ACTIONS } from "#shared/audit/actions";
import { AuditLogQuerySchema } from "#shared/schemas";
import { auditDiff } from "evlog";
import { useLogger } from "evlog";
import { parse } from "valibot";

function patchToChanges(raw: { before?: unknown; after?: unknown }): DashboardAuditChanges {
	if (!raw.before && !raw.after) return {};
	const diff = auditDiff(raw.before, raw.after);
	const before = (raw.before ?? {}) as Record<string, unknown>;
	const added: Record<string, unknown> = {};
	const removed: Record<string, unknown> = {};
	const changed: Record<string, { from: unknown; to: unknown }> = {};
	for (const op of diff.patch) {
		const key = op.path.replace(/^\//, "").replace(/\//g, ".");
		if (op.op === "add") {
			added[key] = op.value;
		} else if (op.op === "remove") {
			removed[key] = before[key];
		} else {
			changed[key] = { from: before[key], to: op.value };
		}
	}
	return {
		...(Object.keys(added).length > 0 && { added }),
		...(Object.keys(removed).length > 0 && { removed }),
		...(Object.keys(changed).length > 0 && { changed }),
	};
}

export default defineWrappedResponseHandler(
	async (event) => {
		const log = useLogger(event);

		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const guild = await getGuild(guildId);

		const member = await getCurrentMember(event, guild.id);
		log.set({ member: { id: member.user.id } });
		await canManage(guild, member);

		const { limit, offset } = await getValidatedQuery(event, (body) =>
			parse(AuditLogQuerySchema, body),
		);

		const [rows, total] = await Promise.all([
			prisma.auditEvent.findMany({
				where: { tenantId: guild.id, action: { in: [...DASHBOARD_AUDIT_ACTIONS] } },
				orderBy: { timestamp: "desc" },
				take: limit,
				skip: offset,
			}),
			prisma.auditEvent.count({
				where: { tenantId: guild.id, action: { in: [...DASHBOARD_AUDIT_ACTIONS] } },
			}),
		]);

		const memberMap = await resolveAuditMembers(
			guild.id,
			rows.map((r) => r.actorId),
		);

		const entries: DashboardAuditEntry[] = rows.map((row) => ({
			id: row.hash,
			guildId: row.tenantId,
			action: row.action as DashboardAuditEntry["action"],
			outcome: row.outcome as DashboardAuditEntry["outcome"],
			member: memberMap.get(row.actorId) ?? fallbackMember(row.actorId),
			changes: patchToChanges((row.changes ?? {}) as { before?: unknown; after?: unknown }),
			reason: row.reason,
			timestamp: row.timestamp.toISOString(),
		}));

		return { entries, total };
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 5, window: seconds(10) },
	},
);
