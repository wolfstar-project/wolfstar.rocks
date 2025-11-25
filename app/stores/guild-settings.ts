import type { Options as DeepMergeOptions } from "deepmerge";
import type { GuildData, GuildDataKey } from "~~/server/database";
import deepMerge from "deepmerge";

type NullablePartialGuildData = Partial<{ [K in keyof GuildData]: GuildData[K] | null }>;

// Overwrite arrays when merging
const mergeOptions: DeepMergeOptions = {
  arrayMerge: (_, sourceArray) => sourceArray,
};

export const useGuildSettingsStore = defineStore("guild", {
  state: (): State => ({
    settings: null,
    originalSettings: null,
  }),
  getters: {
    // Deprecated: kept for compatibility, but now just returns settings
    mergedSettings(state): GuildData | null {
      return state.settings;
    },
    hasChanges(state): boolean {
      if (!state.settings || !state.originalSettings)
        return false;
      return JSON.stringify(state.settings) !== JSON.stringify(state.originalSettings);
    },
    hasError(state): boolean {
      return !!state.error;
    },
  },
  actions: {
    async fetchSettings() {
      const guild = useGuildData();
      try {
        const data = await $fetch<GuildData>(`/api/guilds/${guild.value?.id}/settings`, {
          method: "GET",
        });

        // Deep clone to ensure no reference sharing
        this.settings = data ? JSON.parse(JSON.stringify(data)) : null;
        this.originalSettings = data ? JSON.parse(JSON.stringify(data)) : null;
      }
      catch (e: any) {
        this.error = e;
      }
    },

    // Updates local state only
    updateSettings(partialSettings: NullablePartialGuildData) {
      if (!this.settings)
        return;

      // Use deepMerge to update settings
      this.settings = deepMerge(this.settings, partialSettings as Partial<GuildData>, mergeOptions) as GuildData;
    },

    // Saves current settings to API
    async saveSettings() {
      const guild = useGuildData();
      try {
        const data = await $fetch<GuildData>(`/api/guilds/${guild.value?.id}/settings`, {
          method: "PATCH",
          body: {
            data: this.settings,
          },
        });

        this.settings = data ? JSON.parse(JSON.stringify(data)) : null;
        this.originalSettings = data ? JSON.parse(JSON.stringify(data)) : null;
        return null;
      }
      catch (e: any) {
        this.error = e;
        return e;
      }
    },

    resetChange(key: GuildDataKey) {
      if (!this.settings || !this.originalSettings)
        return;

      // Revert specific key from originalSettings
      if (key in this.originalSettings) {
        (this.settings as any)[key] = JSON.parse(JSON.stringify(this.originalSettings[key]));
      }
    },

    resetAllChanges() {
      if (this.originalSettings) {
        this.settings = JSON.parse(JSON.stringify(this.originalSettings));
      }
    },

    // Compatibility alias for old setChanges if needed, but better to update consumers
    // We will update consumers to use updateSettings
  },
});

interface State {
  settings: GuildData | null;
  originalSettings: GuildData | null;
  error?: Error;
}
