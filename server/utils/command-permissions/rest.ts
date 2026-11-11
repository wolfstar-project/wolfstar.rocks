import { REST } from "@discordjs/rest";

/**
 * The routes whose rate limit a write answers instead of waiting out:
 * `@discordjs/rest` otherwise sleeps through every 429 with no cap, and the
 * request would hang past the platform's timeout with the admin unable to tell
 * whether the command was saved.
 */
const REJECTED_ON_RATE_LIMIT = ["/applications"];

/**
 * The client a command permissions write goes through. It carries no token of
 * its own: the write sends the user's token as its own `Authorization` header.
 */
export function commandPermissionsRest(): REST {
	// One client a write: its sweep timers would outlive it, as `useRest()`'s
	// per-request clients turn them off for.
	return new REST({
		handlerSweepInterval: 0,
		hashSweepInterval: 0,
		rejectOnRateLimit: REJECTED_ON_RATE_LIMIT,
	});
}
