import type { BetterAuthInstance } from "evlog/better-auth";
import { useLogger } from "evlog";
import { createAuthMiddleware } from "evlog/better-auth";

/**
 * Auto-identifies the request actor from the Better Auth session on every
 * request (skipping /api/auth/** by default) so audit enrichers can resolve
 * the actor without each handler calling log.set({ user: ... }) manually.
 *
 * Runs as server middleware rather than a Nitro `request` hook: evlog's own
 * plugin sets `event.context.log` from its own `request` hook, and Nitro
 * doesn't guarantee hook order between plugins, so `event.context.log` may
 * not exist yet if this identified from a second `request` hook. Server
 * middleware runs once the h3 app dispatches, after Nitro's request-hook
 * phase, so the logger is guaranteed to already be on the context.
 *
 * evlog's BetterAuthInstance is a minimal structural interface (just
 * api.getSession); Better Auth's real Auth<...> type is a much richer
 * generic that satisfies it at runtime but doesn't structurally match 1:1.
 *
 * `serverAuth(event)` is resolved per-request (not once at module scope):
 * it caches per resolved host, and calling it without an event falls back
 * to requiring an explicit `NUXT_PUBLIC_SITE_URL`, which breaks prerendering
 * of marketing pages that never carry a real request host.
 */
export default defineEventHandler(async (event) => {
	const auth = serverAuth(event) as unknown as BetterAuthInstance;
	const identify = createAuthMiddleware(auth, {
		exclude: ["/api/auth/**"],
	});
	await identify(useLogger(event), event.headers, event.path);
});
