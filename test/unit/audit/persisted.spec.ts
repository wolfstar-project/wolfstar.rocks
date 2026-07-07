import type { PersistedAuditRow } from "#shared/audit/persisted";
import { hashEnvelope } from "#shared/audit/envelope";
import { envelopeFromPersistedRow, verifyPersistedAuditChain } from "#shared/audit/persisted";
import { describe, expect, it } from "vitest";

/**
 * Offline audit-chain verification (plan 006).
 *
 * Fixtures are built through `envelopeFromPersistedRow` + `hashEnvelope`, the
 * same projection the drain uses, so a drift between writer and verifier
 * breaks these tests.
 */

interface RowFields {
	action?: string;
	actorType?: string;
	actorId?: string;
	actorName?: string | null;
	targetType?: string | null;
	targetId?: string | null;
	outcome?: string;
	tenantId?: string | null;
	reason?: string | null;
	timestamp?: Date;
	changes?: unknown;
	context?: unknown;
}

function makeRow(prevHash: string | null, fields: RowFields = {}): PersistedAuditRow {
	const row: Omit<PersistedAuditRow, "hash"> = {
		action: fields.action ?? "guild.settings.update",
		actorType: fields.actorType ?? "user",
		actorId: fields.actorId ?? "actor-1",
		actorName: fields.actorName ?? null,
		targetType: fields.targetType ?? null,
		targetId: fields.targetId ?? null,
		outcome: fields.outcome ?? "success",
		tenantId: fields.tenantId ?? null,
		reason: fields.reason ?? null,
		timestamp: fields.timestamp ?? new Date("2026-07-04T12:00:00.000Z"),
		changes: fields.changes ?? null,
		context: fields.context ?? null,
		prevHash,
	};
	const hash = hashEnvelope(envelopeFromPersistedRow({ ...row, hash: "" }));
	return { ...row, hash };
}

function makeChain(
	length: number,
	fields: (index: number) => RowFields = () => ({}),
): PersistedAuditRow[] {
	const rows: PersistedAuditRow[] = [];
	let prevHash: string | null = null;
	for (let i = 0; i < length; i++) {
		const row = makeRow(prevHash, {
			timestamp: new Date(Date.UTC(2026, 6, 4, 12, 0, i)),
			...fields(i),
		});
		rows.push(row);
		prevHash = row.hash;
	}
	return rows;
}

describe("envelopeFromPersistedRow", () => {
	it("round-trips optional fields exactly as the drain hashed them", () => {
		const row = makeRow("prev-hash-value", {
			actorName: "Tester",
			targetType: "guild",
			targetId: "guild-1",
			tenantId: "guild-1",
			reason: "because",
			changes: { before: { prefix: "!" }, after: { prefix: "?" } },
			context: { requestId: "req-1", traceId: "trace-1", userAgent: "UA" },
		});

		const envelope = envelopeFromPersistedRow(row);

		expect(envelope).toEqual({
			action: "guild.settings.update",
			outcome: "success",
			actor: { type: "user", id: "actor-1", displayName: "Tester" },
			target: { type: "guild", id: "guild-1" },
			tenantId: "guild-1",
			reason: "because",
			changes: { before: { prefix: "!" }, after: { prefix: "?" } },
			timestamp: "2026-07-04T12:00:00.000Z",
			context: { requestId: "req-1", traceId: "trace-1", userAgent: "UA" },
			prevHash: "prev-hash-value",
		});
	});

	it("maps database nulls to the drain's undefined/null envelope shape", () => {
		const envelope = envelopeFromPersistedRow(makeRow(null));

		expect(envelope.actor.displayName).toBeUndefined();
		expect(envelope.target).toBeUndefined();
		expect(envelope.tenantId).toBeUndefined();
		expect(envelope.reason).toBeUndefined();
		// The drain normalizes missing changes to null before hashing
		expect(envelope.changes).toBeNull();
		expect(envelope.context).toBeUndefined();
		expect(envelope.prevHash).toBeNull();
	});

	it("supports system actors", () => {
		const envelope = envelopeFromPersistedRow(
			makeRow(null, { actorType: "system", actorId: "oauth-flow", outcome: "denied" }),
		);
		expect(envelope.actor).toEqual({
			type: "system",
			id: "oauth-flow",
			displayName: undefined,
		});
		expect(envelope.outcome).toBe("denied");
	});
});

