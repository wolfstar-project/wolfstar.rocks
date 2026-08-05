import netlifyNuxt from "@netlify/nuxt";
import { auditRedactPreset } from "evlog";
import { createResolver } from "nuxt/kit";
import { isCI, isTest, provider } from "std-env";
import { currentLocales } from "./config/i18n";
import { pwa } from "./config/pwa";
import { generateRuntimeConfig } from "./server/utils/runtimeConfig";

const runtimeConfig = generateRuntimeConfig();
const isStorybook = process.env.STORYBOOK === "true" || process.env.VITEST_STORYBOOK === "true";

const { resolve } = createResolver(import.meta.url);

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	// Modules configuration
	modules: [
		"@nuxt/ui",
		"@nuxt/content",
		// Nuxt Studio works in development and production (Git publish needs prod).
		// Skip it in Vitest/Storybook: its Vite plugins break the rolldown-based
		// test environment. Studio editor chunks are also excluded from the PWA
		// precache in config/pwa.ts so multi-MB bundles don't fail the build.
		...(isTest || isStorybook ? [] : ["nuxt-studio"]),
		"@nuxt/image",
		"@nuxt/hints",
		"@nuxt/fonts",
		"@nuxt/a11y",
		"@nuxtjs/seo",
		"nuxt-skew-protection",
		"@vueuse/nuxt",
		"@vite-pwa/nuxt",
		"@nuxtjs/html-validator",
		"@nuxtjs/i18n",
		"@sentry/nuxt/module",
		"evlog/nuxt",
		"@onmax/nuxt-better-auth",
		"nuxt-vitalizer",
		"stale-dep/nuxt",
		"@nuxt/test-utils/module",
		[
			"vite-doctor/nuxt",
			{
				extends: "auto",
			},
		],
		...(isTest || isCI || isStorybook ? [] : [netlifyNuxt]),
	],

	content: {
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
			provider: "netlify",
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
				// Preconnect for external domains (faster than dns-prefetch: includes TLS handshake)
				{ href: "https://cdn.discordapp.com", rel: "preconnect", crossorigin: "anonymous" },
				{ href: "https://cdn.wolfstar.rocks", rel: "preconnect", crossorigin: "anonymous" },
				// Fallback dns-prefetch for browsers that don't support preconnect
				{ href: "https://cdn.discordapp.com", rel: "dns-prefetch" },
				{ href: "https://cdn.wolfstar.rocks", rel: "dns-prefetch" },
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
			"WolfStar is a multipurpose Discord bot designed to handle most tasks, helping users manage their servers easily.",
		indexable: true,
		name: "WolfStar",
	},

	auth: {
		clientOnly: true,
		redirectQueryKey: "next",
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
		enabled: !isCI || (provider !== "netlify" && !!process.env.VALIDATE_HTML),
		options: {
			rules: {
				"meta-refresh": "off",
				// NuxtUI/DaisyUI theme class merging produces duplicate utility classes
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
		// must never be cached globally, as that would serve one user's data to another.
		"/sitemap.xml": { prerender: true },
		"/": { appLayout: "default", prerender: true, robots: true },
		"/_og/d/**": getISRConfig(60 * 60 * 24), // 1 day
		"/api/auth/**": { isr: false, cache: false },
		// Bot API BFF used by `$api` on the client — never CDN-cache (may carry auth).
		// More-specific `/api/auth/**` rules above keep auth routes unproxied.
		"/api/**": {
			isr: false,
			cache: false,
			headers: {
				"Cache-Control": "private, no-store",
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
			robots: "nosnippet,notranslate,noimageindex,noarchive,max-snippet:-1,max-image-preview:none,max-video-preview:-1",
		},
		// Redirect-only OAuth entry point: its middleware immediately redirects to
		// Discord, so prerendering only produces an empty redirect stub that fails
		// html-validation (no <title>/<body>, missing lang). Never prerender it.
		"/oauth/login": {
			prerender: false,
			robots: true,
		},
		"/login": { prerender: false },
		"/privacy": { appLayout: "default", prerender: true, robots: true },
		// /profile is a per-user authenticated page: never statically prerender it
		// (crawlLinks would otherwise reach it via links on prerendered pages and
		// fail html-validation on the empty auth-redirect stub, same as /oauth/login above).
		"/profile": {
			appLayout: "default",
			prerender: false,
			robots: true,
		},
		"/starly": { appLayout: "default", robots: true },

		// Static pages
		"/commands": { appLayout: "default", prerender: true, robots: true },
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
		// Changelog pulls live GitHub releases from ungh.cc, so it revalidates via
		// ISR (1 hour) rather than prerendering against the external API at build time.
		"/changelog": { appLayout: "default", robots: true, ...getISRConfig(60 * 60) },
		// Nuxt Studio admin UI + auth callbacks — SSR-only, never index or prerender.
		"/_studio": { prerender: false, robots: false },
		"/_studio/**": { prerender: false, robots: false },
		"/__nuxt_studio/**": { prerender: false, robots: false },
	},

	sourcemap: {
		client: "hidden",
	},

	features: {
		inlineStyles: true,
	},

	experimental: {
		clientNodeCompat: true,
		typescriptPlugin: true,
		viteEnvironmentApi: !isStorybook,
		typedPages: true,
		checkOutdatedBuildInterval: 5 * 60 * 1000, // 5 minutes
	},

	compatibilityDate: "2025-09-20",

	nitro: {
		future: {
			nativeSWR: true,
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
			"payload-cache": {
				base: "./.cache/payload",
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
			include: ["../test/unit/shared/**/*.ts"],
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
		storage: {
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
		bundleAssets: false,
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
					// WolfStar bot API (`$api` + sapphire `POST /oauth/callback`)
					"http://localhost:8282",
					"http://127.0.0.1:8282",
					"https://api.wolfstar.rocks",
					"https://api.beta.wolfstar.rocks",
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
		autoInjectServerSentry: "top-level-import",
		sourcemaps: {
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
				"WolfStar is a multipurpose Discord bot designed to handle most tasks, helping users manage their servers easily.",
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
		exclude: ["/oauth/guild", "/oauth/callback", "/guilds/[...id]"],
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
		strategy: "no_prefix",
		detectBrowserLanguage: false,
		// Paths are resolved relative to `restructureDir` (default "i18n/"), so this
		// points at i18n/locales/. The vue-i18n runtime config (fallbackLocale,
		// datetime/number formats) is auto-loaded from i18n/i18n.config.ts.
		langDir: "locales",
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
