import type { Models } from "#server/database/generated/prisma/contract";
import type { StoredGuildData } from "#server/database/settings/columns";
import type { DeepReadonly } from "@sapphire/utilities";
import type { Snowflake } from "discord-api-types/v10";

/**
 * The settings of a guild, flattened from the normalized Prisma 8 tables
 * (`Guild`, `Modules`, `GuildRoles`, …), exactly as the bot flattens them.
 *
 * Every key is prefixed by the table it is stored in. The keys stored in a
 * column, and their types, are derived from the `Columns` map of
 * `./columns.ts` and from the models of the contract; the one declared here is
 * stored in a table of its own. Snowflakes are kept as strings; they are
 * converted from and to `bigint` at the storage boundary.
 */
export interface GuildData extends StoredGuildData {
	id: Snowflake;

	// StickyRole
	stickyRoles: StickyRole[];
}

export type GuildDataKey = keyof GuildData;

export type ReadonlyGuildData = DeepReadonly<GuildData>;

export type CommandLogData = Models.public_CommandLog;

export interface PermissionsNode {
	allow: readonly Snowflake[];
	deny: readonly Snowflake[];
	id: Snowflake;
}

export interface UniqueRoleSet {
	name: string;
	roles: readonly Snowflake[];
}

export interface StickyRole {
	roles: readonly Snowflake[];
	user: Snowflake;
}

/** The `before`/`after` snapshot the bot stores in `AuditEvent.changes`. */
export interface AuditEventChanges {
	before?: Record<string, unknown>;
	after?: Record<string, unknown>;
}
