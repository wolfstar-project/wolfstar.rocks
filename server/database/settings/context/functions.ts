import type { ReadonlyGuildData } from "#server/database/settings/types";
import type { Snowflake } from "discord-api-types/v10";
import { SettingsContext } from "#server/database/settings/context/SettingsContext";
import { Collection } from "@discordjs/collection";

const cache = new Collection<Snowflake, SettingsContext>();

export function getSettingsContextByGuildId(guildId: Snowflake): SettingsContext | null {
	return cache.get(guildId) ?? null;
}

export function getSettingsContext(settings: ReadonlyGuildData): SettingsContext {
	return cache.ensure(settings.id, () => new SettingsContext(settings));
}

export function updateSettingsContext(settings: ReadonlyGuildData, data: Partial<ReadonlyGuildData>): void {
	const existing = cache.get(settings.id);
	if (existing) {
		existing.update(settings, data);
	} else {
		const context = new SettingsContext(settings);
		cache.set(settings.id, context);
	}
}

export function deleteSettingsContext(guildId: Snowflake) {
	cache.delete(guildId);
}
