import { useLogger } from "evlog";

/**
 * Automatically propagates the nuxt-auth-utils session user into the evlog
 * wide event context on every request so that audit enrichers can resolve the
 * actor without each handler needing to call log.set({ user: ... }) manually.
 *
 * This is the nuxt-auth-utils equivalent of the Better Auth createAuthMiddleware
 * integration: actor.id is available in the audit trail for all session-bearing
 * requests automatically.
 */
export default defineEventHandler(async (event) => {
	const session = await getUserSession(event).catch(() => null);
	if (session?.user?.id) {
		useLogger(event).set({
			user: {
				id: session.user.id,
				username: session.user.username ?? undefined,
			},
		});
	}
});
