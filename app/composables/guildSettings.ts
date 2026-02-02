import type { GuildData } from "#server/database";
import type { Options as DeepMergeOptions } from "deepmerge";
import { useRouteParams } from "@vueuse/router";
import deepMerge from "deepmerge";

// Overwrite arrays when merging
const mergeOptions: DeepMergeOptions = {
  arrayMerge: (_, sourceArray) => sourceArray,
};

export function useGuildSettings() {
  const guildId = useRouteParams("id", null, { transform: String });

  // Use guild-scoped state key
  const guildSettings = useState<GuildData | undefined>(
    `guild:${guildId.value}:settings`,
    () => undefined,
  );

  // Get guild settings changes composable
  const { guildSettingsChanges } = useGuildSettingsChanges();

  // Computed property that merges settings with changes
  // Return undefined if settings haven't loaded yet
  const mergedSettings = computed(() => {
    if (!guildSettings.value) {
      return undefined;
    }

    return deepMerge(
      guildSettings.value,
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
