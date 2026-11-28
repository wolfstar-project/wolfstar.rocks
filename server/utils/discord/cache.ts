import type { APIGuild } from "discord-api-types/v10";
import type { H3Event } from "nitro/h3";
import { useKV as useStorage } from "nitro/kv";
import { getQuery } from "nuxt/server";
import { resolveCacheKeys } from "ocache";

export const CURRENT_USER_CACHE_NAME = "getCurrentUser";
export const GUILD_CACHE_NAME = "getGuild";

/**
 * Nitro v3 stores a cached function's entries under keys that ocache builds
 * from its group, its name and the key of the call (the group is escaped and
 * hashed, so a key spelled by hand would miss the entry). The keys are read
 * from ocache itself, as the storage of Nitro's `kv` cache driver holds them.
 */
const CACHED_FUNCTION_GROUP = "nitro/functions";

async function cachedFunctionKeys(name: string, key: string): Promise<string[]> {
	return resolveCacheKeys({ options: { group: CACHED_FUNCTION_GROUP, name, getKey: () => key } });
}

function currentUserCacheKeys(userId: string): Promise<string[]> {
	return cachedFunctionKeys(CURRENT_USER_CACHE_NAME, userId);
}

function guildCacheKeys(guildId: string): Promise<string[]> {
	return cachedFunctionKeys(GUILD_CACHE_NAME, `guild:${guildId}`);
}

async function removeKeys(keys: string[]): Promise<void> {
	const storage = useStorage();
	await Promise.all(keys.map((key) => storage.removeItem(key)));
}

export async function invalidateCurrentUserCache(userId: string): Promise<void> {
	await removeKeys(await currentUserCacheKeys(userId));
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

/**
 * Drops only the stored `getGuild` entry; a remembered probe stays. A key that
 * holds nothing is not removed: on a Worker a removal is a Workers KV write,
 * and every probe that finds the bot absent asks for one.
 */
export async function removePersistedGuild(guildId: string): Promise<void> {
	const storage = useStorage();
	await Promise.all(
		(await guildCacheKeys(guildId)).map(async (key) => {
			if (await storage.hasItem(key)) await storage.removeItem(key);
		}),
	);
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
const GUILD_PROBE_TTL_MS = 60_000;
/**
 * How long a live probe that found the bot absent answers for its guild. The
 * server list probes every guild of the user, and the bot is absent from most
 * of them: kept for a minute, those answers cost one Discord request per
 * guild on nearly every visit. The bot joins through the dashboard's invite,
 * whose `?refresh=true` drops the answer (`invalidateGuildCache()`). A bot
 * invited from Discord itself shows within this time, or on a refresh.
 */
export const ABSENT_GUILD_PROBE_TTL_MS = 10 * 60_000;

/** How long a live probe answers for its guild, by what it found. */
export function guildProbeTtl(confirmedAbsent: boolean): number {
	return confirmedAbsent ? ABSENT_GUILD_PROBE_TTL_MS : GUILD_PROBE_TTL_MS;
}
const GUILD_PROBE_SWEEP_SIZE = 1000;
const recentGuildProbes = new Map<string, { expires: number; probe: Promise<GuildProbe> }>();
/**
 * The live answers an isolate of the Worker has, kept as values: a request
 * there may not wait on a promise another request started, but it may read
 * what that request found. They are kept for less time than the shared copy,
 * since `invalidateGuildCache()` reaches only the isolate it runs in: after
 * the bot is invited, the other isolates of the same location learn of it
 * within this time. In another location Workers KV may still serve the copy
 * from before the invite, until it is {@linkcode GUILD_PROBE_TTL_MS} old.
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
	// Kept as long as the longest answer, so no shared answer from before it is read back.
	guildProbeInvalidations.set(guildId, { at: now, expires: now + ABSENT_GUILD_PROBE_TTL_MS });
}

/** Whether a probe made at `at` predates this isolate's last invalidation of its guild. */
export function isGuildProbeInvalidated(guildId: string, at: number): boolean {
	const invalidation = guildProbeInvalidations.get(guildId);
	return invalidation !== undefined && invalidation.expires > Date.now() && at < invalidation.at;
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
			// A probe that started before an invalidation may answer after it, with
			// what the guild was before the bot was invited: it is not kept.
			if (probe.live && !isGuildProbeInvalidated(guildId, probe.at ?? now)) {
				sweep(settledGuildProbes, now);
				const expires = Math.min(
					(probe.at ?? now) + guildProbeTtl(probe.confirmedAbsent),
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
		if (!result.live) {
			forget();
			return;
		}
		const entry = recentGuildProbes.get(guildId);
		if (result.confirmedAbsent && entry?.probe === probe) {
			entry.expires = now + ABSENT_GUILD_PROBE_TTL_MS;
		}
	}, forget);
	return probe;
}

export function shouldRefreshCurrentUserCache(event: H3Event): boolean {
	return getQuery(event).refresh === "true";
}

export function shouldRefreshGuildCache(event: H3Event): boolean {
	return getQuery(event).refresh === "true";
}
