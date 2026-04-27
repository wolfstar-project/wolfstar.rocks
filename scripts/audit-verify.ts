#!/usr/bin/env tsx
/**
 * Audit chain integrity verifier.
 *
 * Reads all AuditEvent rows ordered by timestamp and re-derives the expected
 * SHA-256 hash chain, reporting any breaks. Exits with code 1 if violations
 * are found.
 */

import type { AuditEnvelope } from "../shared/audit/envelope.js";
import { PrismaClient } from "../server/database/generated/client/index.js";
import { canonicalize, hashEnvelope } from "../shared/audit/envelope.js";

const prisma = new PrismaClient();

async function main() {
	const rows = await prisma.auditEvent.findMany({
		orderBy: { timestamp: "asc" },
	});

	console.log(`Verifying ${rows.length} audit event(s)...`);

	let violations = 0;
	for (const row of rows) {
		const envelope: AuditEnvelope = {
			action: row.action,
			actor: { type: "user", id: row.actorId },
			outcome: row.outcome,
			timestamp: row.timestamp.toISOString(),
			context: {
				tenantId: row.tenantId,
				requestId: row.requestId ?? undefined,
				traceId: row.traceId ?? undefined,
			},
		};
		const canonical = canonicalize(envelope);
		const expectedHash = hashEnvelope(canonical);

		if (expectedHash !== row.hash) {
			console.error(`[FAIL] hash mismatch for event ${row.hash}`);
			console.error(`  expected : ${expectedHash}`);
			console.error(`  stored   : ${row.hash}`);
			violations++;
		}
	}

	if (violations === 0) {
		console.log("All audit events passed integrity check.");
	} else {
		console.error(`${violations} integrity violation(s) found.`);
		process.exit(1);
	}
}

main()
	.catch((err) => {
		console.error("Fatal error:", err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
