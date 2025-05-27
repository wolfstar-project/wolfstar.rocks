import tailwindcss from '@tailwindcss/vite';
import { isDevelopment, isWindows } from 'std-env';
import { appDescription, appName, pwa } from './app/config/pwa';
import '@vite-pwa/nuxt';
import 'nuxt';

const baseURL = 'https://wolfstar.rocks';

export default defineNuxtConfig({
	// Modules configuration
	modules: [
		'@nuxt/image',
		'@vueuse/nuxt',
		'@pinia/nuxt',
		'@vite-pwa/nuxt',
		'@sentry/nuxt/module',
		'@nuxt/eslint',
		'@prisma/nuxt',
		'nuxt-auth-utils',
		'@nuxtjs/seo',
		'@nuxt/icon',
		'@nuxtjs/color-mode',
		'nuxt-authorization',
		'@nuxt/fonts',
		'shadcn-nuxt',
		'@josephanson/nuxt-ai',
		...(isDevelopment || isWindows) ? [] : ['nuxt-security'],
		'@nuxthub/core',
		'vue-sonner/nuxt',
		'stale-dep/nuxt'
	],
	$development: {
		site: {
			url: 'http://localhost:3000',
			name: 'WolfStar (Development)'
		},
		nitro: {			
		openAPI: {
			// OpenAPI configuration
			meta: {
				title: 'WolfStar API',
				description: 'WolfStar API documentation',
				version: '1.0.0'
			},
			route: '/_docs/openapi.json',
			production: 'runtime',
			ui: {
				scalar: {
					route: '/api/docs',
					darkMode: true,
					hideDownloadButton: true,
					searchHotKey: 'k',
					showSidebar: true
				}
			}
		},
		experimental: {
			openAPI: true
		}
		}
	},
	$production: {
		site: {
			url: 'https://wolfstar.rocks',
			name: 'WolfStar'
		}
	},
	imports: {
		presets: [
			{
				from: '@sentry/nuxt',
				imports: ['captureException']
			}
		]
	},
	devtools: {
		enabled: true
	},
	// App meta configuration
	app: {
		head: {
			charset: 'utf-8',
			viewport: 'width=device-width, initial-scale=1',
			titleTemplate: '%s • WolfStar',
			htmlAttrs: { lang: 'en' },
			title: 'WolfStar',
			link: [
				{ rel: 'alternate', href: baseURL },
				{ rel: 'canonical', href: baseURL },
				{ rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
				{ rel: 'apple-touch-startup-image', href: '/icons/apple-startup.png' },
				{ rel: 'icon', href: '/icons/android-chrome-192x192.png' },
				{ rel: 'icon', href: '/favicon.ico' },
				{ rel: 'icon', href: '/icons/favicon-16x16.png' },
				{ rel: 'icon', href: '/icons/favicon-32x32.png' },
				{ rel: 'mask-icon', href: '/icons/safari-pinned-tab.svg' },
				{ rel: 'shortcut icon', href: '/favicon.ico' }
			],
			meta: [
				// Cache control
				{ 'http-equiv': 'Cache-Control', content: '1y' },
				{ 'http-equiv': 'Content-Type', content: 'text/html; charset=UTF-8' },
				{ 'http-equiv': 'Expires', content: '1y' },
				{ 'http-equiv': 'Pragma', content: '1y' },

				// Page transitions
				{ 'http-equiv': 'Page-Enter', content: 'RevealTrans(Duration=2.0,Transition=2)' },
				{ 'http-equiv': 'Page-Exit', content: 'RevealTrans(Duration=3.0,Transition=12)' },

				// Mobile specific
				{ name: 'mobile-web-app-capable', content: 'yes' },
				{ name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
				{ name: 'apple-mobile-web-app-title', content: appName },
				{ name: 'HandheldFriendly', content: 'True' },

				// Microsoft specific
				{ name: 'application-name', content: 'WolfStar' },
				{ name: 'msapplication-TileColor', content: '#fd171b' },
				{ name: 'msapplication-TileImage', content: '/icons/mstile-144x144.png' },
				{ name: 'msapplication-config', content: '/browserconfig.xml' },

				// Theme and appearance
				{ name: 'theme-color', content: '#fd171b' },

				// SEO meta tags
				{ name: 'revisit-after', content: '7 days' },
				{ name: 'url', content: baseURL },
				{ name: 'identifier-URL', content: baseURL },
				{ name: 'shortlink', content: baseURL },
				{ name: 'keywords', content: 'discord, bot, wolfstar, moderation, automation, wolfstar, cyborg' },
				{
					name: 'summary',
					content: appDescription
				},
				{ name: 'subject', content: appDescription },

				// Robots and indexing
				{ name: 'robots', content: 'archive,follow,imageindex,index,odp,snippet,translate' },
				{ name: 'googlebot', content: 'index,follow' },

				// Authorship and ownership
				{ name: 'author', content: 'WolfStar Project, contact@wolfstar.rocks' },
				{ name: 'owner', content: 'Davide Trinastich, redtwoghost@gmail.com' },
				{ name: 'designer', content: 'Davide Trinastich, redtwoghost@gmail.com' },
				{ name: 'reply-to', content: 'contact@wolfstar.rocks' },

				// Distribution and audience
				{ name: 'target', content: 'all' },
				{ name: 'audience', content: 'all' },
				{ name: 'coverage', content: 'Worldwide' },
				{ name: 'distribution', content: 'Global' },
				{ name: 'rating', content: 'safe for kids' },

				// Open Graph meta tags
				{ property: 'og:email', content: 'contact@wolfstar.rocks' },
				{
					property: 'og:description',
					content: appDescription
				},
				{ property: 'og:image:alt', content: 'OpenGraphImage' },
				{ property: 'og:image:height', content: '512' },
				{ property: 'og:image:width', content: '1024' },
				{ property: 'og:image', content: 'https://wolfstar.rocks/icons/opengraph.png' },
				{ property: 'og:locale', content: 'en' },
				{ property: 'og:site_name', content: appName },
				{ property: 'og:title', content: appName },
				{ property: 'og:type', content: 'website' },
				{ property: 'og:url', content: baseURL }
			]
		}
	},
	css: ['~/assets/css/main.css'],
	colorMode: {
		preference: 'system', // default theme
		dataValue: 'theme', // activate data-theme in <html> tag
		classSuffix: '',
		fallback: 'light'
	},
	// Runtime configuration
	runtimeConfig: {
		public: {
			clientId: process.env.NUXT_OAUTH_DISCORD_CLIENT_ID,
			apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
			environment: process.env.NODE_ENV,
			sentry: {
				dsn: process.env.NITRO_SENTRY_DSN
			}
		},
		token: process.env.NUXT_OAUTH_DISCORD_BOT_TOKEN
	},
	// Build configuration
	routeRules: {
		'/': { prerender: true },
		'/terms': { isr: true, prerender: true },
		'/privacy': { isr: true, prerender: true }
	},
	sourcemap: { client: true },
	future: {
		compatibilityVersion: 4
	},
	experimental: {
		typedPages: true,
		inlineRouteRules: true
	},
	compatibilityDate: '2025-01-10',

	// Nitro server configuration
	nitro: {
		preset: 'cloudflare-pages',
		prerender: {
			crawlLinks: true,
			routes: ['/sitemap.xml', '/robots.txt']
		},
		esbuild: {
			options: {
				target: 'esnext'
			}
		},
	},
	vite: {
		plugins: [tailwindcss()],
    build: {
      target: 'esnext',
    },
		optimizeDeps: {
			include: [
				'reka-ui',
				'reka-ui/namespaced',
				'@vueuse/shared',
				'@sapphire/utilities',
				'@sapphire/utilities/cast',
				'colortranslator',
				'tailwindcss/colors',
				'tailwind-variants',
				'ufo',
				'zod',
				'@sapphire/utilities'
			]
		}
	},
	typescript: {
    tsConfig: {

      vueCompilerOptions: {
        target: 3.5,
      },
    },
  },
	eslint: {
		config: {
			standalone: false,
			nuxt: {
				sortConfigKeys: true
			}
		}
	},
	icon: {
		clientBundle: {
			scan: true
		},
		mode: 'svg',
		componentName: 'NuxtIcon'
	},
	image: {
		screens: {},
		format: ['webp', 'jpeg', 'jpg', 'png', 'svg'],
		provider: 'ipx'
	},
	ogImage: {
		zeroRuntime: true
	},
	// PWA configuration
	pwa,
	 // eslint-disable-next-line ts/ban-ts-comment
  // @ts-ignore nuxt-security is conditional
  security: {
    headers: {
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        'default-src': ['\'self\''],
        'base-uri': ['\'self\''],
        'connect-src': ['\'self\'', 'https:', 'http:', 'wss:', 'ws:'],
        'font-src': ['\'self\''],
        'form-action': ['\'none\''],
        'frame-ancestors': ['\'none\''],
        'frame-src': ['https:'],
        'img-src': ['\'self\'', 'https:', 'http:', 'data:', 'blob:'],
        'manifest-src': ['\'self\''],
        'media-src': ['\'self\'', 'https:', 'http:'],
        'object-src': ['\'none\''],
        'script-src': ['\'self\'', '\'unsafe-inline\'', '\'wasm-unsafe-eval\''],
        'script-src-attr': ['\'none\''],
        'style-src': ['\'self\'', '\'unsafe-inline\''],
        'upgrade-insecure-requests': true,
      },
      permissionsPolicy: {
        fullscreen: '*',
      },
    },
    rateLimiter: false,
  },
	sentry: {
		autoInjectServerSentry: 'experimental_dynamic-import'
	},

	shadcn: {
		componentDir: './app/components/ui',
		prefix: 'Shad'
	},
	sitemap: {
		exclude: ['/join', '/oauth/guild', '/oauth/callback', '/[...id]']
	},
});
