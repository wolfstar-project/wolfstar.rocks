import type { APIGuildMember } from "discord-api-types/v10";

export type DashboardAuditAction =
	| "guild.settings.update"
	| "guild.settings.add"
	| "guild.settings.remove"
	| "guild.settings.access-denied";

export interface DashboardAuditChanges {
	added?: Record<string, unknown>;
	removed?: Record<string, unknown>;
	changed?: Record<string, { from: unknown; to: unknown }>;
}

export interface DashboardAuditEntry {
	/** SHA-256 hash — primary key in AuditEvent table. */
	id: string;
	guildId: string;
	action: DashboardAuditAction;
	outcome: "success" | "failure" | "denied";
	/** Resolved at read-time; falls back to stub when member left the guild. */
	member: APIGuildMember;
	changes: DashboardAuditChanges;
	reason: string | null;
	/** ISO 8601 — use `new Date(entry.timestamp)` in UI. */
	timestamp: string;
}
