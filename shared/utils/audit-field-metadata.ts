/**
 * Single source of truth for label + value type for every dashboard-managed GuildData key.
 * Mirrors the WolfStar bot's configuration.ts key registry for use in audit log rendering.
 *
 * CONTRACT:
 * - label: verbatim `name` from shared/utils/settingsDataEntries.ts.
 *   Do NOT rename, abbreviate, or transform these strings.
 * - type: AuditFieldType — controls which renderer formatTypedValue uses.
 * - array: true when the GuildData field stores an array of IDs (e.g. rolesAdmin = string[]).
 */

import { GUILD_MODULES } from "./guild-modules";
import {
	ConfigurableAutomodChannels,
	ConfigurableAutomodToggles,
	ConfigurableCommandChannels,
	ConfigurableIgnoreChannels,
	ConfigurableLoggingChannels,
	ConfigurableLogToggles,
	ConfigurableModerationChannels,
	ConfigurableModerationToggles,
	ConfigurableReportChannels,
	ConfigurableReportRoles,
	ConfigurableReportToggles,
	ConfigurableRoles,
	ConfigurableRoleToggles,
} from "./settingsDataEntries";

export type AuditFieldType =
	| "boolean"
	| "string"
	| "integer"
	| "timespan-ms"
	| "role"
	| "channel"
	| "command-name"
	| "language"
	| "unknown";

export interface AuditFieldMetadata {
	label: string;
	type: AuditFieldType;
	array: boolean;
}

function fields(
	entries: readonly { key: string; name: string }[],
	type: AuditFieldType,
	array: boolean,
): [string, AuditFieldMetadata][] {
	return entries.map((entry) => [entry.key, { label: entry.name, type, array }]);
}

/** English labels of the module flags, which have no entry list of their own. */
const MODULE_LABELS: Record<(typeof GUILD_MODULES)[number]["key"], string> = {
	modulesAutomod: "Auto-moderation Module",
	modulesCommands: "Commands Module",
	modulesLogs: "Logs Module",
	modulesModeration: "Moderation Module",
	modulesRoles: "Roles Module",
};

export const AUDIT_FIELD_METADATA: Readonly<Record<string, AuditFieldMetadata>> =
	Object.fromEntries([
		...fields(ConfigurableRoleToggles, "boolean", false),
		...ConfigurableRoles.map((entry): [string, AuditFieldMetadata] => [
			entry.key,
			{ label: entry.name, type: "role", array: entry.many },
		]),
		...fields(ConfigurableModerationChannels, "channel", false),
		...fields(ConfigurableModerationToggles, "boolean", false),
		...fields(ConfigurableAutomodChannels, "channel", false),
		...fields(ConfigurableAutomodToggles, "boolean", false),
		...fields(ConfigurableLoggingChannels, "channel", false),
		...fields(ConfigurableIgnoreChannels, "channel", true),
		...fields(ConfigurableLogToggles, "boolean", false),
		...fields(ConfigurableCommandChannels, "channel", true),
		...fields(ConfigurableReportChannels, "channel", false),
		...fields(ConfigurableReportRoles, "role", false),
		...fields(ConfigurableReportToggles, "boolean", false),
		...GUILD_MODULES.map((module): [string, AuditFieldMetadata] => [
			module.key,
			{ label: MODULE_LABELS[module.key], type: "boolean", array: false },
		]),
		["language", { label: "Language", type: "language", array: false }],
		["commandsDisabled", { label: "Disabled Commands", type: "command-name", array: true }],
	] satisfies [string, AuditFieldMetadata][]);

/**
 * Settings that only changed name between the V6 and V7 schemas. Audit rows
 * written before the move keep their old keys forever, so the activity feed
 * still has to label and resolve them.
 */
const LEGACY_AUDIT_FIELD_ALIASES: Readonly<Record<string, string>> = {
	channelsIgnoreAll: "logsIgnoreAll",
	channelsIgnoreReactionAdd: "logsIgnoreReactions",
	channelsLogsChannelCreate: "logsChannelCreate",
	channelsLogsChannelDelete: "logsChannelDelete",
	channelsLogsChannelUpdate: "logsChannelUpdate",
	channelsLogsEmojiCreate: "logsEmojiCreate",
	channelsLogsEmojiDelete: "logsEmojiDelete",
	channelsLogsEmojiUpdate: "logsEmojiUpdate",
	channelsLogsImage: "logsImage",
	channelsLogsMemberAdd: "logsMemberAdd",
	channelsLogsMemberNicknameUpdate: "logsMemberNicknameUpdate",
	channelsLogsMemberRemove: "logsMemberRemove",
	channelsLogsMemberUsernameUpdate: "logsMemberUsernameUpdate",
	channelsLogsMessageDelete: "logsMessageDelete",
	channelsLogsMessageDeleteNsfw: "logsMessageDeleteNsfw",
	channelsLogsMessageUpdate: "logsMessageUpdate",
	channelsLogsMessageUpdateNsfw: "logsMessageUpdateNsfw",
	channelsLogsModeration: "moderationChannel",
	channelsLogsPrune: "logsPrune",
	channelsLogsReaction: "logsReactionEmojiAdd",
	channelsLogsRoleCreate: "logsRoleCreate",
	channelsLogsRoleDelete: "logsRoleDelete",
	channelsLogsRoleUpdate: "logsRoleUpdate",
	channelsLogsServerUpdate: "logsServerUpdate",
	disabledChannels: "commandsDisabledChannels",
	disabledCommands: "commandsDisabled",
	eventsTwemojiReactions: "logsReactionEmojiIncludeTwemoji",
	rolesInitialBots: "rolesInitialRobots",
};

/** V6 settings the V7 schema has no column for, kept so old rows stay readable. */
const LEGACY_AUDIT_FIELD_METADATA: Readonly<Record<string, AuditFieldMetadata>> = {
	prefix: { label: "Prefix", type: "string", array: false },
};

export function humanizeKey(key: string): string {
	// "logsMemberAdd" -> "Logs Member Add"
	// "foo.bar.bazQux" -> "Foo Bar Baz Qux"
	return key
		.replace(/\./g, " ")
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

export function getAuditFieldMetadata(key: string): AuditFieldMetadata {
	return (
		AUDIT_FIELD_METADATA[key] ??
		AUDIT_FIELD_METADATA[LEGACY_AUDIT_FIELD_ALIASES[key] ?? ""] ??
		LEGACY_AUDIT_FIELD_METADATA[key] ?? {
			label: humanizeKey(key),
			type: "unknown",
			array: false,
		}
	);
}
