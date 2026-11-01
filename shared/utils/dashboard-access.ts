/**
 * Who may open a server's dashboard, besides its owner and its admins.
 *
 * The rules live in the two columns of the old permission nodes,
 * `permissions.users` and `permissions.roles`. A rule is told from a node by
 * its `dashboard` key, and keeps two empty `allow` and `deny` lists, so code
 * that reads every entry as a node finds no command in it.
 *
 * What is named `Access` here is a port of the bot's
 * `projects/database/src/settings/access.ts`, under its names, like the other
 * ports of `wolfstar-database`: the bot's sources import its build output and
 * cannot be imported from here. `dashboard-access-pin.spec.ts` runs the two
 * against each other, so a bump that changes the bot's fails there.
 */

/** What a rule does: `allow` opens the dashboard, `deny` keeps a member out of it. */
export type Access = "allow" | "deny";

/** An entry of the old shape: commands a role or member is allowed or denied. */
export interface LegacyPermissionNode {
	id: string;
	allow: readonly string[];
	deny: readonly string[];
}

/** A rule that lets a role or member open the dashboard, or keeps them out. */
export interface AccessEntry {
	id: string;
	allow: readonly [];
	deny: readonly [];
	dashboard: Access;
}

export type PermissionEntry = LegacyPermissionNode | AccessEntry;

export function isAccessEntry(entry: PermissionEntry): entry is AccessEntry {
	return "dashboard" in entry && (entry.dashboard === "allow" || entry.dashboard === "deny");
}

export function createAccessEntry(id: string, dashboard: Access): AccessEntry {
	return { id, allow: [], deny: [], dashboard };
}

/**
 * Who the access is resolved for. Everybody holds `@everyone`, whose id is the
 * guild's: a rule can name it, and Discord's `member.roles` never lists it.
 */
export interface AccessSubject {
	userId: string;
	roleIds: readonly string[];
}

/** The two columns the rules are read from. */
export interface AccessEntries {
	users: readonly PermissionEntry[];
	roles: readonly PermissionEntry[];
}

/** A role of the guild and its position, which decides which rule of a member's roles wins. */
export interface AccessRole {
	id: string;
	position: number;
}

/**
 * The rule that decides for a member: their own first, else the one of their
 * highest role that has one, by position, and of two roles at the same position
 * the one with the higher id, as Discord orders them. `null` when no rule names
 * them, and the admin check decides.
 */
export function resolveAccess(
	subject: AccessSubject,
	entries: AccessEntries,
	guildRoles: readonly AccessRole[],
): Access | null {
	const own = entries.users.find(
		(entry): entry is AccessEntry => isAccessEntry(entry) && entry.id === subject.userId,
	);
	if (own) return own.dashboard;

	const ruled = new Map<string, Access>();
	for (const entry of entries.roles) {
		if (isAccessEntry(entry)) ruled.set(entry.id, entry.dashboard);
	}
	if (ruled.size === 0) return null;

	const held = new Set(subject.roleIds);
	let highest: AccessRole | null = null;
	for (const role of guildRoles) {
		if (!held.has(role.id) || !ruled.has(role.id)) continue;
		if (
			highest === null ||
			role.position > highest.position ||
			(role.position === highest.position && BigInt(role.id) > BigInt(highest.id))
		) {
			highest = role;
		}
	}

	return highest === null ? null : (ruled.get(highest.id) ?? null);
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
	| { kind: "importable"; access: Access; dropped: string[] }
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
export function stripLegacyNodes(entries: readonly PermissionEntry[]): AccessEntry[] {
	return entries.filter((entry) => isAccessEntry(entry));
}
