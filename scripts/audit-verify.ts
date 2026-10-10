#!/usr/bin/env tsx
/**
 * Audit chain integrity verifier.
 *
 * Loads all AuditEvent rows plus the persisted chain head, reconstructs the
 * chain from `prevHash` linkage (timestamps are not assumed unique), rebuilds
 * the exact envelope the drain hashed for every row, and verifies hashes,
 * links, topology, and the stored head.
 *
 * Output reports row hashes and problem categories only — never `changes`,
 * `context`, or other payload data.
 *
 * Exit codes: 0 = chain valid, 1 = invalid or fatal error.
 */

import type { Contract } from "../server/database/prisma8/contract.js";
import type { PersistedAuditRow } from "../shared/audit/persisted.js";
import postgres from "@prisma/orm-postgres/runtime";
import contractJson from "../server/database/prisma8/contract.json" with { type: "json" };
import { timestampStringToDate } from "../server/utils/timestamp-string.js";
import { verifyPersistedAuditChain } from "../shared/audit/persisted.js";

const db = postgres<Contract>({
	url: process.env.DATABASE_URL ?? "",
	contractJson,
});

type AuditEventRow = Awaited<ReturnType<typeof db.orm.public.AuditEvent.all>>[number];

/**
 * Reshapes an ORM 8 row into the structural row the verifier hashes.
 *
 * The contract types the snowflake columns as `BigInt` and `timestamp(3)` as
 * `TimestampString`, neither of which the envelope accepts: it rejects `BigInt`
 * outright, and `envelopeFromPersistedRow()` calls `.toISOString()` on the
 * timestamp. The drain hashed these values as decimal strings and a UTC ISO
 * timestamp, so that is what has to be rebuilt here for the hashes to match.
 */
function toPersistedRow(row: AuditEventRow): PersistedAuditRow {
	return {
		action: row.action,
		actorType: row.actorType,
		actorId: String(row.actorId),
		actorName: row.actorName ?? null,
		targetType: row.targetType ?? null,
		targetId: row.targetId === null || row.targetId === undefined ? null : String(row.targetId),
		outcome: row.outcome,
		tenantId: row.tenantId === null || row.tenantId === undefined ? null : String(row.tenantId),
		reason: row.reason ?? null,
		timestamp: timestampStringToDate(row.timestamp),
		changes: row.changes,
		context: row.context,
		prevHash: row.prevHash ?? null,
		hash: row.hash,
	};
}

async function main() {
	const [rows, head] = await Promise.all([
		db.orm.public.AuditEvent.all(),
		db.orm.public.AuditChainHead.first({ id: "default" }),
	]);

	console.log(`Verifying ${rows.length} audit event(s)...`);

	const result = verifyPersistedAuditChain(rows.map(toPersistedRow), head?.hash ?? null);

	for (const problem of result.topologyProblems) {
		switch (problem.kind) {
			case "no-root":
				console.error(`[FAIL] topology: ${problem.detail}`);
				break;
			case "multiple-roots":
				console.error(`[FAIL] topology: multiple roots: ${problem.hashes.join(", ")}`);
				break;
			case "fork":
				console.error(
					`[FAIL] topology: fork after ${problem.atHash} → ${problem.childHashes.join(", ")}`,
				);
				break;
			case "cycle":
				console.error(`[FAIL] topology: cycle detected at ${problem.atHash}`);
				break;
			case "unreachable-rows":
				console.error(
					`[FAIL] topology: ${problem.hashes.length} row(s) unreachable from the root: ${problem.hashes.join(", ")}`,
				);
				break;
			case "head-mismatch":
				console.error(
					`[FAIL] head: stored chain head ${problem.stored ?? "<null>"} does not match final row ${problem.expected ?? "<null>"}`,
				);
				break;
		}
	}

	if (result.linkProblem) {
		console.error(
			`[FAIL] chain: ${result.linkProblem.reason} at position ${result.linkProblem.index} (row ${result.linkProblem.hash})`,
		);
	}

	if (result.valid) {
		console.log("All audit events passed integrity check.");
	} else {
		console.error("Audit chain verification FAILED.");
		process.exitCode = 1;
	}
}

main()
	.catch((err) => {
		console.error("Fatal error:", err);
		process.exitCode = 1;
	})
	// The façade-owned pool keeps the event loop alive until it is closed.
	.finally(() => db.close());
