/**
 * Single source of truth for label + value type for every dashboard-managed GuildData key.
 * Mirrors the WolfStar bot's configuration.ts key registry for use in audit log rendering.
 *
 * CONTRACT:
 * - label: verbatim string from shared/utils/settingsDataEntries.ts (name or title field).
 *   Do NOT rename, abbreviate, or transform these strings.
 * - type: AuditFieldType — controls which renderer formatTypedValue uses.
 * - array: true when the GuildData field stores an array of IDs (e.g. rolesAdmin = string[]).
 */

import { isRoleArrayKey } from "../schemas/roles";
import {
	ConfigurableIgnoreChannels,
	ConfigurableLoggingChannels,
	ConfigurableMessageEvents,
	ConfigurableModerationEvents,
	ConfigurableModerationKeys,
	ConfigurableRemoveInitialRole,
	ConfigurableRoles,
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

export const AUDIT_FIELD_METADATA: Readonly<Record<string, AuditFieldMetadata>> = {
	[ConfigurableRemoveInitialRole.key]: {
		label: ConfigurableRemoveInitialRole.name,
		type: "boolean",
		array: false,
	},
	...Object.fromEntries(
		ConfigurableRoles.map((entry): [string, AuditFieldMetadata] => [
			entry.key,
			{ label: entry.name, type: "role", array: isRoleArrayKey(entry.key) },
		]),
	),
	...Object.fromEntries(
		ConfigurableLoggingChannels.map((entry): [string, AuditFieldMetadata] => [
			entry.key,
			{ label: entry.name, type: "channel", array: false },
		]),
	),
	...Object.fromEntries(
		ConfigurableIgnoreChannels.map((entry): [string, AuditFieldMetadata] => [
			entry.key,
			{ label: entry.name, type: "channel", array: true },
		]),
	),
	...Object.fromEntries(
		[...ConfigurableModerationEvents, ...ConfigurableMessageEvents].map(
			(entry): [string, AuditFieldMetadata] => [
				entry.key,
				{ label: entry.title, type: "boolean", array: false },
			],
		),
	),
	...Object.fromEntries(
		ConfigurableModerationKeys.map((entry): [string, AuditFieldMetadata] => [
			entry.key,
			{ label: entry.name, type: "boolean", array: false },
		]),
	),
	prefix: { label: "Prefix", type: "string", array: false },
	language: { label: "Language", type: "language", array: false },
	disabledCommands: { label: "Disabled Commands", type: "command-name", array: true },
	disabledCommandsChannels: {
		label: "Disabled Commands Channels",
		type: "channel",
		array: true,
	},
};

export function humanizeKey(key: string): string {
	// "channelsLogsMemberAdd" -> "Channels Logs Member Add"
	// "foo.bar.bazQux" -> "Foo Bar Baz Qux"
	return key
		.replace(/\./g, " ")
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

export function getAuditFieldMetadata(key: string): AuditFieldMetadata {
	return AUDIT_FIELD_METADATA[key] ?? { label: humanizeKey(key), type: "unknown", array: false };
}
