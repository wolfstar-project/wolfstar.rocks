export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook("request", async (event) => {
		event.context.$authorization = {
			resolveServerTokens: async () => {
				const session = await getUserSession(event);
				return session.secure?.tokens ?? null;
			},
			resolveServerUser: async () => {
				const session = await getUserSession(event);
				return session.user ?? null;
			},
		};
	});
});
