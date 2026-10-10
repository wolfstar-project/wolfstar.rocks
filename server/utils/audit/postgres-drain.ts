import type { Models } from "#server/database/prisma";
import type { DrainContext, DrainFn } from "evlog";
import { randomUUID } from "node:crypto";
import { db } from "#server/database/prisma";
import { asTimestampString } from "#server/utils/timestamp-string";
import { type AuditEnvelope, hashEnvelope } from "#shared/audit/envelope";

type AuditEventRow = Models.public_AuditEvent;

/**
 * Key of the transaction-level advisory lock every writer of the audit chain
 * takes. The chain head is one row shared by all tenants, so appends have to
 * be globally serialized; the bot's `AuditLogManager` takes the same key
 * (`0x4155444C`, ASCII `AUDL`), which is what keeps the two services from
 * forking the chain between them. Released on commit or rollback.
 */
const AUDIT_CHAIN_LOCK_KEY = 1_096_107_084;

const SNOWFLAKE_PATTERN = /^\d{1,20}$/u;

/**
 * The V7 contract stores actor, target and tenant ids as `BIGINT`. A value
 * that is not a snowflake cannot be stored, and silently dropping it would
 * leave a row whose hash no longer matches its columns, so it is refused.
 */
function toSnowflakeColumn(field: string, value: string): bigint {
	if (!SNOWFLAKE_PATTERN.test(value)) {
		throw new TypeError(`[audit] ${field} "${value}" is not a snowflake`);
	}
	return BigInt(value);
}

function toOptionalSnowflakeColumn(field: string, value: string | undefined): bigint | null {
	return value === undefined ? null : toSnowflakeColumn(field, value);
}

export function createPostgresAuditDrain(): DrainFn {
	return async (ctx: DrainContext): Promise<void> => {
		const audit = ctx.event.audit;
		if (!audit) return;

		// Allow-listed projection — never read email, ip, cookie, raw headers
		const action = audit.action;
		const actorType = audit.actor.type;
		const actorId = audit.actor.id;
		const actorName = audit.actor.displayName;
		const targetType = audit.target?.type;
		const targetId = audit.target?.id;
		const outcome = audit.outcome;
		const tenantId = audit.context?.tenantId;
		const reason = audit.reason;
		// Normalize undefined to null so the envelope hash is stable and matches
		// the null stored in the DB when no changes are recorded.
		const changes = audit.changes ?? null;

		// Only safe context fields — explicitly exclude ip, full headers
		const context: AuditEnvelope["context"] = audit.context
			? {
					requestId: audit.context.requestId,
					traceId: audit.context.traceId,
					userAgent: audit.context.userAgent,
				}
			: undefined;

		// Converted before the transaction opens: a value the columns cannot
		// hold must not cost a connection or the chain lock.
		const actorIdColumn = toSnowflakeColumn("actor id", actorId);
		const targetIdColumn = toOptionalSnowflakeColumn("target id", targetId);
		const tenantIdColumn = toOptionalSnowflakeColumn("tenant id", tenantId);
		const timestamp = asTimestampString(new Date(ctx.event.timestamp).toISOString());

		await db.transaction(async (tx) => {
			await tx.execute(
				db.raw.sql`SELECT pg_advisory_xact_lock(${AUDIT_CHAIN_LOCK_KEY})`
					.affectedCount()
					.build(),
			);

			const head = await tx.orm.public.AuditChainHead.first({ id: "default" });
			const prevHash = head?.hash ?? null;

			const envelope: AuditEnvelope = {
				action,
				outcome,
				actor: { type: actorType, id: actorId, displayName: actorName },
				target: targetType && targetId ? { type: targetType, id: targetId } : undefined,
				tenantId: tenantId ?? undefined,
				reason: reason ?? undefined,
				changes,
				timestamp: ctx.event.timestamp,
				context,
				prevHash,
			};

			const hash = hashEnvelope(envelope);

			// `hash` is unique. Under the chain lock a second row with this hash
			// can only be the same event delivered twice, so it is already stored.
			const existing = await tx.orm.public.AuditEvent.first({ hash });
			if (existing) return;

			await tx.orm.public.AuditEvent.create({
				id: randomUUID(),
				hash,
				prevHash,
				action,
				actorType,
				actorId: actorIdColumn,
				actorName: actorName ?? null,
				targetType: targetType ?? null,
				targetId: targetIdColumn,
				outcome,
				tenantId: tenantIdColumn,
				reason: reason ?? null,
				timestamp,
				// The envelope guard above already proved both are plain JSON.
				changes: changes as AuditEventRow["changes"],
				context: (context ?? null) as AuditEventRow["context"],
			});

			await tx.orm.public.AuditChainHead.upsert({
				create: { id: "default", hash, updatedAt: timestamp },
				update: { hash, updatedAt: timestamp },
			});
		});
	};
}
