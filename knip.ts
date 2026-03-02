import type { KnipConfig } from "knip";

const config: KnipConfig = {
	workspaces: {
		".": {
			entry: [
				"app/router.options.ts!",
				"app/app.vue!",
				"app/error.vue!",
				"app/pages/**/*.vue!",
				"app/components/**/*.vue!",
				"app/components/**/*.d.vue.ts!",
				"app/composables/**/*.ts!",
				"app/middleware/**/*.ts!",
				"app/plugins/**/*.ts!",
				"app/utils/**/*.ts!",
				"app/themes/**/*.ts!",
				"server/**/*.ts!",
				"modules/**/*.ts!",
				"config/**/*.ts!",
				"shared/**/*.ts!",
				"app/layouts/dashboard.vue",
				"app/layouts/default.vue",
				"app/app.config.ts",
				"service-worker/sw.ts",
				"pncat.config.ts",
				"pwa-assets.config.ts",
				"taze.config.ts",
				".lighthouserc.cjs",
				"lighthouse-setup.cjs",
				"scripts/**/*.ts",
				"**/*/generate-components.ts",
			],
			project: [
				"**/*.{ts,vue,cjs,mjs}",
				"!test/fixtures/**",
				"!test/test-utils/**",
				"!test/e2e/helpers/**",
			],
			ignoreDependencies: [
				"@iconify-json/*",
				"puppeteer",
				"vue-tsc",
				"cz-conventional-changelog",
				"bumpp",
				/** Needs to be explicitly installed, even though it is not imported, to avoid type errors. */
				"unplugin-vue-router",
				"vite-plugin-pwa",
				"@vueuse/shared",

				/** Some components import types from here, but installing it directly could lead to a version mismatch */
				"vue-router",

				/** Oxlint plugins don't get picked up yet */
				"eslint-plugin-regexp",
				"eslint-plugin-antfu",
				"@antfu/eslint-config",
				"eslint",

				/** These are used in the app, but not imported directly, so knip doesn't pick them up. */
				"@nuxt/icon",
				"nuxt-security",

				/** These are used in the in main css, but not imported directly, so knip doesn't pick them up. */
				"daisyui",
				"@tailwindcss/typography",
				"tw-animate-css",

				/** are used in nuxt.config.ts for postcss */
				"postcss-nested",

				/** These are used in schema prisma, but not imported directly, so knip doesn't pick them up. */
				"prisma-json-types-generator",
			],
			ignoreUnresolved: [
				"#components",
				"#build/auth.config",
				"#og-image/app/utils",
				"vite/client",
			],
		},
	},
};

export default config;
