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

	const write = (changes: GuildData | undefined) => {
		const guildId = activeGuildId.value;
		if (!guildId) {
			return;
		}
		store.value = { ...store.value, [guildId]: changes };
	};

	const mergeGuildSettings = (changes?: Partial<GuildData>) => {
		if (!changes) {
			write(undefined);
			return;
		}

		write(
			deepMerge<GuildData, Partial<GuildData>>(
				guildSettingsChanges.value ?? ({} as GuildData),
				changes,
				mergeOptions,
			),
		);
		log.info({
			tag: "guild:settings:changes",
			action: "merge_settings",
			guildId: activeGuildId.value,
			keys: Object.keys(changes),
		});
	};

	const setGuildSettingsChanges = (changes?: Partial<GuildData>) => {
		mergeGuildSettings(changes);
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
