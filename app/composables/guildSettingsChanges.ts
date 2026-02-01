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

  const removeChange = (key: keyof GuildData) => {
    if (!guildSettingsChanges.value)
      return;

    const current = { ...guildSettingsChanges.value };
    delete current[key];

    // If no changes remain, set to undefined
    if (Object.keys(current).length === 0) {
      guildSettingsChanges.value = undefined;
    }
    else {
      guildSettingsChanges.value = current as GuildData;
    }
  };

  return {
    guildSettingsChanges: readonly(guildSettingsChanges),
    setGuildSettingsChanges,
    mergeGuildSettings,
    removeChange,
  };
}
