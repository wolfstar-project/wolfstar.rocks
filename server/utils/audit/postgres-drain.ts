import type { DrainContext, DrainFn } from "evlog";
import { Prisma } from "#server/database/generated/client";
import prisma from "#server/database/prisma";
import { type AuditEnvelope, hashEnvelope } from "#shared/audit/envelope";
import { consola } from "consola";

const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 10;

export function createPostgresAuditDrain(): DrainFn {
	return async (ctx: DrainContext): Promise<void> => {
		const audit = ctx.event.audit;
		if (!audit) return;

		// Allow-listed projection — never read email, ip, cookie, raw headers
		const action = audit.action;
		const actorType = audit.actor.type;
		const actorId = audit.actor.id;
		const actorName = audit.actor.displayName ?? null;
		const targetType = audit.target?.type ?? null;
		const targetId = audit.target?.id ?? null;
		const outcome = audit.outcome;
		const tenantId = audit.context?.tenantId ?? null;
		const reason = audit.reason ?? null;
		const timestamp = new Date(ctx.event.timestamp);
		const changes = audit.changes ?? null;

		// Only safe context fields — explicitly exclude ip, full headers
		const context: AuditEnvelope["context"] = audit.context
			? {
					requestId: audit.context.requestId,
					traceId: audit.context.traceId,
					userAgent: audit.context.userAgent,
				}
			: undefined;

		for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
			try {
				await prisma.$transaction(
					async (tx) => {
						const head = await tx.auditChainHead.upsert({
							where: { id: "default" },
							create: { id: "default", hash: null },
							update: {},
						});

						const envelope: AuditEnvelope = {
							action,
							outcome,
							actor: {
								type: actorType,
								id: actorId,
								displayName: audit.actor.displayName,
							},
							target:
								targetType && targetId
									? { type: targetType, id: targetId }
									: undefined,
							tenantId: tenantId ?? undefined,
							reason: reason ?? undefined,
							changes,
							timestamp: ctx.event.timestamp,
							context,
							prevHash: head.hash,
						};

						const hash = hashEnvelope(envelope);

						try {
							await tx.auditEvent.create({
								data: {
									hash,
									prevHash: head.hash,
									action,
									actorType,
									actorId,
									actorName,
									targetType,
									targetId,
									outcome,
									tenantId,
									reason,
									timestamp,
									changes,
									context,
								},
							});
						} catch (err) {
							// P2002 = unique constraint — idempotent retry, safe to swallow
							if (
								err instanceof Prisma.PrismaClientKnownRequestError &&
								err.code === "P2002"
							) {
								return;
							}
							throw err;
						}

						await tx.auditChainHead.update({
							where: { id: "default" },
							data: { hash },
						});
					},
					{
						isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
						timeout: 3000,
						maxWait: 1500,
					},
				);
				return;
			} catch (err) {
				// P2034 = serialization failure — retry with exponential backoff + jitter
				if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2034") {
					if (attempt < MAX_RETRIES - 1) {
						const jitter = Math.random() * BASE_RETRY_DELAY_MS;
						await new Promise((r) => setTimeout(r, BASE_RETRY_DELAY_MS * 2 ** attempt + jitter));
						continue;
					}
					consola.error("[audit] Exhausted retries on P2034 serialization failure", err);
				}
				throw err;
			}
		}
	};
}
