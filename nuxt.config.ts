import netlifyNuxt from "@netlify/nuxt";
import { auditRedactPreset } from "evlog";
import { createResolver } from "nuxt/kit";
import { isCI, isTest, provider } from "std-env";
import {
	ALPHA_WORKER,
	applyAlphaWorkerEnv,
	CLOUDFLARE_BINDINGS,
	isCloudflareBuild,
} from "./config/cloudflare.ts";
import { currentLocales, datetimeFormats, numberFormats } from "./config/i18n.ts";
import { pwa } from "./config/pwa.ts";
import { LOCALE_BUNDLES_DIR } from "./modules/i18n-locale-bundles.ts";
import { generateRuntimeConfig } from "./server/utils/runtimeConfig.ts";

applyAlphaWorkerEnv();

const runtimeConfig = generateRuntimeConfig();
const isStorybook = process.env.STORYBOOK === "true" || process.env.VITEST_STORYBOOK === "true";

const { resolve } = createResolver(import.meta.url);

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	// The dev validator of unhead is registered by `app/plugins/unhead-validate.client.ts`,
	// which sets the rules Nuxt's own injection cannot.
	unhead: { vite: { validate: false } },

	// Modules configuration
	modules: [
		"@nuxt/ui",
		"@nuxt/content",
		// Nuxt Studio works in development and production (Git publish needs prod).
		// Skip it in Vitest/Storybook: its Vite plugins break the rolldown-based
		// test environment. Studio editor chunks are also excluded from the PWA
		// precache in config/pwa.ts so multi-MB bundles don't fail the build.
		...(isTest || isStorybook || isCloudflareBuild ? [] : ["nuxt-studio"]),
		"@nuxt/image",
		"@nuxt/hints",
		"@nuxt/fonts",
		"@nuxt/a11y",
		"@nuxtjs/seo",
		"nuxt-skew-protection",
		"@vueuse/nuxt",
		"@vite-pwa/nuxt",
		"@nuxtjs/html-validator",
		"nuxt-i18n-micro",
		"@sentry/nuxt/module",
		"evlog/nuxt",
		"@nuxtjs/better-auth",
		"nuxt-vitalizer",
		"stale-dep/nuxt",
		"@nuxt/test-utils/module",
		[
			"vite-doctor/nuxt",
			{
				extends: "auto",
			},
		],
		...(isTest || isCI || isStorybook || isCloudflareBuild ? [] : [netlifyNuxt]),
	],

	// @nuxtjs/better-auth. Redirect targets are centralised here so route rules,
	// page meta, `useSignIn('social')` and `signOut()` all agree on where users
	// land, instead of each call site hardcoding its own path.
	auth: {
		redirects: {
			// Aliased to /oauth/login, which immediately hands off to Discord.
			login: "/login",
			// Signed-in users who open a guest-only route (the login hand-off).
			guest: "/app",
			// Fallback landing page after a completed sign-in, used when no safe
			// `?next=` is present and no explicit onSuccess/callbackURL is given.
			authenticated: "/app",
			logout: "/",
		},
		preserveRedirect: true,
		// The app has used `next` since before the module owned redirects; keeping
		// the module on the same key means a module-issued redirect to /login is
		// readable by the login page instead of being silently dropped.
		redirectQueryKey: "next",
	},

	content: {
		// A Worker has no SQLite file, so there the content is loaded into D1.
		...(isCloudflareBuild
			? {
					database: {
						bindingName: CLOUDFLARE_BINDINGS.contentDatabase,
						type: "d1" as const,
					},
				}
			: {}),
		// Use Node.js built-in sqlite (available in Node v22.5+) to avoid
		// requiring better-sqlite3 as an additional native dependency.
		experimental: {
			sqliteConnector: "native",
		},
	},

	studio: {
		repository: {
			provider: "github",
			owner: "wolfstar-project",
			repo: "wolfstar.rocks",
			branch: "main",
		},
	},

	$development: {
		site: {
			name: "WolfStar (Dev)",
			url: "http://localhost:3000",
		},
	},

	$test: {
		debug: {
			hydration: true,
		},
	},

	$production: {
		image: {
			// On the alpha Worker, through the zone's image transformations, which
			// accept the zone's own images and the origins Netlify allows.
			provider: isCloudflareBuild ? "cloudflare" : "netlify",
		},
		modules: ["nuxt-security"],
		sentry: {
			telemetry: false,
		},
		evlog: {
			sampling: {
				rates: {
					info: 10,
					debug: 0,
					error: 100,
				},
				keep: [{ status: 400 }, { duration: 1000 }],
			},
		},
	},

	devtools: {
		enabled: true,
	},

	app: {
		head: {
			charset: "utf-8",
			htmlAttrs: { lang: "en-US" },
			link: [
				// Preconnect covers the DNS lookup too, so no dns-prefetch beside it.
				{ href: "https://cdn.discordapp.com", rel: "preconnect", crossorigin: "anonymous" },
				{ href: "https://cdn.wolfstar.rocks", rel: "preconnect", crossorigin: "anonymous" },
			],
			meta: [
				// Page transitions
				{
					"content": "RevealTrans(Duration=2.0,Transition=2)",
					"http-equiv": "Page-Enter",
				},
				{
					"content": "RevealTrans(Duration=3.0,Transition=12)",
					"http-equiv": "Page-Exit",
				},

				// Mobile specific (only keep if not in seo.meta)
				{ content: "True", name: "HandheldFriendly" },

				// Microsoft specific (only keep if not in seo.meta)
				{ content: "WolfStar", name: "application-name" },
				{
					content: "/mstile-144x144.png",
					name: "msapplication-TileImage",
				},

				// Distribution and audience (only keep if not in seo.meta)
				{ content: "all", name: "target" },
				{ content: "all", name: "audience" },
				{ content: "Worldwide", name: "coverage" },
				{ content: "Global", name: "distribution" },
				{ content: "safe for kids", name: "rating" },
			],
			templateParams: {
				separator: "·",
				siteName: "WolfStar",
			},
			titleTemplate: "%s %separator %siteName",
			viewport: "width=device-width, initial-scale=1",
		},
	},

	css: ["~/assets/css/main.css"],

	site: {
		defaultLocale: "en-US",
		description:
			"WolfStar gives Discord moderation teams configurable AutoMod, searchable moderation and command history, and one dashboard for server settings.",
		indexable: true,
		name: "WolfStar",
	},

	colorMode: {
		preference: "system", // Default theme
		dataValue: "theme", // Activate data-theme in <html> tag
		classSuffix: "",
		fallback: "light",
		storageKey: "wolfstar-theme",
	},

	evlog: {
		env: {
			service: "wolfstar-dashboard",
		},
		include: ["/api/**"],
		exclude: ["/api/_nuxt_icon/**"],
		redact: {
			paths: [
				...(auditRedactPreset.paths ?? []),
				"user.email",
				"user.password",
				"user.accessToken",
				"user.refreshToken",
				"discord.botToken",
				"headers.authorization",
				"headers.cookie",
				"headers.set-cookie",
				"headers.x-api-key",
				"headers.x-auth-token",
				"headers.proxy-authorization",
			],
		},
	},

	ui: {
		experimental: {
			componentDetection: true,
		},
	},

	htmlValidator: {
		enabled: !isCI || ((provider !== "netlify" && provider !== "cloudflare_workers") && !!process.env.VALIDATE_HTML),
		options: {
			rules: {
				"meta-refresh": "off",
				// Nuxt UI theme class merging produces duplicate utility classes
				"no-dup-class": "off",
				// NuxtUI components may render empty id attributes internally
				"attribute-allowed-values": "off",
				// NuxtUI UHeader hamburger button is icon-only
				"text-content": "off",
				// Reka UI/NuxtUI components use ARIA roles that have native equivalents
				"prefer-native-element": "off",
			},
		},
		failOnError: true,
	},

	// Runtime configuration
	runtimeConfig,

	routeRules: {
		// API routes — only cache public, non-authenticated proxy routes.
		// Broad ISR on /api/** is intentionally omitted: authenticated routes
		// (e.g. /api/users, /api/guilds/:id/settings) must never be cached
		// Globally, as that would serve one user's data to another.
		"/sitemap.xml": { prerender: true },
		"/": { appLayout: "default", prerender: true, robots: true },
		"/_og/d/**": getISRConfig(60 * 60 * 24), // 1 day
		"/api/auth/**": { isr: false, cache: false },
		"/api/users": {
			headers: {
				"Cache-Control": "private, max-age=30, stale-while-revalidate=300",
				"Vary": "Cookie, Authorization",
			},
		},

		"/oauth/**": {
			robots: "nosnippet,notranslate,noimageindex,noarchive,max-snippet:-1,max-image-preview:none,max-video-preview:-1",
			security: {
				headers: {
					contentSecurityPolicy: false,
					referrerPolicy: "strict-origin-when-cross-origin",
					xContentTypeOptions: "nosniff",
					xFrameOptions: "DENY",
				},
			},
		},
		"/oauth/callback": {
			// Discord returns through this route before the server middleware forwards
			// the OAuth response to Better Auth. A prerendered copy bypasses that
			// middleware and leaves the browser on the callback status page.
			prerender: false,
			robots: "nosnippet,notranslate,noimageindex,noarchive,max-snippet:-1,max-image-preview:none,max-video-preview:-1",
		},
		// Redirect-only OAuth entry point: its middleware immediately redirects to
		// Discord, so prerendering only produces an empty redirect stub that fails
		// html-validation (no <title>/<body>, missing lang). Never prerender it.
		"/oauth/login": {
			prerender: false,
			robots: true,
			auth: { only: "guest", redirectTo: "/app" },
		},
		// `/login` is an alias of `/oauth/login`, but route rules match on the
		// requested path, so the guest rule has to be repeated here or signed-in
		// users hitting /login get bounced back to Discord.
		"/login": {
			prerender: false,
			auth: { only: "guest", redirectTo: "/app" },
		},
		// The dashboard is one client-rendered page; the guild it shows is app
		// state, so nothing about it is prerenderable or worth indexing.
		"/app": {
			auth: { only: "user", redirectTo: "/login" },
			prerender: false,
			robots: false,
			ssr: false,
		},
		// Legacy entry points that forward into `/app`: sign-in gated, never indexed.
		"/guilds/**": { auth: { only: "user", redirectTo: "/login" }, robots: false },
		"/privacy": { appLayout: "default", prerender: true, robots: true },
		// Deprecated: the page moved into `/app` (server list) and the preferences
		// dialog (theme/locale/motion). Kept as permanent redirects for old links.
		"/profile": { redirect: { to: "/app", statusCode: 301 }, prerender: false, robots: false },
		"/account": { redirect: { to: "/app", statusCode: 301 }, prerender: false, robots: false },
		"/starly": { appLayout: "default", robots: true },

		// Static pages
		// The alpha bot's commands change with each image it runs, so the alpha
		// Worker renders the page and keeps it an hour instead of freezing it at
		// build time.
		"/commands": isCloudflareBuild
			? { appLayout: "default", robots: true, swr: 60 * 60 }
			: { appLayout: "default", prerender: true, robots: true },
		"/staryl": { appLayout: "default", prerender: true, robots: true },
		"/terms": { appLayout: "default", prerender: true, robots: true },
		"/wolfstar": { appLayout: "default", prerender: true, robots: true },
		"/blog": { appLayout: "default", prerender: true, robots: true },
		"/blog/**": { appLayout: "default", prerender: true, robots: true },
		"/translation-status": { appLayout: "default", prerender: true, robots: true },
		// lunaria status.json — always revalidate so the app sees fresh progress
		"/lunaria/status.json": {
			headers: {
				"Cache-Control": "public, max-age=0, must-revalidate",
			},
		},
		"/changelog": { appLayout: "default", prerender: true, robots: true },
		"/changelog/**": { appLayout: "default", prerender: true, robots: true },
		// Nuxt Studio admin UI + auth callbacks — SSR-only, never index or prerender.
		"/_studio": { prerender: false, robots: false },
		"/_studio/**": { prerender: false, robots: false },
		"/__nuxt_studio/**": { prerender: false, robots: false },
	},

	sourcemap: {
		client: "hidden",
		// Rollup collapsing the server maps is the other half of the bundling time
		// on Workers Builds, and nothing uploads them for the Worker.
		server: !isCloudflareBuild,
	},

	features: {
		inlineStyles: true,
	},

	// Nuxt 5 defaults (typedPages, routeTypedFetch, payloadExtraction: "client",
	// inlineErrorRendering, case-sensitive routing, …) come from
	// `compatibilityVersion: 5`; only flags it does not set, or that this
	// project must override, belong in `experimental` below.
	future: {
		compatibilityVersion: 5,
	},

	experimental: {
		clientNodeCompat: true,
		typescriptPlugin: true,
		viteEnvironmentApi: !isStorybook,
		checkOutdatedBuildInterval: 5 * 60 * 1000, // 5 minutes
		// v5 drops Nitro auto-imports; everything under server/ still relies on
		// them (defineEventHandler, createError, useRuntimeConfig, own utils, …).
		nitroAutoImports: true,
		// Unknown paths 404 before the Vue app, plugins and middleware are created;
		// with inlineErrorRendering the branded error.vue still renders the page.
		early404: true,
		// Reject $fetch/useFetch calls to paths no server route answers.
		strictRouteTypes: true,
	},

	compatibilityDate: "2025-09-20",

	nitro: {
		...(isCloudflareBuild
			? {
					cloudflare: { deployConfig: true, nodeCompat: true, wrangler: ALPHA_WORKER },
					// A Worker refuses I/O across requests, so the database client is made
					// per request and found through `useEvent()` (server/database/prisma.ts).
					experimental: { asyncContext: true },
					// Sentry's SDK for Workers, in place of the Node one that
					// `sentry.server.config.ts` sets up.
					plugins: [resolve("./server/cloudflare/sentry.ts")],
				}
			: {}),
		future: {
			nativeSWR: true,
		},
		// The bot API only allows the production origin, so a browser on
		// localhost cannot call it directly. In development `$api` goes through
		// this same-origin path instead (see `app/plugins/api.ts`).
		devProxy: {
			"/__bot-api": {
				target: process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost:8282",
				changeOrigin: true,
			},
		},
		esbuild: {
			options: {
				target: "es2024",
			},
		},
		prerender: {
			crawlLinks: true,
		},
		publicAssets: [
			{
				dir: resolve("./public/avatars"),
				maxAge: 24 * 60 * 60 * 30, // 30 days
				baseURL: "/avatars",
			},
		],
		rollupConfig: {
			external: process.env.NITRO_PRESET !== "node-server" ? ["pg-native"] : undefined,
		},
		storage: {
			"fetch-cache": {
				base: "./.cache/fetch",
				driver: "fsLite",
			},
			"wolfstar:ratelimiter": {
				base: "./.cache/ratelimiter",
				driver: "fsLite",
			},
			"wolfstar:auth-ratelimiter": {
				base: "./.cache/auth-ratelimiter",
				driver: "fsLite",
			},
		},
		// build:test must set TEST=1: nuxi build forces NODE_ENV=production before
		// config load, so NODE_ENV=test alone never makes std-env isTest (or this
		// replace) true in Playwright bundles. Prefer isTest so VITEST-only
		// runners (CI `vp test`) still get a true replace without waiting on NODE_ENV.
		replace: {
			"import.meta.test": isTest,
		},
	},

	vite: {
		// Do NOT define import.meta.test here: Nuxt's schema already defines it
		// from nuxt.options.test (Boolean(std-env isTest) by default, and forced
		// true by @nuxt/test-utils in the Vitest environment). A user-level define
		// overrides that and, in CI, bakes in "false" because this config is
		// evaluated before Vitest sets NODE_ENV=test — breaking mountSuspended's
		// import.meta.test-gated SingleRenderer branch in nuxt-root.vue.
		css: {
			transformer: "lightningcss",
		},
		optimizeDeps: {
			include: [
				"@discordjs/core/http-only",
				"@discordjs/rest",
				"@sapphire/async-queue",
				"@sapphire/bitfield",
				"@sapphire/snowflake",
				"@sapphire/time-utilities",
				"@sapphire/utilities",
				"@sapphire/utilities/cast",
				"@sapphire/utilities/isNullish",
				"@sapphire/utilities/objectValues",
				"@sapphire/utilities/objectKeys",
				"@sapphire/utilities/objectToTuples",
				"@sentry/nuxt",
				"@sentry/vue",
				"@tiptap/core",
				"@tiptap/extension-drag-handle-vue-3",
				"@tiptap/extension-horizontal-rule",
				"@tiptap/extension-image",
				"@tiptap/extension-mention",
				"@tiptap/extension-placeholder",
				"@tiptap/markdown",
				"@tiptap/pm/state",
				"@tiptap/starter-kit",
				"@tiptap/suggestion",
				"@tiptap/vue-3",
				"@tiptap/vue-3/menus",
				"@vue/devtools-core",
				"@vue/devtools-kit",
				"@vueuse/integrations/useFuse",
				"@vueuse/shared",
				"deepmerge",
				"discord-api-types/v10",
				"motion-v",
				"ohash/utils",
				"reka-ui",
				"reka-ui/namespaced",
				"std-env",
				"tailwind-variants",
				"tailwindcss/colors",
				"ufo",
				"vaul-vue",
				"valibot",
			],
		},
		ssr: {
			// Vite SSR prebundling yields a broken CJS interop stub of
			// discord-api-types (enum named exports become undefined). Keep it
			// external so Node loads the real package. The client optimizer keeps
			// prebundling discord-api-types/v10 (see include above); excluding it
			// there breaks browser-mode Vitest with raw CJS served to chromium.
			external: ["discord-api-types"],
		},
		experimental: {
			bundledDev: false,
		},
	},

	typescript: {
		tsConfig: {
			compilerOptions: {
				noUnusedLocals: true,
				allowImportingTsExtensions: true,
			},
			exclude: ["../service-worker"],
			include: ["../test/unit/app/**/*.ts"],
		},
		sharedTsConfig: {
			// Typed $fetch (routeTypedFetch) pulls server handlers into this
			// project, so it needs @nuxt/content's collection augmentations too.
			include: ["../test/unit/shared/**/*.ts", "./content/types.d.ts"],
		},
		nodeTsConfig: {
			compilerOptions: {
				allowImportingTsExtensions: true,
				paths: {
					"~~/*": ["../*"],
					"~/*": ["../app/*"],
					"#server/*": ["../server/*"],
					"#shared/*": ["../shared/*"],
				},
			},
			include: ["../test/e2e/**/*.ts"],
		},
	},

	fonts: {
		providers: {
			fontshare: false,
		},
		experimental: {
			disableLocalFallbacks: true,
		},
		families: [
			{
				display: "swap",
				global: true,
				name: "Geist",
				provider: "local",
				weights: [400, 500, 600, 700],
			},
			{
				display: "swap",
				global: true,
				name: "Geist Mono",
				provider: "local",
				weights: [400, 500, 600, 700],
			},
			{
				name: "Whitney",
				provider: "local",
				weights: [400, 500, 600, 700],
				display: "swap",
			},
			// Display name styles (`AppDisplayName`): the open-source typefaces
			// Discord's name fonts come from, one weight each as Discord ships
			// them. Self-hosted at build time and only fetched by a page that
			// draws a name in one of them.
			{ display: "swap", name: "Bangers", provider: "google", weights: [400] },
			{ display: "swap", name: "BioRhyme", provider: "google", weights: [400] },
			{ display: "swap", name: "Cherry Bomb One", provider: "google", weights: [400] },
			{ display: "swap", name: "Chicle", provider: "google", weights: [400] },
			{ display: "swap", name: "MuseoModerno", provider: "google", weights: [500] },
			{ display: "swap", name: "Pirata One", provider: "google", weights: [400] },
			{ display: "swap", name: "Pixelify Sans", provider: "google", weights: [400] },
			{ display: "swap", name: "Grenze Gotisch", provider: "google", weights: [400] },
			{ display: "swap", name: "Zilla Slab", provider: "google", weights: [600] },
			{ display: "swap", name: "Playpen Sans", provider: "google", weights: [700] },
			{ display: "swap", name: "Orbitron", provider: "google", weights: [700] },
			{ display: "swap", name: "New Rocker", provider: "google", weights: [400] },
			{ display: "swap", name: "Kalam", provider: "google", weights: [700] },
		],
	},

	icon: {
		clientBundle: {
			includeCustomCollections: true,
			// App Launcher fixtures pass icon names dynamically from .ts data
			// (app/utils/constants.ts), which the default scan globs
			// (vue/jsx/tsx/md/mdc/mdx/yml/yaml) miss — include .ts so those
			// icons stay in the client bundle instead of falling back to
			// runtime fetches.
			scan: {
				globInclude: ["**/*.{vue,jsx,tsx,md,mdc,mdx,yml,yaml,ts}"],
			},
		},
		customCollections: [
			{
				dir: resolve("./app/assets/icons"),
				prefix: "custom",
			},
			{
				dir: resolve("./app/assets/icons/discord"),
				prefix: "discord",
			},
		],
		provider: "iconify",
	},

	image: {
		domains: ["cdn.discordapp.com", "media.discordapp.net", "cdn.wolfstar.rocks"],
		format: ["webp", "jpeg", "jpg", "png", "svg"],
	},

	ogImage: {
		enabled: !isStorybook,
		security: {
			// The module's 15 s unless the build asks for more: on a machine with
			// little memory the prerender swaps, and each render waits on the
			// garbage collector far longer than it draws.
			renderTimeout: Number(process.env.OG_IMAGE_RENDER_TIMEOUT) || undefined,
			strict: !!process.env.NUXT_IMAGE_PROXY_SECRET,
			secret: process.env.NUXT_IMAGE_PROXY_SECRET,
			// HMAC signing is sufficient; origin pinning blocks localhost e2e runs
			// and adds no meaningful security on top of signed URLs.
			restrictRuntimeImagesToOrigin: false,
		},
	},

	skewProtection: {
		// Same Netlify Blobs backend as the cache/fetch-cache Nitro storage mounts
		// (see modules/cache.ts); falls back to the module's fs cache elsewhere.
		// The Workers build keeps it in a KV namespace of its own, the way the
		// module's Cloudflare guide sets it up.
		storage: isCloudflareBuild
			? { binding: CLOUDFLARE_BINDINGS.skewProtection, driver: "cloudflare-kv-binding" }
			: {
					base: "./.cache/skew-protection",
					// nuxt-skew-protection imports `unstorage/drivers/${driver}` verbatim,
					// so this must be the kebab-case file name (fs-lite.mjs), unlike the
					// Nitro storage mounts above where "fsLite" is a registered driver name.
					driver: "fs-lite",
				},
		updateStrategy: "polling",
		// Keep the persistent-previous-build-assets feature off: with storage now
		// always configured, the module's default (true) runs augmentBuildMetadata,
		// which rewrites _nuxt/builds/meta/<buildId>.json after the build but only
		// patches the Nitro server's embedded size/etag for latest.json. The node
		// preview server then serves the app manifest with stale content-length,
		// and clients fail with NUXT_E5004/NUXT_E5002 on client-side navigation.
		// A Worker serves those files from its asset binding as they are, so there
		// the assets of past deploys are kept, for clients still on them, by a
		// build in CI: the module uploads them through `wrangler`, 25 processes at
		// a time, which a machine with 4 GB of memory does not survive. It needs
		// an API token to do so, which Workers Builds may not hand to the build
		// command; without one the build goes on and keeps no past assets.
		bundleAssets: isCloudflareBuild && isCI && Boolean(process.env.CLOUDFLARE_API_TOKEN),
	},

	// PWA configuration
	pwa,

	security: {
		headers: {
			contentSecurityPolicy: {
				"base-uri": ["'self'"],
				"child-src": ["'self'", "blob:"],
				"connect-src": [
					"'self'",
					"wss:",
					"ws:",
					"https://ingesteer.services-prod.nsvcs.net", // Used by Netlify for telemetry (error, performance etc.)
					"https://cdn.wolfstar.rocks",
					"https://cdn.discordapp.com",
					"https://media.discordapp.net",
					"https://discord.com",
					"https://api.iconify.design",
					"https://ungh.cc", // Changelog page fetches GitHub releases from ungh.cc on client-side navigation
					"https://*.netlify.com",
					"https://*.netlify.app",
					"https://wolfstar.rocks", // Better Auth's client calls the configured site URL directly (e.g. /api/auth/get-session), not just relative paths
					"https://*.wolfstar.rocks",
					"https://*.ingest.us.sentry.io",
					"https://*.sentry.io",
				],
				"default-src": ["'self'"],
				"font-src": ["'self'", "data:"],
				"form-action": ["'none'"],
				"frame-ancestors": ["'none'"],
				"frame-src": ["https:"],
				"img-src": [
					"'self'",
					"https:",
					"http:",
					"data:",
					"blob:",
					"https://cdn.wolfstar.rocks",
					"https://cdn.discordapp.com",
					"https://media.discordapp.net",
				],
				"manifest-src": ["'self'"],
				"media-src": [
					"'self'",
					"https:",
					"http:",
					"https://cdn.wolfstar.rocks",
					"https://cdn.discordapp.com",
					"https://media.discordapp.net",
				],
				"object-src": ["'none'"],
				"script-src": [
					"'self'",
					"'unsafe-inline'",
					"'wasm-unsafe-eval'",
					"blob:",
					"https://beta.wolfstar.rocks",
					"https://wolfstar.rocks",
					// Allow Sentry's runtime assets when Replay is enabled via CDN
					"https://browser.sentry-cdn.com",
				],
				"script-src-attr": ["'self'", "'unsafe-inline'"],
				"style-src": [
					"'self'",
					"'unsafe-inline'",
					"https:",
					"https://cdn.wolfstar.rocks",
					"https://rsms.me/inter/inter.css",
				],
				"upgrade-insecure-requests": true,
				"worker-src": [
					"'self'",
					"blob:",
					"https://beta.wolfstar.rocks",
					"https://wolfstar.rocks",
				],
			},
			crossOriginEmbedderPolicy: false,
			permissionsPolicy: {
				fullscreen: "*",
			},
		},
		rateLimiter: false,
		sri: false,
		ssg: {
			hashScripts: false,
		},
	},

	sentry: {
		...runtimeConfig.sentry,
		// A Worker gets the Cloudflare SDK from `server/cloudflare/sentry.ts`, so
		// the Node one is not imported into its entry.
		autoInjectServerSentry: isCloudflareBuild ? undefined : "top-level-import",
		// Strips the SDK's debug logging from the bundles. Replay stays
		// untouched on purpose: sentry.client.config.ts lazy-loads it.
		bundleSizeOptimizations: { excludeDebugStatements: true },
		sourcemaps: {
			// Without a token nothing is uploaded, yet the plugins still regenerate
			// every chunk's source map to inject debug ids: that was most of the
			// server bundling time, enough to time out the alpha Worker's build.
			disable: !runtimeConfig.sentry.authToken,
			filesToDeleteAfterUpload: [".*/**/public/**/*.map", ".output/**/public/**/*.map"],
		},
	},

	seo: {
		meta: {
			appleMobileWebAppStatusBarStyle: "black",
			applicationName: "WolfStar",
			author: "WolfStar Project, contact@wolfstar.rocks",
			colorScheme: "dark light",
			mobileWebAppCapable: "yes",
			msapplicationConfig: "/browserconfig.xml",
			ogDescription:
				"WolfStar gives Discord moderation teams configurable AutoMod, searchable moderation and command history, and one dashboard for server settings.",
			ogLocale: "en",
			ogSiteName: "WolfStar",
			ogTitle: "WolfStar",
			ogType: "website",
			robots: "archive,follow,imageindex,index,odp,snippet,translate",
			themeColor: [
				{ content: "#121212", media: "(prefers-color-scheme: dark)" },
				{ content: "#ffffff", media: "(prefers-color-scheme: light)" },
			],
		},
	},

	sitemap: {
		exclude: [
			"/app",
			"/profile",
			"/account",
			"/oauth/guild",
			"/oauth/callback",
			"/guilds/[...id]",
		],
		zeroRuntime: true,
	},

	vitalizer: {
		disablePrefetchLinks: true,
		disablePreloadLinks: true,
		disableStylesheets: "entry",
	},

	i18n: {
		locales: currentLocales,
		// Expanded from base `en` via countryLocaleVariants
		defaultLocale: "en-US",
		fallbackLocale: "en-US",
		strategy: "no_prefix",
		// The locale is chosen explicitly (profile page / user menu) and persisted in
		// `wolfstar-settings`; there is no locale prefix to redirect to, so neither
		// Accept-Language sniffing nor the redirect middleware has anything to do.
		autoDetectLanguage: false,
		redirects: false,
		// Lets SSR render the visitor's locale on a return visit instead of always
		// starting from `defaultLocale` and re-rendering after hydration.
		localeCookie: "wolfstar-locale",
		// Generated by `modules/i18n-locale-bundles.ts`: one placeholder-free
		// `{locale}.json` per locale, merged from the per-feature sources in
		// `i18n/locales/`. Pointing the module at the sources instead would both
		// break its one-file-per-locale layout and ship untranslated `""`
		// placeholders, which render verbatim instead of falling back to en-US.
		translationDir: LOCALE_BUNDLES_DIR,
		// All messages are global; there are no `pages/{route}/{locale}.json` files,
		// so this keeps the module from generating and requesting an empty matrix.
		disablePageLocales: true,
		// hreflang/canonical/og are owned by @nuxtjs/seo, and `no_prefix` gives every
		// locale the same URL anyway — a second source of those tags would duplicate
		// them. `<html lang>`/`dir` are set from the active locale in `app/app.vue`.
		meta: false,
		datetimeFormats,
		numberFormats,
		// `plural` is deliberately absent: the module stringifies whatever function
		// this option holds, and the Nuxt build @nuxt/test-utils runs for Vitest
		// hands module options a cloned config whose functions stringify to
		// `[native code]`, producing an unparseable `#build/i18n.plural.mjs`.
		// `modules/i18n-plural.ts` writes that template from `config/i18n-plural.ts`
		// instead, which behaves the same in dev, build and test.
	},
});

interface ISRConfigOptions {
	fallback?: "html" | "json";
	allowQuery?: string[];
	passQuery?: boolean;
}
function getISRConfig(expirationSeconds: number, options: ISRConfigOptions = {}) {
	const extraISR = {
		...(options.passQuery ? { passQuery: true } : {}),
		...(options.allowQuery ? { allowQuery: options.allowQuery } : {}),
	};
	if (options.fallback) {
		return {
			isr: {
				expiration: expirationSeconds,
				fallback:
					options.fallback === "html"
						? "spa.prerender-fallback.html"
						: "payload-fallback.json",
				initialHeaders:
					options.fallback === "json" ? { "content-type": "application/json" } : {},
				...extraISR,
			} as { expiration: number },
		};
	}
	return {
		isr: {
			expiration: expirationSeconds,
			...extraISR,
		},
	};
}
