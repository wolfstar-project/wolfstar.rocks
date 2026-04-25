import { createHash } from "node:crypto";

export interface AuditEnvelope {
	action: string;
	outcome: "success" | "failure" | "denied";
	actor: { type: string; id: string; displayName?: string };
	target?: { type: string; id: string };
	tenantId?: string;
	reason?: string;
	changes?: unknown;
	timestamp: string;
	context?: { requestId?: string; traceId?: string; userAgent?: string };
	prevHash: string | null;
}

/**
 * Returns a deterministic, stable JSON string for the given audit envelope.
 *
 * Object keys are sorted by Unicode code point at every nesting level.
 * Arrays are preserved as-is (order is not changed) so array-valued fields
 * (e.g., `changes.roles`) remain stable across calls.
 *
 * **Preconditions** — the envelope and everything reachable from it must be
 * JSON-serializable without loss:
 * - No `BigInt` values (throws at `JSON.stringify` time)
 * - No circular references (throws at `JSON.stringify` time)
 * - No `undefined` values inside objects or arrays (they are silently dropped
 *   by `JSON.stringify`, which would corrupt the hash)
 * - No `Date`, `Map`, or `Set` values (they serialize to `{}` or ISO strings,
 *   not their enumerable properties — use plain objects/strings instead)
 *
 * The drain already ensures these preconditions by extracting only known
 * primitive fields from the audit event before building the envelope.
 */
export function canonicalize(env: AuditEnvelope): string {
	return JSON.stringify(sortKeysDeep(env));
}

function sortKeysDeep(obj: unknown): unknown {
	if (Array.isArray(obj)) return obj.map(sortKeysDeep);
	if (obj !== null && typeof obj === "object") {
		return Object.fromEntries(
			Object.entries(obj as Record<string, unknown>)
				.toSorted(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
				.map(([k, v]) => [k, sortKeysDeep(v)]),
		);
	}
	return obj;
}

export function hashEnvelope(env: AuditEnvelope): string {
	return createHash("sha256").update(canonicalize(env)).digest("hex");
}
