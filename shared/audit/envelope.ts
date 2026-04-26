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
 * JSON-serializable without loss. These are enforced at runtime; a `TypeError`
 * with a descriptive path is thrown when any of the following are detected:
 * - `BigInt` values — not JSON-serializable
 * - `Date` instances — serialize to an ISO string, not the plain-object form
 * - `Map` or `Set` instances — serialize to `{}`, silently losing all data
 * - Circular references — `JSON.stringify` would throw a non-descriptive error
 * - `undefined` inside an array — silently becomes `null`, corrupting the hash
 *
 * `undefined` as an object-property value is allowed: `JSON.stringify`
 * deterministically omits those keys, so the hash remains stable and correct.
 * Optional fields on `AuditEnvelope` (e.g. `reason`, `target`) may be absent.
 *
 * The most common source of unsupported values is {@link AuditEnvelope.changes};
 * ensure that field contains only plain JSON-compatible values before calling
 * this function.
 *
 * The drain already ensures these preconditions by extracting only known
 * primitive fields from the audit event before building the envelope.
 */
export function canonicalize(env: AuditEnvelope): string {
	assertSerializable(env, "AuditEnvelope", new Set());
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

/**
 * Depth-first guard that throws a descriptive `TypeError` for any value that
 * `JSON.stringify` would either reject, silently corrupt, or serialize
 * incorrectly.
 *
 * `ancestors` tracks the active DFS path so that cycles are detected without
 * rejecting legitimate DAG shapes (the same leaf object referenced from two
 * separate branches of the envelope is fine).
 */
function assertSerializable(value: unknown, path: string, ancestors: Set<object>): void {
	if (typeof value === "bigint") {
		throw new TypeError(
			`canonicalize(AuditEnvelope): BigInt at "${path}" is not JSON-serializable`,
		);
	}
	if (value instanceof Date) {
		throw new TypeError(
			`canonicalize(AuditEnvelope): Date instance at "${path}" serializes to an ISO string, not a plain value — store as a string literal instead`,
		);
	}
	if (value instanceof Map) {
		throw new TypeError(
			`canonicalize(AuditEnvelope): Map at "${path}" serializes to {} in JSON, silently losing all entries — convert to a plain object`,
		);
	}
	if (value instanceof Set) {
		throw new TypeError(
			`canonicalize(AuditEnvelope): Set at "${path}" serializes to {} in JSON, silently losing all elements — convert to an array`,
		);
	}
	if (value !== null && typeof value === "object") {
		if (ancestors.has(value)) {
			throw new TypeError(
				`canonicalize(AuditEnvelope): circular reference detected at "${path}"`,
			);
		}
		ancestors.add(value);
		if (Array.isArray(value)) {
			for (let i = 0; i < value.length; i++) {
				if (value[i] === undefined) {
					throw new TypeError(
						`canonicalize(AuditEnvelope): undefined at "${path}[${i}]" — undefined in array positions becomes null in JSON, silently corrupting the hash`,
					);
				}
				assertSerializable(value[i], `${path}[${i}]`, ancestors);
			}
		} else {
			for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
				assertSerializable(v, `${path}.${k}`, ancestors);
			}
		}
		ancestors.delete(value);
	}
}

/**
 * Returns the SHA-256 digest of the canonical JSON form of an
 * {@link AuditEnvelope}.
 *
 * Delegates to {@link canonicalize}, so the same runtime preconditions apply:
 * `BigInt`, `Date`, `Map`, `Set`, circular references, and `undefined` inside
 * array positions within `AuditEnvelope.changes` (or anywhere else in the
 * envelope) all cause a `TypeError` before any hashing takes place.
 */
export function hashEnvelope(env: AuditEnvelope): string {
	return createHash("sha256").update(canonicalize(env)).digest("hex");
}

/**
 * An `AuditEnvelope` paired with its stored SHA-256 hash from the database.
 * Used by `verifyChain` to validate chain integrity without a DB dependency.
 */
export interface AuditChainEntry {
	envelope: AuditEnvelope;
	storedHash: string;
}

/**
 * Verifies the integrity of an ordered slice of audit events.
 *
 * For every entry the function:
 * 1. Re-hashes the envelope with `hashEnvelope` and compares it to `storedHash`.
 * 2. Checks that `envelope.prevHash` equals the preceding entry's `storedHash`
 *    (skipped for the first entry, which may reference an earlier slice).
 *
 * @returns `{ valid: true }` when the entire slice is intact, or
 *          `{ valid: false; index; reason }` identifying the first broken link.
 */
export function verifyChain(
	events: AuditChainEntry[],
):
	| { valid: true }
	| { valid: false; index: number; reason: "hash-mismatch" | "prev-hash-mismatch" } {
	for (let i = 0; i < events.length; i++) {
		const entry = events[i];
		if (!entry) continue;
		const computed = hashEnvelope(entry.envelope);
		if (computed !== entry.storedHash) {
			return { valid: false, index: i, reason: "hash-mismatch" };
		}
		const prev = i > 0 ? events[i - 1] : undefined;
		if (prev && entry.envelope.prevHash !== prev.storedHash) {
			return { valid: false, index: i, reason: "prev-hash-mismatch" };
		}
	}
	return { valid: true };
}
