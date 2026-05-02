import type { KnipConfig } from "knip";

const config: KnipConfig = {
	workspaces: {
		".": {
			entry: [
				"service-worker/sw.ts",
				"pwa-assets.config.ts",
				"taze.config.ts",
				"modules/**/*.ts",
				".lighthouserc.cjs",
				"lighthouse-setup.cjs",
				"scripts/**/*.ts",
			],
			project: [
				"**/*.{ts,vue,cjs,mjs}",
				"!test/fixtures/**",
				"!test/test-utils/**",
				"!test/e2e/helpers/**",
				"!.agents/**",
				"!.agent/**",
				"!.claude/**",
			],
			husky: false,
			ignoreDependencies: [
				"@iconify-json/*",
				"@commitlint/cli",
				"puppeteer",
				"vue-tsc",
				"cz-conventional-changelog",
				"tailwind-variants",

				/** Framework-provided: re-exported or bundled by Nuxt/Nitro/Vite */
				"vue",
				"vue-router",
				"h3",
				"nitropack/*",
				"ofetch",
				"@unhead/vue",
				"ufo",
				"ohash/*",

				/** Transitive deps used directly but provided by parent packages */
				"deepmerge",
				"@discordjs/rest",
				"@sapphire/async-queue",
				"@codspeed/core",
				"nuxt-og-image",
				"@takumi-rs/core",
				"@takumi-rs/wasm",
				"workbox-*",

				/** Oxlint plugins don't get picked up yet */
				"@e18e/eslint-plugin",
				"eslint-plugin-regexp",
				"eslint",

				/** Used in the app but not imported directly */
				"@nuxt/icon",
				"nuxt-security",
				"@netlify/nuxt",

				/** Used in the test */
				"axe-core",
				"jsdom",

				/** Test utilities (devDependencies flagged in --production mode) */
				"@vitest/browser-playwright",

				/** Used for cli */
				"@shelve/cli",

				/** Used in nuxt.config.ts for postcss */
				"postcss-nested",
			],
			ignoreUnresolved: ["#build/auth.config"],
			ignoreFiles: [
				"**/*.unused.*",
				"shared/utils/index.ts" /* Used for type exports only, not imported directly */,
			],
			ignoreMembers: [
				/** Enum members in app/utils/constants.ts used as color values at runtime */
				"Secondary",
				"Amber",
				"Amber300",
				"DeepOrange",
				"LightBlue",
				"Orange",
				"Red",
				"Red300",
				"Yellow",
				"Yellow300",
			],
		},
	},
};

export default config;
