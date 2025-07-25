import type { REST } from "@discordjs/rest";
import { API } from "@discordjs/core/http-only";
import { useRest } from "./rest";

export default (rest?: REST) => {
  rest ??= useRest();
  return new API(rest);
};
