export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook("request", (event) => {
		// Auth is client-only against the bot Better Auth server — Nuxt has no
		// local session to resolve during SSR.
		event.context.$authorization = {
			resolveServerTokens: async () => null,
			resolveServerUser: async () => null,
		};
	});
});
