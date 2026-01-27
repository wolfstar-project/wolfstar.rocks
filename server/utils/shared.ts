import type { RESTOptions } from "@discordjs/rest";
import type { H3Event } from "h3";
import cached from "#server/cache-driver";
import { runtimeConfig } from "#server/utils/runtimeConfig";
// @ts-expect-error virtual import
import { driver } from "#storage-config";
import { API } from "@discordjs/core/http-only";
import { REST } from "@discordjs/rest";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { isNullishOrEmpty } from "@sapphire/utilities/isNullOrUndefinedOrEmpty";
import kv from "unstorage/drivers/cloudflare-kv-http";
import fs from "unstorage/drivers/fs";
import memory from "unstorage/drivers/memory";

const storage = useStorage();

if (driver === "fs") {
  const config = useRuntimeConfig();
  storage.mount("wolfstar:ratelimiter", fs({ base: config.storage.fsBase }));
}
else if (driver === "cloudflare") {
  const config = useRuntimeConfig();
  storage.mount("wolfstar:ratelimiter", cached(kv({
    accountId: config.cloudflare.accountId,
    namespaceId: config.cloudflare.namespaceId,
    apiToken: config.cloudflare.apiToken,
  })));
}
else if (driver === "memory") {
  storage.mount("wolfstar:ratelimiter", memory());
}

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

/**
 * @param name Guild name
 * @returns Guild acronym
 */
export function guildNameToAcronym(name: string) {
  const MAX_LEN = 3;
  if (!name || !name.trim()) {
    return "";
  }

  const normalized = name.trim().replace(/\s+/g, " ").replace(/(?:'s|’s)\b/giu, " ");

  const words = Array.from(normalized.matchAll(/(?:\p{L}|\p{N})[\p{L}\p{N}'’\-]*/gu)).map(
    (m) => m[0],
  );

  if (words.length === 1) {
    const only = words[0];
    const alnums = Array.from(String(only)).filter((ch) => /[\p{L}\p{N}]/u.test(ch)).slice(0, MAX_LEN);
    if (alnums.length > 1 && /\p{N}/u.test(alnums[0]!)) {
      return alnums.join("").toUpperCase();
    }
  }

  const initials: string[] = [];
  for (const w of words) {
    const firstGrapheme = Array.from(w)[0];
    if (firstGrapheme && /[\p{L}\p{N}]/u.test(firstGrapheme)) {
      initials.push(firstGrapheme);
      if (initials.length >= MAX_LEN) {
        break;
      }
    }
  }

  if (initials.length === 0) {
    const fallback = Array.from(normalized).filter((ch) => /[\p{L}\p{N}]/u.test(ch)).slice(0, MAX_LEN);
    if (fallback.length) {
      return fallback.join("").toUpperCase();
    }

    return Array.from(normalized).slice(0, MAX_LEN).join("").toUpperCase();
  }

  return initials.join("").toUpperCase();
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
