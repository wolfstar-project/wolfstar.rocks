import type { H3Event } from "h3";
import { canWaitOnOtherRequests } from "#server/utils/keyed-lock";
import { runtimeConfig } from "#server/utils/runtimeConfig";
import { API } from "@discordjs/core/http-only";
import { REST } from "@discordjs/rest";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { isNullishOrEmpty } from "@sapphire/utilities/isNullOrUndefinedOrEmpty";
import { createError, getRouterParam } from "h3";
import { useEvent } from "nitropack/runtime";

export function useApi(rest?: REST) {
	rest ??= useRest();
	return new API(rest);
}

declare module "h3" {
	interface H3EventContext {
		/** The request's Discord REST client, on Cloudflare Workers. */
		discordRest?: REST;
	}
}

// One client per process: Discord's rate limits (per route and the global
// one) are tracked inside a client, so a client per call would learn each
// limit only by running into a 429 and waiting it out.
let sharedRest: REST | undefined;

function useRest() {
	const token = runtimeConfig.discord.botToken;
	if (!token) {
		throw new Error("'NUXT_OAUTH_DISCORD_BOT_TOKEN' env is not defined");
	}
	if (canWaitOnOtherRequests()) {
		sharedRest ??= new REST().setToken(token);
		return sharedRest;
	}

	// The client queues the calls to a route behind one another, which a
	// request on Cloudflare Workers cannot wait on when another request made
	// them (see `canWaitOnOtherRequests()`): there each request gets its own,
	// without the timers that sweep its buckets.
	const event = useEvent();
	event.context.discordRest ??= new REST({
		handlerSweepInterval: 0,
		hashSweepInterval: 0,
	}).setToken(token);
	return event.context.discordRest;
}

export function getGuildParam(event: H3Event) {
	const guildId = getRouterParam(event, "guild");
	if (isNullOrUndefined(guildId)) {
		throw createError({
			data: {
				error: "guild_id_required",
				field: "guildId",
				message: "Guild ID is required",
			},
			message: "No guild id provided",
			status: 400,
		});
	}
	return guildId;
}

export function omit<T, K extends keyof T>(keys: K[], obj: T): Omit<T, K> {
	if (!keys.length) {
		return obj;
	}
	const key = keys.pop()!;
	const { [key]: omitted, ...rest } = obj;
	return omit(keys, rest as T) as Omit<T, K>;
}

export function maybeParseNumber(value: string | bigint | null | undefined): number | null {
	if (isNullishOrEmpty(value)) {
		return null;
	}
	return Number(value);
}

export function maybeParseDate(value: string | null | undefined): number | null {
	if (isNullishOrEmpty(value)) {
		return null;
	}
	return Date.parse(value);
}
