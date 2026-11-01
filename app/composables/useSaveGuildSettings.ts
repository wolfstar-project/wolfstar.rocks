import type { GuildData } from "#server/database";
import { objectValues } from "@sapphire/utilities";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { objectToTuples } from "@sapphire/utilities/objectToTuples";

/**
 * Writes settings to a server at once, as the unsaved-changes bar does for the
 * edits staged in a section, for the places that save in one go: the setup of a
 * server, which is its own confirmation.
 *
 * The server's saved settings are replaced with the answer. The changes are
 * validated by the same route as every other write, and audited there as one
 * entry. A failure leaves everything as it was and reports `false`.
 */
export function useSaveGuildSettings() {
	const { setGuildSettings } = useGuildSettings();

	async function save(guildId: string, changes: Partial<GuildData>): Promise<boolean> {
		try {
			const response = await $fetch(`/api/guilds/${guildId}/settings`, {
				body: { data: objectToTuples(changes) },
				method: "PATCH",
			});
			const saved = parseGuildSettingsSaveResponse(response) as GuildData;
			if (isNullOrUndefined(saved) || objectValues(saved).length === 0) return false;

			// The guild this write was for, not whichever is active by now.
			setGuildSettings(saved, guildId);
			return true;
		} catch (error) {
			log.error({
				tag: "wolfstar:dashboard",
				message: `Failed to save settings for guild Id: ${guildId}`,
				error: parseError(error),
			});
			return false;
		}
	}

	return { save };
}
