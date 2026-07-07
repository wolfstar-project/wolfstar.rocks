import type { GuildData, GuildDataKey } from "#server/database";

/**
 * Assigns a guild-settings value when the form explicitly controls the key.
 * Skips `undefined` so untouched keys are not sent in PATCH payloads.
 */
export function setGuildDataChange<K extends GuildDataKey>(
	changes: Partial<GuildData>,
	key: K,
	value: GuildData[K] | undefined,
): void {
	if (value !== undefined) {
		changes[key] = value;
	}
}
