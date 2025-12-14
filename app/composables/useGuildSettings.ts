import type { GuildSettings } from "#shared/types/guildSettings";
import type { Options as DeepMergeOptions } from "deepmerge";
import deepMerge from "deepmerge";
import { useGuildSettingsChanges } from "@/composables/useGuildSettingsChanges";

// Overwrite arrays when merging
const mergeOptions: DeepMergeOptions = {
  arrayMerge: (_, sourceArray) => sourceArray,
};

export function useGuildSettings() {
  // Use ref for reactive state
  const guildSettings = ref<GuildSettings | undefined>(undefined);

  // Get guild settings changes composable
  const { guildSettingsChanges } = useGuildSettingsChanges();

  // Computed property that merges settings with changes
  const mergedSettings = computed(() => {
    return deepMerge(
      guildSettings.value ?? {} as GuildSettings,
      guildSettingsChanges.value ?? {} as GuildSettings,
      mergeOptions,
    ) as GuildSettings;
  });

  const setGuildSettings = (settings?: GuildSettings) => {
    guildSettings.value = settings;
  };

  return {
    guildSettings: readonly(mergedSettings),
    setGuildSettings,
  };
}
