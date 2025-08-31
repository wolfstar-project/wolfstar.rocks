import type { FlattenedCommand } from "#shared/types/discord";
import type { ExpirableLocalStorageStructure } from "@/utils/constants";
import { Time } from "@sapphire/time-utilities";
import { computed, ref } from "vue";
import { useAPI } from "@/composables/externalApi";

const commandsStorage = ref<ExpirableLocalStorageStructure<FlattenedCommand[]>>({
  expire: 0,
  data: [],
});

export function useCommands() {
  const commands = computed(() => commandsStorage.value.data);
  const expired = computed(() => commandsStorage.value.expire < Date.now());

  async function fetchCommands() {
    try {
      if (!expired.value && !import.meta.env.DEV) {
        return;
      }

      const { data: commandsData } = await useAPI<FlattenedCommand[]>("/commands");

      commandsStorage.value = {
        expire: Date.now() + Time.Day * 6,
        data: Array.isArray(commandsData.value) ? commandsData.value : [],
      };
    }
    catch {
      /* empty */
    }
  }

  return {
    commands,
    expired,
    fetchCommands,
  };
}
