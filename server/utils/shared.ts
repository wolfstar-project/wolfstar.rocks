import type { RESTOptions } from "@discordjs/rest";
import type { H3Event } from "h3";
import { runtimeConfig } from "#server/utils/runtimeConfig";
import { API } from "@discordjs/core/http-only";
import { REST } from "@discordjs/rest";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { isNullishOrEmpty } from "@sapphire/utilities/isNullOrUndefinedOrEmpty";

export function useApi(rest?: REST) {
  rest ??= useRest();
  return new API(rest);
}

function useRest(options?: Partial<RESTOptions>) {
  if (!runtimeConfig.discord.botToken) {
    throw new Error("'NUXT_OAUTH_DISCORD_BOT_TOKEN' env is not defined");
  }
  return new REST(options).setToken(runtimeConfig.discord.botToken);
}

export function getGuildParam(event: H3Event) {
  const guildId = getRouterParam(event, "guild");
  if (isNullOrUndefined(guildId)) {
    throw createError({
      status: 400,
      message: "No guild id provided",
      data: {
        field: "guildId",
        error: "guild_id_required",
        message: "Guild ID is required",
      },
    });
  }
  return guildId;
}

export function omit<T, K extends keyof T>(keys: K[], obj: T): Omit<T, K> {
  if (!keys.length)
    return obj;
  const key = keys.pop()!;
  const { [key]: omitted, ...rest } = obj;
  return omit(keys, rest as T) as Omit<T, K>;
}

export function maybeParseNumber(value: string | bigint | null | undefined): number | null {
  if (isNullishOrEmpty(value))
    return null;
  return Number(value);
}

export function maybeParseDate(value: string | null | undefined): number | null {
  if (isNullishOrEmpty(value))
    return null;
  return Date.parse(value);
}
