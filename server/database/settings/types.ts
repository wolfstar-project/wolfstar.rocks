import type { Models } from "#server/database/generated/prisma/contract";
import type { StoredGuildData } from "#server/database/settings/columns";
import type { DeepReadonly } from "@sapphire/utilities";
import type { Snowflake } from "discord-api-types/v10";
import { SETTING_CHOICES } from "#shared/utils/settings-choices";

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
export interface GuildData extends Omit<StoredGuildData, "commandsRestrictions"> {
	id: Snowflake;

	/**
	 * The channels and roles each command is allowed in or ignores, which the
	 * bot's `/commands` modal edits and this dashboard does not. Kept opaque:
	 * the contract types the column as recursive JSON, which Vue's `Ref` types
	 * cannot unwrap.
	 */
	commandsRestrictions: unknown[];

	// StickyRole
	stickyRoles: StickyRole[];
}

export type GuildDataKey = keyof GuildData;

export type ReadonlyGuildData = DeepReadonly<GuildData>;

export type CommandLogData = Models.public_CommandLog;

/**
 * What is done to who writes in the honeypot channel of a guild, as the
 * `HoneypotAction` enum stores it. A `Softban` bans and unbans, which removes
 * the member and deletes what they sent in every channel.
 */
export type HoneypotAction = Models.public_GuildHoneypot["action"];

/** The values of {@link HoneypotAction}, the mildest first, in the order the settings offer them. */
export const HoneypotActions = SETTING_CHOICES.honeypotAction satisfies readonly HoneypotAction[];

/**
 * How the log of an edited message shows the change, as the
 * `MessageUpdateStyle` enum stores it: `Difference` is one text with the
 * removed and the added parts marked, `Separate` the content before and after,
 * each in a block of its own.
 */
export type MessageUpdateStyle = Models.public_GuildLogsOptions["messageUpdateStyle"];

/** The values of {@link MessageUpdateStyle}, in the order the settings offer them. */
export const MessageUpdateStyles =
	SETTING_CHOICES.logsMessageUpdateStyle satisfies readonly MessageUpdateStyle[];

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
