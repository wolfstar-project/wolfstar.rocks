import { refreshSessionTokens } from "#server/utils/oauth-tokens";

export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook("request", async (event) => {
		event.context.$authorization = {
			resolveServerTokens: async () => {
				return refreshSessionTokens(event);
			},
			resolveServerUser: async () => {
				const session = await getUserSession(event);
				return session.user ?? null;
			},
		};
	});
});
