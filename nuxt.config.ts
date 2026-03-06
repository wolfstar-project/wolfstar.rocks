import { createResolver } from "nuxt/kit";
import { pwa } from "./config/pwa";
import { generateRuntimeConfig } from "./server/utils/runtimeConfig";

const runtimeConfig = generateRuntimeConfig();

const { resolve } = createResolver(import.meta.url);

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	// Modules configuration
	modules: [
		"@nuxt/ui",
		"@nuxt/image",
		"@nuxt/hints",
		"@nuxt/fonts",
		"@nuxt/a11y",
		"@nuxtjs/seo",
		"@vueuse/nuxt",
		"@netlify/nuxt",
		"@vite-pwa/nuxt",
		"@vueuse/motion/nuxt",
		"@sentry/nuxt/module",
		"@vue-macros/nuxt",
		"evlog/nuxt",
		"nuxt-auth-utils",
		"nuxt-vitalizer",
		"stale-dep/nuxt",
		"@nuxt/test-utils/module",
	],

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
		timeline: {
			enabled: true,
		},
	},

	app: {
		head: {
			charset: "utf8",
			htmlAttrs: { lang: "en" },
			link: [
				// DNS prefetch for external domains
				{ href: "https://cdn.discordapp.com", rel: "dns-prefetch" },
				{ href: "https://cdn.wolfstar.rocks", rel: "dns-prefetch" },
				// Preconnect to critical external origins
				{ crossorigin: "anonymous", href: "https://cdn.discordapp.com", rel: "preconnect" },
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

	vue: {
		propsDestructure: true,
	},

	site: {
		defaultLocale: "en-US",
		description:
			"WolfStar is a multipurpose Discord bot designed to handle most tasks, helping users manage their servers easily.",
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
		exclude: ["/api/openapi.json", "/api/docs/**"],
	},

	ui: {
		experimental: {
			componentDetection: true,
		},
	},

	// Runtime configuration
	runtimeConfig,

	dir: {
		modules: resolve("./modules"),
	},

	routeRules: {
		// API routes — only cache public, non-authenticated proxy routes.
		// Broad ISR on /api/** is intentionally omitted: authenticated routes
		// (e.g. /api/users, /api/guilds/:id/settings) must never be cached
		// Globally, as that would serve one user's data to another.
		"/": { appLayout: "default", prerender: true, robots: true },
		"/__og-image__/**": getISRConfig(60),
		"/api/auth/**": { isr: false, cache: false },
		"/api/commands": {
			isr: 60 * 60, // 1 h — public bot-API proxy, safe to cache
			proxy: `${runtimeConfig.public.app.apiBaseUrl}/commands`,
		},
		"/api/languages": {
			isr: 60 * 60, // 1 h — public bot-API proxy, safe to cache
			proxy: `${runtimeConfig.public.app.apiBaseUrl}/languages`,
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
		"/oauth/login": { robots: true },
		"/privacy": { appLayout: "default", prerender: true, robots: true },
		"/profile": { appLayout: "default", robots: true },
		"/starly": { appLayout: "default", robots: true },

		// Static pages
		"/terms": { appLayout: "default", prerender: true, robots: true },
		"/wolfstar": { appLayout: "default", robots: true },
	},

	sourcemap: {
		client: "hidden",
	},

	features: {
		inlineStyles: true,
	},

	experimental: {
		clientNodeCompat: true,
		renderJsonPayloads: true,
		typescriptPlugin: true,
		typedPages: true,
	},

	compatibilityDate: "2025-09-20",

	nitro: {
		future: {
			nativeSWR: true,
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
		},
	},

	vite: {
		define: {
			"process.test": "false",
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
				"prettier",
				"reka-ui",
				"reka-ui/namespaced",
				"std-env",
				"tailwind-variants",
				"tailwindcss/colors",
				"ufo",
				"vaul-vue",
				"yup",
			],
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
					"#server/*": ["../server/*"],
					"#shared/*": ["../shared/*"],
				},
			},
			include: ["../test/e2e/**/*.ts"],
		},
	},

	postcss: {
		plugins: {
			"postcss-nested": {},
		},
	},

	fonts: {
		families: [
			{
				global: true,
				name: "Inter",
				preload: true,
				subsets: ["latin"],
				weights: [400, 500, 600, 700, 800],
			},
		],
	},

	icon: {
		clientBundle: {
			includeCustomCollections: true,
			scan: true,
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

	macros: {
		betterDefine: false,
		defineModels: false,
		reactivityTransform: true,
		setupSFC: true,
	},

	ogImage: {
		defaults: {
			component: "Default",
		},
		zeroRuntime: true,
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
					"https:",
					"http:",
					"wss:",
					"ws:",
					"https://cdn.wolfstar.rocks",
					"https://cdn.discordapp.com",
					"https://media.discordapp.net",
					"https://*.netlify.com",
					"https://*.netlify.app",
					"https://*.wolfstar.rocks",
					"https://*.ingest.us.sentry.io",
					"https://*.sentry.io",
				],
				"default-src": ["'self'"],
				"font-src": [
					"'self'",
					"https:",
					"data:",
					"https://cdn.wolfstar.rocks",
					"https://rsms.me",
				],
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
	},

	sentry: {
		...runtimeConfig.sentry,
		autoInjectServerSentry: "top-level-import",
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
			twitterCard: "summary_large_image",
			twitterCreator: "@RedStar071",
			twitterDescription:
				"WolfStar is a multipurpose Discord bot designed to handle most tasks, helping users manage their servers easily.",
			twitterSite: "@WolfStarBot",
			twitterTitle: "WolfStar",
		},
	},

	sitemap: {
		exclude: ["/oauth/guild", "/oauth/callback", "/guilds/[...id]"],
	},

	vitalizer: {
		disableStylesheets: "entry",
	},
});

interface ISRConfigOptions {
	fallback?: "html" | "json";
}
function getISRConfig(expirationSeconds: number, options: ISRConfigOptions = {}) {
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
			} as { expiration: number },
		};
	}
	return {
		isr: {
			expiration: expirationSeconds,
		},
	};
}
