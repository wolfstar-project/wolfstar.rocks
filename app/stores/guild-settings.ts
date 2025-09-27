import type { Options as DeepMergeOptions } from "deepmerge";
import type { GuildData, GuildDataKey } from "~~/server/database";
import deepMerge from "deepmerge";

type NullablePartialGuildData = Partial<{ [K in keyof GuildData]: GuildData[K] | null }>;

// Overwrite arrays when merging
const mergeOptions: DeepMergeOptions = {
  arrayMerge: (_, sourceArray) => sourceArray,
};

export const useGuildSettingsStore = defineStore("guild", {
  state: () => ({
    settings: null as GuildData | null,
    changes: null as NullablePartialGuildData | null,
  }),
  getters: {
    mergedSettings(state): GuildData {
      return deepMerge(state.settings ?? {}, state.changes ?? {}, mergeOptions);
    },
    hasChanges(state): boolean {
      return !!state.changes && Object.keys(state.changes).length > 0;
    },
  },
  actions: {
    setSettings(settings: GuildData) {
      this.settings = settings;
      this.changes = null;
    },
    setChanges(newChanges: NullablePartialGuildData) {
      if (!newChanges) {
        this.changes = null;
        return;
      }

      this.changes = deepMerge(this.changes ?? {}, newChanges, mergeOptions);
    },
    resetChange(key: GuildDataKey) {
      if (this.changes && key in this.changes) {
        Reflect.deleteProperty(this.changes, key);

        // If there are no more changes, set the whole object to null
        if (Object.keys(this.changes).length === 0) {
          this.changes = null;
        }
      }
      else if (this.changes) {
        Reflect.set(this.changes, key, null);
      }
      else {
        this.changes = {
          [key]: null,
        };
      }
    },
    resetAllChanges() {
      if (this.changes && Object.keys(this.changes).length > 0) {
        Object.keys(this.changes).forEach((key) => {
          this.resetChange(key as keyof GuildData);
        });
      }
    },
  },
});
