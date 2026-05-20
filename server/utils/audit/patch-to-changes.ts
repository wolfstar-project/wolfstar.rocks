import type { DashboardAuditChanges } from "#shared/types/audit-log";
import { auditDiff } from "evlog";

// Ported from the WolfStar bot's auditLogEmbeds.ts — traverses a JSON-patch path.
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
	const parts = path.split("/").filter(Boolean);
	let current: unknown = obj;
	for (const part of parts) {
		if (current === null || current === undefined || typeof current !== "object")
			return undefined;
		current = (current as Record<string, unknown>)[part];
	}
	return current;
}

function isEquivalentDefault(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if ((a === null || a === undefined) && (b === null || b === undefined)) return true;
	if (Array.isArray(a) && Array.isArray(b) && a.length === 0 && b.length === 0) return true;
	if (a === "" && b === "") return true;
	return false;
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

export function patchToChanges(raw: {
	before?: Record<string, unknown>;
	after?: Record<string, unknown>;
}): DashboardAuditChanges {
	if (!raw || typeof raw !== "object") return {};

	const before = raw.before ?? {};
	const after = raw.after ?? {};
	const added: Record<string, unknown> = {};
	const removed: Record<string, unknown> = {};
	const changed: Record<string, { from: unknown; to: unknown }> = {};

	const diff = auditDiff(before, after);

	for (const op of diff.patch.slice(0, 25)) {
		const key = op.path.replace(/^\//, "").replaceAll("/", ".");
		if (op.op === "add") {
			added[key] = op.value;
		} else if (op.op === "remove") {
			removed[key] = getNestedValue(before, op.path);
		} else if (op.op === "replace") {
			const from = getNestedValue(before, op.path);
			const to = op.value;
			if (!isEquivalentDefault(from, to)) {
				changed[key] = { from, to };
			}
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
