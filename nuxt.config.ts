import type { ModuleOptions } from 'nuxt-security'
import tailwindcss from '@tailwindcss/vite'
import { isDevelopment, isWindows } from 'std-env'
import { pwa } from './config/pwa'
import { generateRuntimeConfig } from './server/utils/runtimeConfig'
import { Env } from './shared/types/index'
import '@vite-pwa/nuxt'
import 'nuxt'

const environment =
  isDevelopment ? Env.Dev :
  process.env.CF_PAGES_BRANCH === 'main' ? Env.Prod :
  process.env.CF_PAGES_BRANCH ??
  'unknown'

const sentryReleaseName = process.env.CF_PAGES_COMMIT_SHA ?? 'unknown commit'

export default defineNuxtConfig({
  // Modules configuration
  modules: [
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxtjs/seo',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@prisma/nuxt',
    'nuxt-auth-utils',
    'nuxt-authorization',
    'shadcn-nuxt',
    '@josephanson/nuxt-ai',
    '@sentry/nuxt/module',
    'nitro-cloudflare-dev',
    ...(isDevelopment || isWindows ? [] : ['nuxt-security']),
    ...(process.env.NUXT_NITRO_PRESET !== 'node-server' ? ['@nuxthub/core'] : []),
    '~~/modules/build-env',
    'stale-dep/nuxt',
  ],
  $development: {
    site: {
      url: 'http://localhost:3000',
      name: 'WolfStar (Development)',
    },
  },
  devtools: {
    enabled: true,
  },
  // App meta configuration
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
        { rel: 'apple-touch-startup-image', href: '/icons/apple-startup.png' },
        { rel: 'icon', href: '/icons/android-chrome-192x192.png' },
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'icon', href: '/icons/favicon-16x16.png' },
        { rel: 'icon', href: '/icons/favicon-32x32.png' },
        { rel: 'mask-icon', href: '/icons/safari-pinned-tab.svg' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
      ],
      meta: [
        // Cache control
        { 'http-equiv': 'Cache-Control', 'content': '1y' },
        { 'http-equiv': 'Content-Type', 'content': 'text/html; charset=UTF-8' },
        { 'http-equiv': 'Expires', 'content': '1y' },
        { 'http-equiv': 'Pragma', 'content': '1y' },

        // Page transitions
        { 'http-equiv': 'Page-Enter', 'content': 'RevealTrans(Duration=2.0,Transition=2)' },
        { 'http-equiv': 'Page-Exit', 'content': 'RevealTrans(Duration=3.0,Transition=12)' },

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
        { name: 'rating', content: 'safe for kids' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  site: {
    url: 'https://wolfstar.rocks',
    name: 'WolfStar',
  },
  colorMode: {
    preference: 'system', // default theme
    dataValue: 'theme', // activate data-theme in <html> tag
    classSuffix: '',
    fallback: 'light',
  },
  // Runtime configuration
  runtimeConfig: generateRuntimeConfig(),

  // Nitro server configuration
  // Build configuration
  routeRules: {
    '/': { prerender: true },
  },

  sourcemap: {
    client: 'hidden',
  },
  experimental: {
    typedPages: true,
    inlineRouteRules: true,
  },
  compatibilityDate: '2025-07-20',

  nitro: {
    preset: process.env.NUXT_NITRO_PRESET,
    prerender: {
      crawlLinks: true,
      routes: ['/', '/sitemap.xml'],
    },
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    rollupConfig: {
      external: process.env.NUXT_NITRO_PRESET !== 'node-server' ? ['pg-native'] : undefined,
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
        '@sapphire/utilities',
      ],
    },
  },
  eslint: {
    config: {
      standalone: false,
      nuxt: {
        sortConfigKeys: true,
      },
    },
  },
  icon: {
    serverBundle: false,
    clientBundle: {
      scan: {
        globInclude: ['**\/*.{vue,jsx,tsx,md,mdc,mdx}', 'app/**/*.ts']
      }
    },
    provider: 'iconify',
    componentName: 'NuxtIcon',
  },
  image: {
    screens: {},
  },
  ogImage: {
    zeroRuntime: true,
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
    rateLimiter: {
      tokensPerInterval: 10,
      interval: 20000,
    },
  } as ModuleOptions,

  
  sentry: {
    unstable_sentryBundlerPluginOptions: {
      release: {
        name: sentryReleaseName,
        deploy: {
          env: environment,
          url: process.env.CF_PAGES_URL,
        },
      },
    },
  },
  seo: {
    meta: {
      description: 'WolfStar is a multipurpose Discord bot designed to handle most tasks, helping users manage their servers easily.',
      author: 'WolfStar Project, contact@wolfstar.rocks',
      colorScheme: 'dark light',
      applicationName: 'WolfStar',
      ogSiteName: 'WolfStar',
      ogLocale: 'en',
      ogType: 'website',
      ogUrl: 'https://wolfstar.rocks',
      ogTitle: 'WolfStar',
      ogDescription: 'WolfStar is a multipurpose Discord bot designed to handle most tasks, helping users manage their servers easily.',
      robots: 'archive,follow,imageindex,index,odp,snippet,translate',
      msapplicationConfig: '/browserconfig.xml',
      mobileWebAppCapable: 'yes',
      appleMobileWebAppStatusBarStyle: 'black',
    },
  },

  shadcn: {
    componentDir: './app/components/ui',
    prefix: 'Shad',
  },
  sitemap: {
    exclude: ['/join', '/oauth/guild', '/oauth/callback', '/[...id]'],
  },
})
