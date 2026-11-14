import type { DashboardAuditChanges } from "#shared/types/audit-log";
import { isDeepEqual } from "#shared/utils/isDeepEqual";
import { auditDiff } from "evlog";

// Ported from the WolfStar bot's auditLogEmbeds.ts — traverses a JSON-patch path.
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
	const parts = path.split("/").filter(Boolean);
	let current: unknown = obj;
	for (const part of parts) {
		if (current === null || current === undefined || typeof current !== "object")
			return undefined;
		current = (current as Record<string, unknown>)[part];
	}
	return current;
}

// evlog compares lists by identity, and the two snapshots are parsed apart, so
// it replaces every list a save carries, changed or not.
function isEquivalentDefault(a: unknown, b: unknown): boolean {
	if ((a === null || a === undefined) && (b === null || b === undefined)) return true;
	return isDeepEqual(a, b);
}

// Remove shallow ancestor keys that are prefixes of deeper keys in the same category.
function dedupeShallowAncestors(map: Record<string, unknown>): Record<string, unknown> {
	const keys = Object.keys(map);
	const result: Record<string, unknown> = {};
	for (const key of keys) {
		const hasDeeper = keys.some((k) => k !== key && k.startsWith(`${key}.`));
		if (!hasDeeper) result[key] = map[key];
	}
	return result;
}

/**
 * One change operation persisted in the compact (v2) audit payload.
 * `value` carries the new value (add/replace); `from` carries the previous
 * value (remove/replace) so the dashboard can render before→after without the
 * full settings snapshots.
 */
interface CompactSettingsChangeOp {
	op: "add" | "remove" | "replace";
	path: string;
	value?: unknown;
	from?: unknown;
}

/**
 * Compact audit `changes` payload written since plan 008. The `v` field
 * disambiguates it from legacy `{ before, after }` full-snapshot rows, which
 * remain readable forever (or until retention guarantees none exist).
 */
export interface CompactSettingsChanges {
	v: 2;
	patch: CompactSettingsChangeOp[];
	/**
	 * Never set — declared so the compact payload overlaps evlog's weak
	 * `AuditFields["changes"]` type (`{ before?; after? }`) without a cast
	 */
	before?: never;
	after?: never;
}

function isCompactChanges(raw: Record<string, unknown>): raw is Record<string, unknown> & {
	v: 2;
	patch: CompactSettingsChangeOp[];
} {
	return raw["v"] === 2 && Array.isArray(raw["patch"]);
}

/**
 * Computes the compact change set persisted with `guild.settings.update`
 * audit events: only the fields that actually changed, with both old and new
 * values. Inputs must already be JSON-safe (the settings snapshots come from
 * `serializeSettings`), so the result satisfies `AuditEnvelope`'s
 * serialization preconditions.
 */
export function compactSettingsChanges(
	before: Record<string, unknown>,
	after: Record<string, unknown>,
): CompactSettingsChanges {
	const diff = auditDiff(before, after);
	const patch: CompactSettingsChangeOp[] = diff.patch.map((op) => {
		const entry: CompactSettingsChangeOp = { op: op.op, path: op.path };
		if (op.op !== "remove") {
			entry.value = op.value;
		}
		if (op.op !== "add") {
			entry.from = getNestedValue(before, op.path);
		}
		return entry;
	});
	return {
		v: 2,
		patch: patch.filter(
			(entry) => entry.op !== "replace" || !isEquivalentDefault(entry.from, entry.value),
		),
	};
}

function groupOps(ops: CompactSettingsChangeOp[]): DashboardAuditChanges {
	const added: Record<string, unknown> = {};
	const removed: Record<string, unknown> = {};
	const changed: Record<string, { from: unknown; to: unknown }> = {};

	// Rows written before the unchanged lists were left out still carry them,
	// so they go before the cap, or they would push the real changes out.
	const real = ops.filter((op) => op.op !== "replace" || !isEquivalentDefault(op.from, op.value));
	for (const op of real.slice(0, 25)) {
		const key = op.path.replace(/^\//, "").replaceAll("/", ".");
		if (op.op === "add") {
			added[key] = op.value;
		} else if (op.op === "remove") {
			removed[key] = op.from;
		} else {
			changed[key] = { from: op.from, to: op.value };
		}
	}

	const deduped = {
		added: dedupeShallowAncestors(added),
		removed: dedupeShallowAncestors(removed),
		changed: dedupeShallowAncestors(changed as Record<string, unknown>) as Record<
			string,
			{ from: unknown; to: unknown }
		>,
	};

	return {
		...(Object.keys(deduped.added).length > 0 && { added: deduped.added }),
		...(Object.keys(deduped.removed).length > 0 && { removed: deduped.removed }),
		...(Object.keys(deduped.changed).length > 0 && { changed: deduped.changed }),
	};
}

/**
 * Converts a persisted audit `changes` payload into dashboard-friendly
 * added/removed/changed groups. Reads both shapes:
 * - compact v2 rows (`{ v: 2, patch }`) written since plan 008
 * - legacy rows carrying full `{ before, after }` snapshots, diffed here
 */
export function patchToChanges(
	raw:
		| {
				before?: Record<string, unknown>;
				after?: Record<string, unknown>;
		  }
		| Record<string, unknown>,
): DashboardAuditChanges {
	if (!raw || typeof raw !== "object") return {};

	const record = raw as Record<string, unknown>;
	if (isCompactChanges(record)) {
		return groupOps(record.patch.filter((op) => op && typeof op === "object"));
	}

	const before = (record["before"] as Record<string, unknown> | undefined) ?? {};
	const after = (record["after"] as Record<string, unknown> | undefined) ?? {};

	const diff = auditDiff(before, after);
	const ops: CompactSettingsChangeOp[] = diff.patch.map((op) => ({
		op: op.op,
		path: op.path,
		value: op.value,
		from: op.op === "add" ? undefined : getNestedValue(before, op.path),
	}));

	return groupOps(ops);
}
