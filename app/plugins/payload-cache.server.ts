// oxlint-disable no-console -- dev-only payload-cache diagnostics
import { stringify } from "devalue";

/**
 * Serializes the Nuxt payload after SSR and stashes it on the request event.
 *
 * The Nitro `payload-cache` plugin picks this up in `render:response` so a
 * later `/_payload.json` request for the same route can be served from cache
 * without a second full Vue SSR render (same approach as npmx.dev).
 */
export default defineNuxtPlugin({
	name: "payload-cache",
	setup(nuxtApp) {
		if (import.meta.client) return;

		nuxtApp.hooks.hook("app:rendered", () => {
			const ssrContext = nuxtApp.ssrContext;
			if (!ssrContext) return;

			if (ssrContext.noSSR || ssrContext.error || ssrContext.payload?.error) return;

			const payloadData = ssrContext.payload?.data;
			if (!payloadData || Object.keys(payloadData).length === 0) return;

			try {
				const payload = {
					data: ssrContext.payload.data,
					prerenderedAt: ssrContext.payload.prerenderedAt,
				};
				const reducers =
					(
						ssrContext as typeof ssrContext & {
							"~payloadReducers"?: Record<string, (value: unknown) => unknown>;
						}
					)["~payloadReducers"] ?? {};
				const body = stringify(payload, reducers);

				const event = ssrContext.event;
				if (event) {
					event.context._cachedPayloadResponse = {
						body,
						headers: {
							"content-type": "application/json;charset=utf-8",
							"x-powered-by": "Nuxt",
						},
						statusCode: 200,
					};
				}
			} catch (error) {
				if (import.meta.dev) {
					console.warn("[payload-cache] Failed to serialize payload:", error);
				}
			}
		});
	},
});
