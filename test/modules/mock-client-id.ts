import { addImports, createResolver, defineNuxtModule } from "@nuxt/kit";

const { resolve } = createResolver(import.meta.url);

export default defineNuxtModule({
	meta: {
		name: "mock-client-id",
	},
	setup(_options, nuxt) {
		nuxt.hook("imports:extend", (imports) => {
			const idx = imports.findIndex((i) => i.name === "getClientId");
			if (idx !== -1) {
				imports.splice(idx, 1);
			}
		});

		addImports({
			from: resolve("../mocks/public"),
			name: "getClientId",
		});
	},
});
