import type { DiscordAPIError, RESTOptions } from "@discordjs/rest";
import type { H3Error, H3Event } from "h3";
import { API } from "@discordjs/core/http-only";
import { REST } from "@discordjs/rest";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { createError } from "h3";

export function createApiError(options: { statusCode: number; message: string; data?: Record<string, any>; error?: Error | DiscordAPIError }) {
  const { statusCode, message, error, data } = options;
  return createError({
    statusCode,
    message,
    cause: error,
    data,
    ...(error && {
      stack: error.stack,
    }),
  });
}

export function getGuildParam(event: H3Event) {
  const guildId = getRouterParam(event, "guild");
  if (isNullOrUndefined(guildId)) {
    throw createApiError({
      statusCode: 400,
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

export function isH3Error(error: unknown): error is H3Error {
  return (
    typeof error === "object"
    && error !== null
    && "statusCode" in error
    && "statusMessage" in error
    && "fatal" in error
    && "unhandled" in error
  );
}

export function guildNameToAcronym(name: string) {
  return name
    .replace(/'s /g, " ")
    .replace(/\w+/g, (e) => e[0])
    .replace(/\s/g, "");
}

export function useApi(rest?: REST) {
  rest ??= useRest();
  return new API(rest);
}

export function useRest(options?: Partial<RESTOptions>) {
  if (!runtimeConfig.discord.botToken) {
    throw new Error("'NUXT_OAUTH_DISCORD_BOT_TOKEN' env is not defined");
  }
  return new REST(options).setToken(runtimeConfig.discord.botToken);
}
