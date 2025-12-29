import type { Options as DeepMergeOptions } from "deepmerge";
import type { GuildData } from "~~/server/database";
import deepMerge from "deepmerge";
import { useGuildSettingsChanges } from "@/composables/useGuildSettingsChanges";

// Overwrite arrays when merging
const mergeOptions: DeepMergeOptions = {
  arrayMerge: (_, sourceArray) => sourceArray,
};

export function useGuildSettings() {
  // Use useState for reactive state
  const guildSettings = useState<GuildData | undefined>("guild:settings", () => undefined);

  // Get guild settings changes composable
  const { guildSettingsChanges } = useGuildSettingsChanges();

  // Computed property that merges settings with changes
  const mergedSettings = computed(() => {
    return deepMerge(
      guildSettings.value ?? {} as GuildData,
      guildSettingsChanges.value ?? {} as GuildData,
      mergeOptions,
    ) as GuildData;
  });

  const setGuildSettings = (settings?: GuildData) => {
    guildSettings.value = settings;
  };

  return {
    guildSettings: readonly(mergedSettings),
    originalGuildSettings: readonly(guildSettings),
    setGuildSettings,
  };
}
