import type { GuildData } from "#server/database";
import type { Options as DeepMergeOptions } from "deepmerge";
import deepMerge from "deepmerge";

// Overwrite arrays when merging
const mergeOptions: DeepMergeOptions = {
	arrayMerge: (_, sourceArray) => sourceArray,
};

export function useGuildSettingsChanges() {
	const { activeGuildId } = useActiveGuild();

	const store = useState<Record<string, GuildData | undefined>>(
		"guild:settings:changes",
		() => ({}),
	);
	const resetCounters = useState<Record<string, number>>(
		"guild:settings:resetCounter",
		() => ({}),
	);

	const guildSettingsChanges = computed(() =>
		activeGuildId.value ? store.value[activeGuildId.value] : undefined,
	);
	const resetCounter = computed(() =>
		activeGuildId.value ? (resetCounters.value[activeGuildId.value] ?? 0) : 0,
	);

	const write = (changes: GuildData | undefined, targetGuildId?: string | null) => {
		const guildId = targetGuildId ?? activeGuildId.value;
		if (!guildId) {
			return;
		}
		store.value = { ...store.value, [guildId]: changes };
	};

	/**
	 * Merges into the draft for `targetGuildId`, defaulting to the active guild.
	 *
	 * An in-flight PATCH outlives the guild it was issued for: the admin can
	 * confirm a switch while it runs. Callers that awaited a response therefore
	 * pass the id they captured before awaiting, so clearing a saved draft
	 * cannot erase edits staged on whichever guild is active when it arrives.
	 */
	const mergeGuildSettings = (changes?: Partial<GuildData>, targetGuildId?: string) => {
		const guildId = targetGuildId ?? activeGuildId.value;
		if (!changes) {
			write(undefined, guildId);
			return;
		}

		write(
			deepMerge<GuildData, Partial<GuildData>>(
				(guildId ? store.value[guildId] : undefined) ?? ({} as GuildData),
				changes,
				mergeOptions,
			),
			guildId,
		);
		log.info({
			tag: "guild:settings:changes",
			action: "merge_settings",
			guildId,
			keys: Object.keys(changes),
		});
	};

	const setGuildSettingsChanges = (changes?: Partial<GuildData>, targetGuildId?: string) => {
		mergeGuildSettings(changes, targetGuildId);
	};

	const removeChange = (key: keyof GuildData) => {
		if (!guildSettingsChanges.value) {
			return;
		}

		const current = { ...guildSettingsChanges.value };
		delete current[key];

		// If no changes remain, drop the entry entirely
		write(Object.keys(current).length === 0 ? undefined : (current as GuildData));
		log.info({
			tag: "guild:settings:changes",
			action: "remove_change",
			guildId: activeGuildId.value,
			key,
		});
	};

	const resetGuildSettingsChanges = () => {
		const guildId = activeGuildId.value;
		if (!guildId) {
			return;
		}
		write(undefined);
		resetCounters.value = { ...resetCounters.value, [guildId]: resetCounter.value + 1 };
		log.info({
			tag: "guild:settings:changes",
			action: "reset_changes",
			guildId,
		});
	};

	return {
		guildSettingsChanges,
		mergeGuildSettings,
		removeChange,
		resetCounter,
		resetGuildSettingsChanges,
		setGuildSettingsChanges,
	};
}
