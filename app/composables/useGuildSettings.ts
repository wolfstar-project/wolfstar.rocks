import type { Options as DeepMergeOptions } from 'deepmerge';
import type { GuildData, GuildDataKey, GuildDataValue } from '~~/server/database';
import deepMerge from 'deepmerge';

type NullablePartialGuildData = Partial<{ [K in keyof GuildData]: GuildData[K] | null }>;
// Overwrite arrays when merging
const mergeOptions: DeepMergeOptions = {
	arrayMerge: (_, sourceArray) => sourceArray
};

function useGuildSettings() {
	const guildSettings = useState<GuildData | null>(() => null);
	const guildSettingsChanges = useState<NullablePartialGuildData | null>(() => null);

	const mergedSettings = computed({
		get: () => {
			return deepMerge(guildSettings.value ?? {}, guildSettingsChanges.value ?? {}, mergeOptions);
		},
		set: (newSettings: NullablePartialGuildData) => {
			if (!newSettings) {
				guildSettingsChanges.value = null;
				return;
			}

			guildSettingsChanges.value = deepMerge(guildSettingsChanges.value ?? {}, newSettings, mergeOptions);
		}
	});

	const changes = (settings: GuildData | { [key: string]: GuildDataValue | undefined }) => {
		guildSettingsChanges.value = settings;
	};

	const resetChanges = (key: GuildDataKey) => {
		// Handle the case when the function is called from a button click

		if (guildSettingsChanges.value && key in guildSettingsChanges.value) {
			Reflect.deleteProperty(guildSettingsChanges.value, key);

			// If there are no more changes, set the whole object to null
			if (Object.keys(guildSettingsChanges.value).length === 0) {
				guildSettingsChanges.value = null;
			}
		} else if (guildSettingsChanges.value) {
			Reflect.set(guildSettingsChanges.value, key, null);
		} else {
			guildSettingsChanges.value = {
				[key]: null
			};
		}
	};

	const hasChanges = computed(() => {
		return !!guildSettingsChanges.value && Object.keys(guildSettingsChanges.value).length > 0;
	});

	return {
		settings: readonly(mergedSettings),
		resetChanges,
		hasChanges,
		changes
	};
}

export default useGuildSettings;
