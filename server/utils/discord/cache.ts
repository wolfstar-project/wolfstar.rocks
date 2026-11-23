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

/**
 * The key of a guild's last live probe in the `cache` storage, which every
 * isolate of the Worker reads (`server/utils/shared-cache.ts`).
 */
export function buildGuildProbeKey(guildId: string): string {
	return `discord:guild-probe:${guildId}`;
}

export async function invalidateGuildCache(guildId: string): Promise<void> {
	recentGuildProbes.delete(guildId);
	settledGuildProbes.delete(guildId);
	rememberInvalidation(guildId);
	await Promise.all([
		removePersistedGuild(guildId),
		useStorage("cache")
			.removeItem(buildGuildProbeKey(guildId))
			.catch(() => undefined),
	]);
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
	/** When Discord gave a live answer, as `Date.now()`; it may be a shared one. */
	at?: number;
}

/**
 * How long a live probe of the bot's membership answers for its guild. The
 * server list probes every guild of the user, and opening a server asks for
 * it twice more at once (`/api/guilds/:id` and its settings); within this
 * window they share one request to Discord instead of making three. It is
 * also how long the bot's leaving a guild takes to show.
 */
export const GUILD_PROBE_TTL_MS = 60_000;
const GUILD_PROBE_SWEEP_SIZE = 1000;
const recentGuildProbes = new Map<string, { expires: number; probe: Promise<GuildProbe> }>();
/**
 * The live answers an isolate of the Worker has, kept as values: a request
 * there may not wait on a promise another request started, but it may read
 * what that request found. They are kept for less time than the shared copy,
 * since `invalidateGuildCache()` reaches only the isolate it runs in: after
 * the bot is invited, the other isolates learn of it within this time.
 */
const SETTLED_GUILD_PROBE_TTL_MS = 10_000;
const settledGuildProbes = new Map<string, { expires: number; probe: GuildProbe }>();

/**
 * When this isolate last invalidated each guild's probe. A shared probe older
 * than that is not read back, whether Workers KV has applied the removal yet
 * or still serves the copy it keeps for a minute in this location.
 */
const guildProbeInvalidations = new Map<string, { expires: number; at: number }>();

function rememberInvalidation(guildId: string) {
	const now = Date.now();
	sweep(guildProbeInvalidations, now);
	guildProbeInvalidations.set(guildId, { at: now, expires: now + GUILD_PROBE_TTL_MS });
}

/** Whether a probe made at `at` predates this isolate's last invalidation of its guild. */
export function isGuildProbeInvalidated(guildId: string, at: number): boolean {
	const invalidation = guildProbeInvalidations.get(guildId);
	return invalidation !== undefined && at <= invalidation.at;
}

function sweep<V extends { expires: number }>(entries: Map<string, V>, now: number) {
	if (entries.size < GUILD_PROBE_SWEEP_SIZE) return;
	for (const [id, entry] of entries) {
		if (entry.expires <= now) entries.delete(id);
	}
}

export function rememberGuildProbe(
	guildId: string,
	run: () => Promise<GuildProbe>,
): Promise<GuildProbe> {
	const now = Date.now();
	// On Workers a request cannot wait on a promise another request started: the
	// check of `canWaitOnOtherRequests()`, which this file cannot import, as
	// `auth.config.ts` loads it outside Nitro's aliases.
	if (globalThis.navigator?.userAgent === "Cloudflare-Workers") {
		const settled = settledGuildProbes.get(guildId);
		if (settled && settled.expires > now) return Promise.resolve(settled.probe);
		return run().then((probe) => {
			if (probe.live) {
				sweep(settledGuildProbes, now);
				const expires = Math.min(
					(probe.at ?? now) + GUILD_PROBE_TTL_MS,
					now + SETTLED_GUILD_PROBE_TTL_MS,
				);
				settledGuildProbes.set(guildId, { expires, probe });
			}
			return probe;
		});
	}

	const recent = recentGuildProbes.get(guildId);
	if (recent && recent.expires > now) {
		return recent.probe;
	}

	sweep(recentGuildProbes, now);

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
