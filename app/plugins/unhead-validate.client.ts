import { ValidatePlugin } from "@unhead/vue/plugins";

/**
 * Unhead's dev validator, set up here because Nuxt injects its own with no way
 * to set its rules (`unhead.vite.validate` is a boolean; see `nuxt.config.ts`).
 * One rule is off: `deprecated-twitter-meta` calls every `twitter:*` tag
 * deprecated in favour of Open Graph, but X still reads `twitter:card` to pick
 * the large-image layout, and `useSeoMetadata()` sets it on purpose. It runs on
 * the client only: on the server the validator sees tags before the modules
 * that finish them (absolute image URLs, priorities) have run, and reports
 * what the page does not have.
 */
export default defineNuxtPlugin({
	enforce: "pre",
	name: "wolfstar:unhead-validate",
	setup() {
		if (!import.meta.dev || import.meta.test) return;

		injectHead()?.use(ValidatePlugin({ rules: { "deprecated-twitter-meta": "off" } }));
	},
});
