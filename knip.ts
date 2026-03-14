import type { KnipConfig } from "knip";

const config: KnipConfig = {
	workspaces: {
		".": {
			entry: [
				"app/pages/**/*.vue!",
				"app/components/**/*.vue!",
				"app/composables/**/*.ts!",
				"app/plugins/**/*.ts!",
				"app/utils/**/*.ts!",
				"app/themes/**/*.ts!",
				"server/**/*.ts!",
				"modules/**/*.ts!",
				"config/**/*.ts!",
				"shared/**/*.ts!",
				"service-worker/sw.ts",
				"pwa-assets.config.ts",
				"taze.config.ts",
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

				/** Framework-provided: re-exported or bundled by Nuxt/Nitro/Vite */
				"vue",
				"vue-router",
				"h3",
				"nitropack/*",
				"ofetch",
				"@unhead/vue",
				"ufo",
				"ohash/*",
				"unstorage",
				"vite",

				/**Used in nuxt.config.ts */
				"@netlify/nuxt",

				/** Transitive deps used directly but provided by parent packages */
				"deepmerge",
				"@discordjs/rest",
				"@sapphire/async-queue",
				"@codspeed/core",
				"nuxt-og-image",
				"workbox-*",

				/** Oxlint plugins don't get picked up yet */
				"@e18e/eslint-plugin",
				"eslint-plugin-regexp",
				"eslint",

				/** Used in the app but not imported directly */
				"@nuxt/icon",
				"nuxt-security",
				"@prisma/client",

				/** Test utilities (devDependencies flagged in --production mode) */
				"@vitest/browser-playwright",
				"@vue/test-utils",

				/** Used for git hooks, not imported directly */
				"nano-staged",

				/** Used in nuxt.config.ts for postcss */
				"postcss-nested",
			],
			ignoreUnresolved: ["#build/auth.config", "#server/database/generated/client"],
		},
	},
};

export default config;
