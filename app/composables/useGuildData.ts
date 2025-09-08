import type { ValuesType } from "~/types/utils";

const _useGuildData = () => {
  const guild = ref<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>();
  const guildData = computed({
    get: () => guild.value,
    set: (v) => (guild.value = v),
  });

  return guildData;
};

export const useGuildData = createSharedComposable(_useGuildData);
