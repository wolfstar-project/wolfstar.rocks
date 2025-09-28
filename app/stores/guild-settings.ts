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
    changes: null,
    loading: false,
  }),
  getters: {
    mergedSettings(state): GuildData {
      state.changes ??= {};
      return deepMerge(state.settings!, state.changes!, mergeOptions) as GuildData;
    },
    hasChanges(state): boolean {
      return !!state.changes && Object.keys(state.changes).length > 0;
    },
  },
  actions: {
    async fetchSettings() {
      const guild = useGuildData();
      if (!guild.value)
        return;

      this.changes = null;
      this.loading = true;
      try {
        const { data } = await useFetch<GuildData>(`/api/guilds/${guild.value.id}/settings`, {
          method: "GET",
        });
        if (data.value) {
          this.settings = data.value;
        }
      }
      catch (error) {
        console.error("Failed to fetch guild settings:", error);
      }
      finally {
        this.loading = false;
      }
    },
    async setChanges(newChanges: NullablePartialGuildData) {
      if (!newChanges) {
        this.changes = null;
        return;
      }

      const guild = useGuildData();

      this.changes = deepMerge(this.changes ?? {}, newChanges, mergeOptions);

      const { error, status } = await useFetch(`/api/guilds/${guild.value.id}/settings`, {
        method: "PATCH",
        body: {
          data: this.changes,
        },
      });

      if (status.value === "error") {
        return error;
      }
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

interface State {
  settings: GuildData | null;
  changes: NullablePartialGuildData | null;
  loading: boolean;
}
