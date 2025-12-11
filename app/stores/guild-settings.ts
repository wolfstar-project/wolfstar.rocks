import type { Options as DeepMergeOptions } from "deepmerge";
import type { GuildData, GuildDataKey } from "~~/server/database";
import { isDeepStrictEqual } from "node:util";
import { isNullOrUndefined } from "@sapphire/utilities";
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
    loading: false,
    saving: false,
  }),
  getters: {
    // Deprecated: kept for compatibility, but now just returns settings
    mergedSettings(state): GuildData | null {
      return state.settings;
    },
    hasChanges(state): boolean {
      if (isNullOrUndefined(state.settings) || isNullOrUndefined(state.originalSettings))
        return false;
      return !isDeepStrictEqual(state.settings, state.originalSettings);
    },
    hasError(state): boolean {
      return !!state.error;
    },
  },
  actions: {
    async fetchSettings() {
      const guild = useGuildData();
      this.loading = true;
      this.error = undefined;

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
        throw e;
      }
      finally {
        this.loading = false;
      }
    },

    // Updates local state only
    updateSettings(partialSettings: NullablePartialGuildData) {
      if (isNullOrUndefined(this.settings))
        return;

      // Use deepMerge to update settings
      this.settings = deepMerge(this.settings, partialSettings as Partial<GuildData>, mergeOptions) as GuildData;
    },

    // Saves current settings to API
    async saveSettings() {
      const guild = useGuildData();
      if (isNullOrUndefined(this.settings) || isNullOrUndefined(this.originalSettings)) {
        throw createError({
          statusCode: 400,
          message: "No settings to save",
        });
      }

      // Calculate the diff between current and original settings
      const changes: Array<[string, any]> = [];
      for (const key in this.settings) {
        const typedKey = key as keyof GuildData;
        if (!isDeepStrictEqual(this.settings[typedKey], this.originalSettings[typedKey])) {
          changes.push([key, this.settings[typedKey]]);
        }
      }

      if (changes.length === 0) {
        // No changes to save
        return null;
      }

      this.saving = true;

      try {
        const data = await $fetch<GuildData>(`/api/guilds/${guild.value?.id}/settings`, {
          method: "PATCH",
          body: {
            data: changes,
          },
        });

        this.settings = data ? JSON.parse(JSON.stringify(data)) : null;
        this.originalSettings = data ? JSON.parse(JSON.stringify(data)) : null;
        this.error = undefined;
        return null;
      }
      catch (error: any) {
        this.error = error;
        return error;
      }
      finally {
        this.saving = false;
      }
    },

    resetChange(key: GuildDataKey) {
      if (isNullOrUndefined(this.settings) || isNullOrUndefined(this.originalSettings))
        return;

      // Revert specific key from originalSettings
      if (key in this.originalSettings) {
        (this.settings as any)[key] = JSON.parse(JSON.stringify(this.originalSettings[key]));
      }
    },

    resetAllChanges() {
      if (isNullOrUndefined(this.originalSettings))
        return;

      this.settings = JSON.parse(JSON.stringify(this.originalSettings));
    },

    // Compatibility alias for old setChanges if needed, but better to update consumers
    // We will update consumers to use updateSettings
  },
});

interface State {
  settings: GuildData | null;
  originalSettings: GuildData | null;
  loading: boolean;
  saving: boolean;
  error?: Error;
}
