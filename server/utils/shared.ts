import type { H3Event } from "h3";
// @ts-expect-error virtual import
import { driver } from "#storage-config";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { isNullishOrEmpty } from "@sapphire/utilities/isNullOrUndefinedOrEmpty";
import kv from "unstorage/drivers/cloudflare-kv-http";
import fs from "unstorage/drivers/fs";
import memory from "unstorage/drivers/memory";
import cached from "~~/server/cache-driver";

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

export function guildNameToAcronym(name: string) {
  return name
    .replace(/'s /g, " ")
    .replace(/\w+/g, (e) => e[0])
    .replace(/\s/g, "");
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