describe("verifyPersistedAuditChain", () => {
	it("accepts an empty chain with a null head", () => {
		const result = verifyPersistedAuditChain([], null);
		expect(result.valid).toBe(true);
		expect(result.orderedHashes).toEqual([]);
	});

	it("rejects an empty chain when a head is still stored", () => {
		const result = verifyPersistedAuditChain([], "stale-head");
		expect(result.valid).toBe(false);
		expect(result.topologyProblems).toEqual([
			{ kind: "head-mismatch", expected: null, stored: "stale-head" },
		]);
	});

	it("accepts a single-row chain", () => {
		const rows = makeChain(1);
		const result = verifyPersistedAuditChain(rows, rows[0]!.hash);
		expect(result.valid).toBe(true);
	});

	it("accepts a multi-row chain even when timestamps collide", () => {
		const sharedTimestamp = new Date("2026-07-04T12:00:00.000Z");
		const rows = makeChain(4, (i) => ({
			timestamp: sharedTimestamp,
			reason: `row-${i}`,
		}));
		const result = verifyPersistedAuditChain(rows, rows.at(-1)!.hash);
		expect(result.valid).toBe(true);
		expect(result.orderedHashes).toEqual(rows.map((r) => r.hash));
	});

	it("orders by prevHash linkage, not input order", () => {
		const rows = makeChain(3);
		const shuffled = [rows[2]!, rows[0]!, rows[1]!];
		const result = verifyPersistedAuditChain(shuffled, rows[2]!.hash);
		expect(result.valid).toBe(true);
		expect(result.orderedHashes).toEqual(rows.map((r) => r.hash));
	});

	it("detects a tampered payload", () => {
		const rows = makeChain(3);
		rows[1] = { ...rows[1]!, reason: "tampered-after-the-fact" };
		const result = verifyPersistedAuditChain(rows, rows.at(-1)!.hash);
		expect(result.valid).toBe(false);
		expect(result.linkProblem).toMatchObject({ index: 1, reason: "hash-mismatch" });
	});

	it("detects a broken link (missing predecessor)", () => {
		const rows = makeChain(3);
		// Remove the middle row: row 2's prevHash now points to a missing row
		const withGap = [rows[0]!, rows[2]!];
		const result = verifyPersistedAuditChain(withGap, rows[2]!.hash);
		expect(result.valid).toBe(false);
		const kinds = result.topologyProblems.map((p) => p.kind);
		expect(kinds).toContain("unreachable-rows");
	});

	it("detects a fork", () => {
		const rows = makeChain(2);
		const forked = makeRow(rows[0]!.hash, { reason: "competing-branch" });
		const result = verifyPersistedAuditChain([...rows, forked], rows[1]!.hash);
		expect(result.valid).toBe(false);
		const fork = result.topologyProblems.find((p) => p.kind === "fork");
		expect(fork).toMatchObject({ atHash: rows[0]!.hash });
	});

	it("detects multiple roots", () => {
		const chainA = makeChain(1, () => ({ reason: "root-a" }));
		const chainB = makeChain(1, () => ({ reason: "root-b" }));
		const result = verifyPersistedAuditChain([...chainA, ...chainB], chainA[0]!.hash);
		expect(result.valid).toBe(false);
		const kinds = result.topologyProblems.map((p) => p.kind);
		expect(kinds).toContain("multiple-roots");
	});

	it("detects a cycle with no root", () => {
		const rows = makeChain(2);
		// Rewrite the root to point at the tail — no row has prevHash null anymore
		const cyclic = [{ ...rows[0]!, prevHash: rows[1]!.hash }, rows[1]!];
		const result = verifyPersistedAuditChain(cyclic, rows[1]!.hash);
		expect(result.valid).toBe(false);
		const kinds = result.topologyProblems.map((p) => p.kind);
		expect(kinds).toContain("no-root");
	});

	it("detects a stored head that is not the final row", () => {
		const rows = makeChain(3);
		const result = verifyPersistedAuditChain(rows, rows[0]!.hash);
		expect(result.valid).toBe(false);
		const head = result.topologyProblems.find((p) => p.kind === "head-mismatch");
		expect(head).toMatchObject({ expected: rows.at(-1)!.hash, stored: rows[0]!.hash });
	});

	it("detects a prev-hash link rewrite that keeps a consistent shape", () => {
		const rows = makeChain(3);
		// Rewrite row 2 to claim row 0 as its predecessor WITH a recomputed hash:
		// the chain then forks at row 0 and row 1's branch terminates the walk
		const rewired = makeRow(rows[0]!.hash, { reason: "rewired" });
		const result = verifyPersistedAuditChain([rows[0]!, rows[1]!, rewired], rewired.hash);
		expect(result.valid).toBe(false);
		const kinds = result.topologyProblems.map((p) => p.kind);
		expect(kinds).toContain("fork");
	});
});
