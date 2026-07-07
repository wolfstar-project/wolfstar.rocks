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

import { PrismaClient } from "../server/database/generated/client/index.js";
import { verifyPersistedAuditChain } from "../shared/audit/persisted.js";

const prisma = new PrismaClient();

async function main() {
	const [rows, head] = await Promise.all([
		prisma.auditEvent.findMany(),
		prisma.auditChainHead.findUnique({ where: { id: "default" } }),
	]);

	console.log(`Verifying ${rows.length} audit event(s)...`);

	const result = verifyPersistedAuditChain(rows, head?.hash ?? null);

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
	.finally(() => prisma.$disconnect());
