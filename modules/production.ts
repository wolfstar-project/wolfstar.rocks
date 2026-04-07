import { defu } from "defu";
import { defineNuxtModule } from "nuxt/kit";
import { isCI, provider } from "std-env";

export default defineNuxtModule({
	meta: {
		name: "prod-env",
	},
	setup(_options, nuxt) {
		const shouldEnableHydrationDebug = process.env.NUXT_DEBUG_HYDRATION === "true";

		if (isCI && provider !== "github_actions") {
			if (shouldEnableHydrationDebug) {
				nuxt.options.debug = defu(nuxt.options.debug, { hydration: true });
			}

			nuxt.options.sourcemap = defu({ server: true }, nuxt.options.sourcemap);
		}
	},
});
