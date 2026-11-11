import type { ReadonlyGuildData } from "#server/database/settings/types";
import type { Snowflake } from "discord-api-types/v10";
import { SettingsContext } from "#server/database/settings/context/SettingsContext";
import { PermissionNodeManager } from "#server/database/settings/structures/PermissionNodeManager";
import { Collection } from "@discordjs/collection";

const cache = new Collection<Snowflake, SettingsContext>();

export function getSettingsContext(settings: ReadonlyGuildData): SettingsContext {
	return cache.ensure(settings.id, () => new SettingsContext(settings));
}

export function updateSettingsContext(
	settings: ReadonlyGuildData,
	data: Partial<ReadonlyGuildData>,
): void {
	const existing = cache.get(settings.id);
	if (existing) {
		existing.update(settings, data);
	} else {
		const context = new SettingsContext(settings);
		cache.set(settings.id, context);
	}
}

/**
 * The permission nodes of settings not saved yet, read on their own: the
 * guild's cached manager holds the saved ones, and must never hold a change.
 */
export function readProposedPermissionNodes(settings: ReadonlyGuildData): PermissionNodeManager {
	return new PermissionNodeManager(settings);
}
