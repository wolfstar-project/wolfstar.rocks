import type { RESTOptions } from "@discordjs/rest";

import { REST } from "@discordjs/rest";

export default function (options?: Partial<RESTOptions>) {
  if (!runtimeConfig.discordToken) {
    throw new Error("'NUXT_OAUTH_DISCORD_BOT_TOKEN' env is not defined");
  }
  return new REST(options).setToken(runtimeConfig.discordToken);
}
