import { useLogger } from "evlog";

/**
 * Automatically propagates the Better Auth session user into the evlog wide
 * event context on every request so that audit enrichers can resolve the
 * actor without each handler needing to call log.set({ user: ... }) manually.
 */
export default defineEventHandler(async (event) => {
	const session = await getUserSession(event).catch(() => null);
	if (session?.user?.id) {
		useLogger(event).set({
			user: {
				id: session.user.id,
				username: session.user.name ?? undefined,
			},
		});
	}
});
