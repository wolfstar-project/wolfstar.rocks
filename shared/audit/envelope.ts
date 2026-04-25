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

export function canonicalize(env: AuditEnvelope): string {
	return JSON.stringify(sortKeysDeep(env));
}

function sortKeysDeep(obj: unknown): unknown {
	if (Array.isArray(obj)) return obj.map(sortKeysDeep);
	if (obj !== null && typeof obj === "object") {
		return Object.fromEntries(
			Object.entries(obj as Record<string, unknown>)
				.toSorted(([a], [b]) => a.localeCompare(b))
				.map(([k, v]) => [k, sortKeysDeep(v)]),
		);
	}
	return obj;
}

export function hashEnvelope(env: AuditEnvelope): string {
	return createHash("sha256").update(canonicalize(env)).digest("hex");
}
