import { defineNuxtModule } from "nuxt/kit";

// nuxt-og-image v6 bundles its module code into a shared chunk (dist/shared/),
// causing #og-image to resolve to dist/shared/runtime/ instead of dist/runtime/.
// The module's internal fixSharedPath misses paths without a trailing slash.
export default defineNuxtModule({
	meta: {
		name: "og-image-alias-fix",
	},
	setup(_, nuxt) {
		nuxt.hook("modules:done", () => {
			for (const [key, value] of Object.entries(nuxt.options.alias)) {
				if (
					key.startsWith("#og-image") &&
					typeof value === "string" &&
					value.includes("/shared/runtime")
				) {
					nuxt.options.alias[key] = value.replace("/shared/runtime", "/runtime");
				}
			}
		});
	},
});
