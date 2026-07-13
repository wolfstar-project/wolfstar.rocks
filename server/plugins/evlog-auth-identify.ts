import type { RequestLogger } from "evlog";
import type { BetterAuthInstance } from "evlog/better-auth";
import type { H3Event } from "h3";
import { createAuthIdentifier } from "evlog/better-auth";

/**
 * Auto-identifies the request actor from the Better Auth session on every
 * request (skipping /api/auth/** by default) so audit enrichers can resolve
 * the actor without each handler calling log.set({ user: ... }) manually.
 *
 * evlog's BetterAuthInstance is a minimal structural interface (just
 * api.getSession); Better Auth's real Auth<...> type is a much richer
 * generic that satisfies it at runtime but doesn't structurally match 1:1.
 */
export default defineNitroPlugin((nitroApp) => {
	const auth = serverAuth() as unknown as BetterAuthInstance;
	const identify = createAuthIdentifier(auth);
	nitroApp.hooks.hook("request", (event: H3Event) =>
		identify({
			path: event.path,
			headers: event.headers,
			// evlog's own `log` augmentation on H3EventContext isn't visible here
			context: event.context as unknown as { log?: RequestLogger },
		}),
	);
});
