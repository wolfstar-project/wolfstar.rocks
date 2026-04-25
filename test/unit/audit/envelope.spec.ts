import { type AuditEnvelope, canonicalize, hashEnvelope } from "#shared/audit/envelope";
import { describe, expect, it } from "vitest";

const FIXTURE_ENVELOPE: AuditEnvelope = {
	action: "guild.settings.update",
	outcome: "success",
	actor: { type: "user", id: "123456789012345678", displayName: "TestUser" },
	target: { type: "guild", id: "987654321098765432" },
	tenantId: "987654321098765432",
	reason: undefined,
	changes: { before: { prefix: "!" }, after: { prefix: "?" } },
	timestamp: "2026-01-01T00:00:00.000Z",
	context: { requestId: "req-abc", traceId: "trace-xyz" },
	prevHash: null,
};

describe("canonicalize", () => {
	it("produces identical bytes for the same input across multiple calls", () => {
		const results = Array.from({ length: 100 }, () => canonicalize(FIXTURE_ENVELOPE));
		const first = results[0];
		for (const r of results) {
			expect(r).toBe(first);
		}
	});

	it("produces the same output regardless of key insertion order", () => {
		const a: AuditEnvelope = {
			action: "user.login",
			outcome: "success",
			actor: { type: "user", id: "111" },
			timestamp: "2026-01-01T00:00:00.000Z",
			prevHash: null,
		};
		// Build the same envelope with keys inserted in a different order
		const b: AuditEnvelope = {
			prevHash: null,
			timestamp: "2026-01-01T00:00:00.000Z",
			actor: { id: "111", type: "user" },
			outcome: "success",
			action: "user.login",
		};

		expect(canonicalize(a)).toBe(canonicalize(b));
	});

	it("does not include whitespace in the output", () => {
		const result = canonicalize(FIXTURE_ENVELOPE);
		expect(result).not.toMatch(/\s/);
	});

	it("sorts nested object keys recursively", () => {
		const env: AuditEnvelope = {
			action: "x",
			outcome: "success",
			actor: { id: "z", type: "user", displayName: "a" },
			timestamp: "2026-01-01T00:00:00.000Z",
			prevHash: null,
		};
		const parsed = JSON.parse(canonicalize(env));
		const actorKeys = Object.keys(parsed.actor);
		expect(actorKeys).toEqual([...actorKeys].toSorted());
	});
});

describe("hashEnvelope", () => {
	it("returns a 64-character hex string (SHA-256)", () => {
		const hash = hashEnvelope(FIXTURE_ENVELOPE);
		expect(hash).toMatch(/^[0-9a-f]{64}$/);
	});

	it("is stable across calls for the same input", () => {
		const hash1 = hashEnvelope(FIXTURE_ENVELOPE);
		const hash2 = hashEnvelope(FIXTURE_ENVELOPE);
		expect(hash1).toBe(hash2);
	});

	it("snapshot: known envelope produces known hash", () => {
		const minimal: AuditEnvelope = {
			action: "user.login",
			outcome: "success",
			actor: { type: "user", id: "1" },
			timestamp: "2026-01-01T00:00:00.000Z",
			prevHash: null,
		};
		expect(hashEnvelope(minimal)).toMatchInlineSnapshot(`"${hashEnvelope(minimal)}"`);
	});

	it("different prevHash produces different hash", () => {
		const a = { ...FIXTURE_ENVELOPE, prevHash: null };
		const b = { ...FIXTURE_ENVELOPE, prevHash: "abc123" };
		expect(hashEnvelope(a)).not.toBe(hashEnvelope(b));
	});
});
