import type { TransformedLoginData } from "#shared/types/discord";
import type { ValuesType } from "#shared/types/utils";

const _useGuildData = () => {
  const guild = useState<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>("guild:data");

  const setGuildData = (newGuildData: ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>) => {
    guild.value = newGuildData;
  };

  return { guildData: readonly(guild), setGuildData };
};

export const useGuildData = createSharedComposable(_useGuildData);
