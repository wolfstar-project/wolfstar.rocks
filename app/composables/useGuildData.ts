import type { TransformedLoginData } from "#shared/types/discord";
import type { ValuesType } from "~/types/utils";

const _useGuildData = () => {
  const guild = useState<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>();

  return guild;
};

export const useGuildData = createSharedComposable(_useGuildData);
