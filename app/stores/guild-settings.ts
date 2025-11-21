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
    settings: undefined,
    changes: null,
    loading: false,
    error: undefined,
  }),
  getters: {
    mergedSettings(state): GuildData {
      state.changes ??= {};
      return deepMerge(state.settings!, state.changes!, mergeOptions) as GuildData;
    },
    hasChanges(state): boolean {
      return !!state.changes && Object.keys(state.changes).length > 0;
    },
    hasError(state): boolean {
      return !!state.error;
    },
  },
  actions: {
    async fetchSettings() {
      const guild = useGuildData();
      if (!guild.value?.id) {
        return;
      }

      this.changes = null;
      this.settings = null;
      this.error = undefined;
      this.loading = true;

      const { data, error, status } = await useFetch<GuildData>(`/api/guilds/${guild.value.id}/settings`, {
        method: "GET",
      });
      this.settings = data.value;
      this.loading = status.value === "pending";
      this.error = error.value;
    },
    async setChanges(newChanges?: NullablePartialGuildData | null) {
      if (!newChanges) {
        this.changes = null;
        return;
      }

      const guild = useGuildData();
      if (!guild.value?.id)
        return new Error("Missing guild id");

      this.changes = deepMerge(this.changes ?? {}, newChanges, mergeOptions);

      const { data, error, status } = await useFetch<GuildData>(`/api/guilds/${guild.value.id}/settings`, {
        method: "PATCH",
        body: {
          data: this.changes,
        },
      });

      if (status.value === "error")
        return error.value;

      // Commit server response when available; otherwise commit local snapshot.
      this.settings = data.value
        ?? (deepMerge(this.settings ?? {} as GuildData, this.changes!, mergeOptions) as GuildData);
      this.changes = null;
      return null;
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
  settings?: GuildData | null;
  changes: NullablePartialGuildData | null;
  loading: boolean;
  error?: Error | null;
}
