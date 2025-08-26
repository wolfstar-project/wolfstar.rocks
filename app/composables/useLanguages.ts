import type { ExpirableLocalStorageStructure } from "@/utils/constants";
import { Time } from "@sapphire/time-utilities";
import { computed, ref } from "vue";
import { useAPI } from "@/composables/externalApi";

const languagesStorage = ref<ExpirableLocalStorageStructure<string[]>>({
  expire: 0,
  data: [],
});

export function useLanguages() {
  const languages = computed(() => languagesStorage.value.data);
  const expired = computed(() => languagesStorage.value.expire < Date.now());

  async function fetchLanguages() {
    try {
      if (!expired.value && !import.meta.env.DEV) {
        return;
      }

      const { data: languagesData } = await useAPI<string[]>("/languages");
      languagesStorage.value = {
        expire: Date.now() + Time.Day * 6,
        data: Array.isArray(languagesData.value) ? languagesData.value : [],
      };
    }
    catch {
      /* empty */
    }
  }

  return {
    languages,
    expired,
    fetchLanguages,
  };
}
