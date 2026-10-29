/**
 * Who may open a server's dashboard, besides its owner and its admins.
 *
 * The rules live in the two columns of the old permission nodes,
 * `permissions.users` and `permissions.roles`. A rule is told from a node by
 * its `dashboard` key, and keeps two empty `allow` and `deny` lists: the bot,
 * until it reads rules, runs every entry of those columns as a node, and
 * iterates both lists.
 */

export type DashboardAccess = "allow" | "deny";

/** An entry of the old shape: commands a role or member is allowed or denied. */
export interface LegacyPermissionNode {
	id: string;
	allow: readonly string[];
	deny: readonly string[];
}

/** A rule that lets a role or member open the dashboard, or keeps them out. */
export interface DashboardAccessEntry {
	id: string;
	allow: readonly [];
	deny: readonly [];
	dashboard: DashboardAccess;
}

export type PermissionEntry = LegacyPermissionNode | DashboardAccessEntry;

export function isDashboardEntry(entry: PermissionEntry): entry is DashboardAccessEntry {
	return "dashboard" in entry && (entry.dashboard === "allow" || entry.dashboard === "deny");
}

export function createDashboardEntry(id: string, dashboard: DashboardAccess): DashboardAccessEntry {
	return { id, allow: [], deny: [], dashboard };
}

export interface AccessSubject {
	userId: string;
	roleIds: readonly string[];
}

export interface GuildRolePosition {
	id: string;
	position: number;
}

/**
 * The rule that decides whether a member opens the dashboard: their own rule
 * first, then the rule of their highest role that has one. `null` when no rule
 * names them, and the admin check decides.
 */
export function resolveDashboardAccess(
	subject: AccessSubject,
	entries: { users: readonly PermissionEntry[]; roles: readonly PermissionEntry[] },
	guildRoles: readonly GuildRolePosition[],
): DashboardAccess | null {
	const own = entries.users.find(
		(entry): entry is DashboardAccessEntry =>
			isDashboardEntry(entry) && entry.id === subject.userId,
	);
	if (own) return own.dashboard;

	const ruled = new Map<string, DashboardAccess>();
	for (const entry of entries.roles) {
		if (isDashboardEntry(entry)) ruled.set(entry.id, entry.dashboard);
	}
	if (ruled.size === 0) return null;

	const held = new Set(subject.roleIds);
	// The order Discord shows: the highest position first, and of two roles at
	// the same position the newer one, the higher id, first.
	const highestFirst = guildRoles
		.filter((role) => held.has(role.id) && ruled.has(role.id))
		.toSorted((a, b) => b.position - a.position || Number(BigInt(b.id) - BigInt(a.id)));

	const highest = highestFirst[0];
	return highest === undefined ? null : (ruled.get(highest.id) ?? null);
}

/**
 * The names a node may hold that already mean "the dashboard" to both
 * `canManage`s: the `settings` command, its old name, its category and every
 * command.
 */
export const DASHBOARD_COMMAND_NAMES: readonly string[] = [
	"settings",
	"conf",
	"*",
	"Management.*",
	"Management.settings",
];

const DASHBOARD_COMMAND_NAMES_LOWER = new Set(
	DASHBOARD_COMMAND_NAMES.map((name) => name.toLowerCase()),
);

function namesDashboard(name: string): boolean {
	return DASHBOARD_COMMAND_NAMES_LOWER.has(name.toLowerCase());
}

export type LegacyClassification =
	| { kind: "importable"; access: DashboardAccess; dropped: string[] }
	| { kind: "not-convertible" };

/**
 * Whether a legacy node can become a dashboard rule without changing what it
 * did. Only a node naming the dashboard can: the node did nothing else in V7,
 * so the other names it holds are dropped. `allow` wins over `deny`, as it does
 * when a node runs.
 */
export function classifyLegacyNode(node: LegacyPermissionNode): LegacyClassification {
	const allowed = node.allow.some(namesDashboard);
	const denied = node.deny.some(namesDashboard);
	if (!allowed && !denied) return { kind: "not-convertible" };

	const dropped = [...node.allow, ...node.deny].filter((name) => !namesDashboard(name));
	return { kind: "importable", access: allowed ? "allow" : "deny", dropped };
}

/** The entries of a column without its legacy nodes. */
export function stripLegacyNodes(entries: readonly PermissionEntry[]): DashboardAccessEntry[] {
	return entries.filter((entry) => isDashboardEntry(entry));
}
