import type { GuildData } from "#server/database";
import type { Options as DeepMergeOptions } from "deepmerge";
import deepMerge from "deepmerge";

// Overwrite arrays when merging
const mergeOptions: DeepMergeOptions = {
	arrayMerge: (_, sourceArray) => sourceArray,
};

export function useGuildSettings() {
	const { activeGuildId } = useActiveGuild();

	const store = useState<Record<string, GuildData | undefined>>("guild:settings", () => ({}));

	const guildSettings = computed(() =>
		activeGuildId.value ? store.value[activeGuildId.value] : undefined,
	);

	const { guildSettingsChanges } = useGuildSettingsChanges();

	const mergedSettings = computed(() => {
		if (!guildSettings.value) {
			return undefined;
		}

		return deepMerge(
			guildSettings.value,
			guildSettingsChanges.value ?? ({} as GuildData),
			mergeOptions,
		) as GuildData;
	});

	/**
	 * Writes settings for `targetGuildId`, defaulting to the active guild.
	 *
	 * An in-flight PATCH outlives the guild it was issued for: the admin can
	 * confirm a switch while it runs. Callers that awaited a response therefore
	 * pass the id they captured before awaiting, so the response lands on the
	 * guild it belongs to instead of whichever one is active when it arrives.
	 */
	const setGuildSettings = (settings?: GuildData, targetGuildId?: string) => {
		const guildId = targetGuildId ?? activeGuildId.value;
		if (!guildId) {
			return;
		}
		store.value = { ...store.value, [guildId]: settings };
		log.info({ tag: "guild:settings", action: "set_guild_settings", guildId });
	};

	return {
		guildSettings: mergedSettings,
		originalGuildSettings: guildSettings,
		setGuildSettings,
	};
}
