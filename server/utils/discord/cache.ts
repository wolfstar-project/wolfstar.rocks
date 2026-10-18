import type { APIGuild } from "discord-api-types/v10";
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
	recentGuildProbes.delete(guildId);
	await removePersistedGuild(guildId);
}

/** Drops only the stored `getGuild` entry; a remembered probe stays. */
export async function removePersistedGuild(guildId: string): Promise<void> {
	await useStorage().removeItem(buildGuildCacheKey(guildId));
}

export interface GuildProbe {
	guild: APIGuild | null;
	/** Discord answered 404: the bot is not in the guild. */
	confirmedAbsent: boolean;
	/** Discord answered; `false` when the probe fell back to the stored entry. */
	live: boolean;
}

/**
 * How long a live probe of the bot's membership answers for its guild. The
 * server list probes every guild of the user, and opening a server asks for
 * it twice more at once (`/api/guilds/:id` and its settings); within this
 * window they share one request to Discord instead of making three.
 */
const GUILD_PROBE_TTL_MS = 30_000;
const GUILD_PROBE_SWEEP_SIZE = 1000;
const recentGuildProbes = new Map<string, { expires: number; probe: Promise<GuildProbe> }>();

export function rememberGuildProbe(
	guildId: string,
	run: () => Promise<GuildProbe>,
): Promise<GuildProbe> {
	const now = Date.now();
	const recent = recentGuildProbes.get(guildId);
	if (recent && recent.expires > now) {
		return recent.probe;
	}

	if (recentGuildProbes.size >= GUILD_PROBE_SWEEP_SIZE) {
		for (const [id, entry] of recentGuildProbes) {
			if (entry.expires <= now) recentGuildProbes.delete(id);
		}
	}

	const probe = run();
	recentGuildProbes.set(guildId, { expires: now + GUILD_PROBE_TTL_MS, probe });
	// Only Discord's own answer is worth sharing; a fallback is asked again.
	const forget = () => {
		if (recentGuildProbes.get(guildId)?.probe === probe) recentGuildProbes.delete(guildId);
	};
	void probe.then((result) => {
		if (!result.live) forget();
	}, forget);
	return probe;
}

export function shouldRefreshCurrentUserCache(event: H3Event): boolean {
	return getQuery(event).refresh === "true";
}

export function shouldRefreshGuildCache(event: H3Event): boolean {
	return getQuery(event).refresh === "true";
}
