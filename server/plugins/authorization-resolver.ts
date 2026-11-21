import { refreshSessionTokens } from "#server/utils/oauth-tokens";

export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook("request", async (event) => {
		event.context.$authorization = {
			resolveServerTokens: async () => {
				return refreshSessionTokens(event);
			},
			resolveServerUser: async () => {
				// `getRequestSession` memoizes on `event.context` for the lifetime of
				// the request; `getUserSession` re-runs `auth.api.getSession()` on
				// every call, and several handlers resolve the user per request.
				const session = await getRequestSession(event);
				return session?.user ?? null;
			},
		};
	});
});
