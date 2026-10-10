import type { GuildData } from "#server/database";
import { getDefaultGuildSettings } from "#server/database/settings/constants";

/**
 * Creates a mock GuildData for testing: the defaults a guild has before
 * anything is written for it, with `overrides` on top.
 * @param id - Guild ID
 * @param overrides - Partial overrides for the default mock guild data
 * @returns A complete GuildData object
 */
export function createMockGuildData(id: string, overrides: Partial<GuildData> = {}): GuildData {
	return {
		...(structuredClone(getDefaultGuildSettings()) as Omit<GuildData, "id">),
		id,
		...overrides,
	};
}
