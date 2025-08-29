import type { ValuesType } from "~/types/utils";

export const useGuildData = () => {
  const guild = ref<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>();
  const guildData = computed({
    get: () => guild.value,
    set: (v) => (guild.value = v),
  });

  return guildData;
};
