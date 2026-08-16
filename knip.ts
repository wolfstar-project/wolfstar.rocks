import type { KnipConfig } from "knip";

const config: KnipConfig = {
	treatConfigHintsAsErrors: true,
	workspaces: {
		".": {
			entry: [
				"service-worker/sw.ts",
				"taze.config.ts",
				"modules/**/*.ts",
				".lighthouserc.cjs",
				"lighthouse-setup.cjs",
				"scripts/**/*.ts",
				/** i18n / Lunaria entrypoints (not statically imported by the app).
				 * lunaria/lunaria.ts is already discovered via vite.config.ts build:lunaria.
				 * lunaria.config.ts is also read externally by the lunariajs/action GitHub Action. */
				"i18n/**/*.ts",
				"lunaria.config.ts",
				/** Loaded by @nuxt/content at build time, not imported directly */
				"content.config.ts",
				/** MDC components rendered from Markdown (e.g. ::card, ::note), so usage isn't statically visible */
				"app/components/content/**/*.vue",
				/** Loaded by @onmax/nuxt-better-auth via #auth/server and #auth/client virtual aliases */
				"app/auth.config.ts",
				"server/auth.config.ts",
				/** Ambient H3EventContext augmentation, never imported directly */
				"shared/types/auth.d.ts",
				/** Aliased in vite.config.ts for #server/database/generated/client in tests, not imported directly */
				"test/__stubs__/prisma-generated-client.ts",
			],
			project: [
				/** css/mdx/prisma are handled by registered compilers, so include them here */
				"**/*.{ts,vue,cjs,mjs,css,mdx,prisma}",
				"!test/fixtures/**",
				"!test/test-utils/**",
				"!test/e2e/helpers/**",
				"!.agents/**",
				"!.agent/**",
				"!.claude/**",
			],
			msw: {
				entry: [".storybook/.public/mockServiceWorker.js"],
			},
			ignoreDependencies: [
				"@iconify-json/*",
				"@commitlint/cli",
				"puppeteer",
				"vue-tsc",
				"cz-conventional-changelog",
				"tailwind-variants",

				/** Framework-provided: re-exported or bundled by Nuxt/Nitro/Vite */
				"ufo",
				"ohash/*",
				"scule",

				/** Transitive deps used directly but provided by parent packages */
				"deepmerge",
				"@discordjs/rest",
				"@sapphire/async-queue",
				"@codspeed/core",
				"nuxt-site-config",
				"workbox-*",
				"rolldown",
				"vue-i18n" /* Provided by @nuxtjs/i18n; imported directly in test/unit/i18n/empty-placeholders.test.ts */,

				/** Peer-style dep resolved by @nuxtjs/i18n at prepare time (not imported directly) */
				"@intlify/shared",

				/** Provides the tsgolint binary for oxlint's opt-in type-aware pass (`vp lint --type-aware`), not imported directly */
				"oxlint-tsgolint",

				/** Used in the app but not imported directly */
				"@nuxt/icon",
				"nuxt-security",

				/** Used in the app in guild/logs components */
				"@tanstack/table-core",

				/** Used in the test */
				"axe-core",

				/** Used for cli */
				"@shelve/cli",
			],
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
