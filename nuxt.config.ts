import tailwindcss from '@tailwindcss/vite';
import { isDevelopment, isWindows } from 'std-env';
import { appDescription, appName, pwa } from './config/pwa';
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
		...(isDevelopment || isWindows ? [] : ['nuxt-security']),
		'@nuxthub/core',
		'vue-sonner/nuxt',
		'stale-dep/nuxt'
	],
	$development: {
		site: {
			url: 'http://localhost:3000',
			name: 'WolfStar (Development)'
		}
	},
	$production: {
		site: {
			url: 'https://wolfstar.rocks',
			name: 'WolfStar'
		}
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

				// Mobile specific (only keep if not in seo.meta)
				{ name: 'HandheldFriendly', content: 'True' },

				// Microsoft specific (only keep if not in seo.meta)
				{ name: 'application-name', content: 'WolfStar' },
				{ name: 'msapplication-TileImage', content: '/icons/mstile-144x144.png' },

				// Distribution and audience (only keep if not in seo.meta)
				{ name: 'target', content: 'all' },
				{ name: 'audience', content: 'all' },
				{ name: 'coverage', content: 'Worldwide' },
				{ name: 'distribution', content: 'Global' },
				{ name: 'rating', content: 'safe for kids' }
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
			environment: process.env.NODE_ENV
		},
		token: process.env.NUXT_OAUTH_DISCORD_BOT_TOKEN
	},
	// Build configuration
	routeRules: {
		'/': { prerender: true }
	},
	sourcemap: { client: 'hidden' },
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
			routes: ['/', '/sitemap.xml', '/robots.txt']
		},
		esbuild: {
			options: {
				target: 'esnext'
			}
		}
	},
	vite: {
		plugins: [tailwindcss()],
		build: {
			target: 'esnext'
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
		screens: {}
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
				'default-src': ["'self'"],
				'base-uri': ["'self'"],
				'connect-src': ["'self'", 'https:', 'http:', 'wss:', 'ws:'],
				'font-src': ["'self'"],
				'form-action': ["'none'"],
				'frame-ancestors': ["'none'"],
				'frame-src': ['https:'],
				'img-src': ["'self'", 'https:', 'http:', 'data:', 'blob:'],
				'manifest-src': ["'self'"],
				'media-src': ["'self'", 'https:', 'http:'],
				'object-src': ["'none'"],
				'script-src': ["'self'", "'unsafe-inline'", "'wasm-unsafe-eval'"],
				'script-src-attr': ["'none'"],
				'style-src': ["'self'", "'unsafe-inline'"],
				'upgrade-insecure-requests': true
			},
			permissionsPolicy: {
				fullscreen: '*'
			}
		},
		rateLimiter: false
	},
	seo: {
		meta: {
			description: appDescription,
			themeColor: '#fd171b',
			author: 'WolfStar Project, contact@wolfstar.rocks',
			colorScheme: 'dark light',
			applicationName: appName,
			ogSiteName: appName,
			ogLocale: 'en',
			ogType: 'website',
			ogUrl: baseURL,
			ogTitle: appName,
			ogDescription: appDescription,
			ogImage: 'https://wolfstar.rocks/icons/opengraph.png',
			ogImageAlt: 'OpenGraphImage',
			ogImageHeight: '512',
			ogImageWidth: '1024',
			robots: 'archive,follow,imageindex,index,odp,snippet,translate',
			msapplicationTileColor: '#fd171b',
			msapplicationConfig: '/browserconfig.xml',
			keywords: 'discord, bot, wolfstar, moderation, automation, wolfstar, cyborg',
			mobileWebAppCapable: 'yes',
			appleMobileWebAppStatusBarStyle: 'black',
			appleMobileWebAppTitle: appName
		}
	},

	shadcn: {
		componentDir: './app/components/ui',
		prefix: 'Shad'
	},
	sitemap: {
		exclude: ['/join', '/oauth/guild', '/oauth/callback', '/[...id]']
	}
});
