import type { GuildSettings } from "#shared/types/guildSettings";
import type { Options as DeepMergeOptions } from "deepmerge";
import deepMerge from "deepmerge";

// Overwrite arrays when merging
const mergeOptions: DeepMergeOptions = {
  arrayMerge: (_, sourceArray) => sourceArray,
};

export function useGuildSettingsChanges() {
  // Use useState for reactive state
  const guildSettingsChanges = useState<GuildSettings | undefined>("guild:settings:changes", () => undefined);

  const mergeGuildSettings = (changes?: Partial<GuildSettings>) => {
    if (!changes) {
      guildSettingsChanges.value = undefined;
      return;
    }

    guildSettingsChanges.value = deepMerge<GuildSettings, Partial<GuildSettings>>(
      guildSettingsChanges.value ?? {} as GuildSettings,
      changes,
      mergeOptions,
    );
  };

  const setGuildSettingsChanges = (changes?: Partial<GuildSettings>) => {
    mergeGuildSettings(changes);
  };

  return {
    guildSettingsChanges: readonly(guildSettingsChanges),
    setGuildSettingsChanges,
    mergeGuildSettings,
  };
}
