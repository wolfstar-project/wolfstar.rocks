import { defineConfig } from "taze";

export default defineConfig({
	write: true,
	// Run `npm install` or `yarn install` right after bumping
	install: true,
	update: true,
	recursive: true,
	includeLocked: true,
	interactive: true,
	packageMode: {
		// Regex starts and ends with '/'
		"/vue/": "latest",
		"/@vueuse/": "latest",
		"vue-tsc": "minor",
	},
	depFields: {
		overrides: false,
	},
});
