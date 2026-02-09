import { defineConfig } from "taze";

export default defineConfig({
	write: true,
	// run `npm install` or `yarn install` right after bumping
	install: true,
	update: true,
	recursive: true,
	includeLocked: true,
	interactive: true,
	packageMode: {
		"@prisma/client": "ignore",
		"@prisma/adapter-pg": "ignore",
		"prisma-json-types-generator": "ignore",
		prisma: "ignore",
		// regex starts and ends with '/'
		"/vue/": "latest",
		"/@vueuse/": "latest",
		"vue-tsc": "minor",
	},
	depFields: {
		overrides: false,
	},
});
