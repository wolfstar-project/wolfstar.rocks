/**
 * When `_payload.json` returns an ISR/empty fallback, async data with defaults
 * may skip refetch during hydration. Refresh after suspense resolves so pages
 * re-fetch once the client is interactive.
 */
export default defineNuxtPlugin({
	name: "payload-cache-refresh",
	setup(nuxtApp) {
		nuxtApp.payload.data ||= {};

		if (
			nuxtApp.isHydrating &&
			nuxtApp.payload.serverRendered &&
			!Object.keys(nuxtApp.payload.data).length
		) {
			nuxtApp.hooks.hookOnce("app:suspense:resolve", () => {
				refreshNuxtData();
			});
		}
	},
});
