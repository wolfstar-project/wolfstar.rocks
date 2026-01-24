import type { GuildData } from "#server/database";
import type { Options as DeepMergeOptions } from "deepmerge";
import deepMerge from "deepmerge";

// Overwrite arrays when merging
const mergeOptions: DeepMergeOptions = {
  arrayMerge: (_, sourceArray) => sourceArray,
};

export function useGuildSettingsChanges() {
  // Use useState for reactive state
  const guildSettingsChanges = useState<GuildData | undefined>("guild:settings:changes", () => undefined);

  const mergeGuildSettings = (changes?: Partial<GuildData>) => {
    if (!changes) {
      guildSettingsChanges.value = undefined;
      return;
    }

    guildSettingsChanges.value = deepMerge<GuildData, Partial<GuildData>>(
      guildSettingsChanges.value ?? {} as GuildData,
      changes,
      mergeOptions,
    );
  };

  const setGuildSettingsChanges = (changes?: Partial<GuildData>) => {
    mergeGuildSettings(changes);
  };

  return {
    guildSettingsChanges: readonly(guildSettingsChanges),
    setGuildSettingsChanges,
    mergeGuildSettings,
  };
}
