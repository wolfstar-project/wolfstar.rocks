import type { H3Event } from "h3";

export const CURRENT_USER_CACHE_NAME = "getCurrentUser";
export const GUILD_CACHE_NAME = "getGuild";

function buildCurrentUserCacheKey(userId: string): string {
	return `/cache:nitro/functions:${CURRENT_USER_CACHE_NAME}:${userId}.json`;
}

function buildGuildCacheKey(guildId: string): string {
	return `/cache:nitro/functions:${GUILD_CACHE_NAME}:guild:${guildId}.json`;
}

export async function invalidateCurrentUserCache(userId: string): Promise<void> {
	await useStorage().removeItem(buildCurrentUserCacheKey(userId));
}

export async function invalidateGuildCache(guildId: string): Promise<void> {
	await useStorage().removeItem(buildGuildCacheKey(guildId));
}

export function shouldRefreshCurrentUserCache(event: H3Event): boolean {
	return getQuery(event).refresh === "true";
}

export function shouldRefreshGuildCache(event: H3Event): boolean {
	return getQuery(event).refresh === "true";
}
