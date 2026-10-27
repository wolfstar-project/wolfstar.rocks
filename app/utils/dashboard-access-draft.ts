import {
	classifyLegacyNode,
	createDashboardEntry,
	isDashboardEntry,
	type PermissionEntry,
} from "#shared/utils/dashboard-access";

/** The ids a column of dashboard access rules allows and denies; legacy nodes are left out. */
export function splitAccess(entries: readonly PermissionEntry[]): {
	allow: string[];
	deny: string[];
} {
	const allow: string[] = [];
	const deny: string[] = [];
	for (const entry of entries) {
		if (isDashboardEntry(entry)) (entry.dashboard === "allow" ? allow : deny).push(entry.id);
	}
	return { allow, deny };
}

/**
 * The column again from the edited lists: the allows, the denies, then the
 * legacy nodes of `entries` whose id has no rule now. An id in both lists is a
 * deny, the choice that opens nothing by mistake.
 */
export function joinAccess(
	allow: readonly string[],
	deny: readonly string[],
	entries: readonly PermissionEntry[],
): PermissionEntry[] {
	const denied = new Set(deny);
	const allowed = [...new Set(allow)].filter((id) => !denied.has(id));
	const ruled = new Set([...allowed, ...denied]);
	return [
		...allowed.map((id) => createDashboardEntry(id, "allow")),
		...Array.from(denied, (id) => createDashboardEntry(id, "deny")),
		...entries.filter((entry) => !isDashboardEntry(entry) && !ruled.has(entry.id)),
	];
}

/** The column with the legacy node of `id` turned into its dashboard rule, when it can be. */
export function importLegacy(entries: readonly PermissionEntry[], id: string): PermissionEntry[] {
	return entries.map((entry) => {
		if (entry.id !== id || isDashboardEntry(entry)) return entry;
		const classification = classifyLegacyNode(entry);
		return classification.kind === "importable"
			? createDashboardEntry(entry.id, classification.access)
			: entry;
	});
}
