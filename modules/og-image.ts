import { defineNuxtModule } from "nuxt/kit";

export default defineNuxtModule({
	meta: {
		name: "og-image-tweaks",
	},
	setup(_, nuxt) {
		nuxt.hook("components:extend", (components) => {
			for (const component of [...components].toReversed()) {
				if (component.filePath.includes("og-image")) {
					components.splice(components.indexOf(component), 1);
				}
			}
		});
	},
});
