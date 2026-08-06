import type { AuditChainEntry, AuditEnvelope } from "./envelope";
import { verifyChain } from "./envelope";

/**
 * Structural shape of a persisted audit event row for chain verification.
 * Kept structural so tests can construct rows without a database.
 */
export interface PersistedAuditRow {
	action: string;
	actorType: string;
	actorId: string;
	actorName: string | null;
	targetType: string | null;
	targetId: string | null;
	outcome: string;
	tenantId: string | null;
	reason: string | null;
	timestamp: Date;
	changes: unknown;
	context: unknown;
	prevHash: string | null;
	hash: string;
}

/**
 * Reconstructs exactly the envelope the drain hashed when it persisted the
 * row. Every field the production hash covers must round-trip here; any
 * change to the drain's projection must be mirrored in this mapper (and in
 * the fixtures that pin both).
 */
export function envelopeFromPersistedRow(row: PersistedAuditRow): AuditEnvelope {
	return {
		action: row.action,
		outcome: row.outcome as AuditEnvelope["outcome"],
		actor: {
			type: row.actorType,
			id: row.actorId,
			displayName: row.actorName ?? undefined,
		},
		target:
			row.targetType && row.targetId ? { type: row.targetType, id: row.targetId } : undefined,
		tenantId: row.tenantId ?? undefined,
		reason: row.reason ?? undefined,
		// The drain normalizes undefined to null before hashing, so the key is
		// always present in the canonical form
		changes: row.changes ?? null,
		timestamp: row.timestamp.toISOString(),
		context: row.context === null ? undefined : (row.context as AuditEnvelope["context"]),
		prevHash: row.prevHash,
	};
}

// Not exported by name: it is only ever accessed through
// `ChainVerificationResult["topologyProblems"]`, which already carries the
// full union to consumers.
type ChainTopologyProblem =
	| { kind: "no-root"; detail: string }
	| { kind: "multiple-roots"; hashes: string[] }
	| { kind: "fork"; atHash: string; childHashes: string[] }
	| { kind: "cycle"; atHash: string }
	| { kind: "unreachable-rows"; hashes: string[] }
	| { kind: "head-mismatch"; expected: string | null; stored: string | null };

export interface ChainVerificationResult {
	valid: boolean;
	/** Rows in reconstructed chain order (may be partial when topology is broken) */
	orderedHashes: string[];
	topologyProblems: ChainTopologyProblem[];
	linkProblem: { index: number; hash: string; reason: string } | null;
}

/**
 * Reconstructs the chain order from `prevHash` linkage — timestamps are NOT
 * assumed unique — then verifies every hash and link with `verifyChain` and
 * checks the persisted head.
 *
 * Detected topology problems: multiple roots, forks (two rows claiming the
 * same predecessor), cycles / missing predecessors (no root), rows unreachable
 * from the root, and a stored head that is not the chain's final hash.
 */
export function verifyPersistedAuditChain(
	rows: PersistedAuditRow[],
	storedHeadHash: string | null,
): ChainVerificationResult {
	const topologyProblems: ChainTopologyProblem[] = [];
	const ordered: PersistedAuditRow[] = [];

	if (rows.length > 0) {
		const roots = rows.filter((row) => row.prevHash === null);
		if (roots.length === 0) {
			topologyProblems.push({
				kind: "no-root",
				detail: "no row has prevHash=null — missing predecessor or full-chain cycle",
			});
		} else if (roots.length > 1) {
			topologyProblems.push({ kind: "multiple-roots", hashes: roots.map((r) => r.hash) });
		}

		const byPrevHash = new Map<string, PersistedAuditRow[]>();
		for (const row of rows) {
			if (row.prevHash !== null) {
				const siblings = byPrevHash.get(row.prevHash) ?? [];
				siblings.push(row);
				byPrevHash.set(row.prevHash, siblings);
			}
		}

		const visited = new Set<string>();
		let current = roots[0];
		while (current) {
			if (visited.has(current.hash)) {
				topologyProblems.push({ kind: "cycle", atHash: current.hash });
				break;
			}
			visited.add(current.hash);
			ordered.push(current);

			const children = byPrevHash.get(current.hash) ?? [];
			if (children.length > 1) {
				topologyProblems.push({
					kind: "fork",
					atHash: current.hash,
					childHashes: children.map((c) => c.hash),
				});
			}
			current = children[0];
		}

		if (ordered.length < rows.length) {
			const reachable = new Set(ordered.map((row) => row.hash));
			topologyProblems.push({
				kind: "unreachable-rows",
				hashes: rows.filter((row) => !reachable.has(row.hash)).map((row) => row.hash),
			});
		}
	}

	const finalHash = ordered.at(-1)?.hash ?? null;
	if (storedHeadHash !== finalHash) {
		topologyProblems.push({
			kind: "head-mismatch",
			expected: finalHash,
			stored: storedHeadHash,
		});
	}

	const entries: AuditChainEntry[] = ordered.map((row) => ({
		envelope: envelopeFromPersistedRow(row),
		storedHash: row.hash,
	}));
	const chainResult = verifyChain(entries);
	const linkProblem = chainResult.valid
		? null
		: {
				index: chainResult.index,
				hash: ordered[chainResult.index]?.hash ?? "unknown",
				reason: chainResult.reason,
			};

	return {
		valid: topologyProblems.length === 0 && linkProblem === null,
		orderedHashes: ordered.map((row) => row.hash),
		topologyProblems,
		linkProblem,
	};
}
