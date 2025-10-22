import { createResolver } from "nuxt/kit";
import { isDevelopment, isWindows } from "std-env";
import { pwa } from "./config/pwa";
import { generateRuntimeConfig } from "./server/utils/runtimeConfig";

const runtimeConfig = generateRuntimeConfig();

const { resolve } = createResolver(import.meta.url);

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Modules configuration
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxt/scripts",
    "@nuxt/image",
    "@nuxtjs/seo",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@netlify/nuxt",
    "@vite-pwa/nuxt",
    "@sentry/nuxt/module",
    "nuxt-auth-utils",
    "nuxt-authorization",
    "nuxt-vitalizer",
    ...(isDevelopment || isWindows ? [] : ["nuxt-security"]),
    "~~/modules/build-env",
    "stale-dep/nuxt",
  ],

  $development: {
    site: {
      url: "http://localhost:3000",
      name: "WolfStar (Dev)",
    },
  },

  $production: {
    scripts: {
      registry: {
        cloudflareWebAnalytics: true,
      },
    },
    sentry: {
      telemetry: false,
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
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      htmlAttrs: { lang: "en" },
      link: [
        { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
        { rel: "apple-touch-startup-image", href: "/icons/apple-startup.png" },
        { rel: "icon", href: "/icons/android-chrome-192x192.png" },
        { rel: "icon", href: "/favicon.ico" },
        { rel: "icon", href: "/icons/favicon-16x16.png" },
        { rel: "icon", href: "/icons/favicon-32x32.png" },
        { rel: "mask-icon", href: "/icons/safari-pinned-tab.svg" },
        { rel: "shortcut icon", href: "/favicon.ico" },
      ],
      meta: [
        // Cache control
        { "http-equiv": "Cache-Control", "content": "1y" },
        { "http-equiv": "Content-Type", "content": "text/html; charset=UTF-8" },
        { "http-equiv": "Expires", "content": "1y" },
        { "http-equiv": "Pragma", "content": "1y" },

        // Page transitions
        {
          "http-equiv": "Page-Enter",
          "content": "RevealTrans(Duration=2.0,Transition=2)",
        },
        {
          "http-equiv": "Page-Exit",
          "content": "RevealTrans(Duration=3.0,Transition=12)",
        },

        // Mobile specific (only keep if not in seo.meta)
        { name: "HandheldFriendly", content: "True" },

        // Microsoft specific (only keep if not in seo.meta)
        { name: "application-name", content: "WolfStar" },
        {
          name: "msapplication-TileImage",
          content: "/icons/mstile-144x144.png",
        },

        // Distribution and audience (only keep if not in seo.meta)
        { name: "target", content: "all" },
        { name: "audience", content: "all" },
        { name: "coverage", content: "Worldwide" },
        { name: "distribution", content: "Global" },
        { name: "rating", content: "safe for kids" },
      ],
    },
  },
  css: ["~/assets/css/main.css"],
  vue: {
    propsDestructure: true,
  },

  site: {
    url: "https://wolfstar.rocks",
    name: "WolfStar",
    defaultLocale: "en-US",
    indexable: true,
  },
  colorMode: {
    preference: "system", // default theme
    dataValue: "theme", // activate data-theme in <html> tag
    classSuffix: "",
    fallback: "light",
  },

  // Runtime configuration
  runtimeConfig,

  routeRules: {
    "/": { prerender: true },
    "/sitemap.xml": { prerender: true },
  },

  sourcemap: {
    client: "hidden",
  },

  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: true,
  },

  compatibilityDate: "2025-09-20",
  nitro: {
    preset: process.env.NUXT_NITRO_PRESET,
    prerender: {
      crawlLinks: true,
      routes: ["/", "/sitemap.xml"],
    },
    esbuild: {
      options: {
        target: "esnext",
      },
    },
    rollupConfig: {
      external:
        process.env.NUXT_NITRO_PRESET !== "node-server"
          ? ["pg-native"]
          : undefined,
    },
    openAPI: {
      // OpenAPI configuration
      meta: {
        title: "WolfStar API",
        description: "WolfStar API documentation",
        version: "1.0.0",
      },
      route: "/api/openapi.json",
      ui: {
        scalar: {
          route: "/api/docs",
          darkMode: true,
          hideDownloadButton: true,
          searchHotKey: "k",
          showSidebar: true,
        },
      },
    },
    experimental: {
      openAPI: true,
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        "@vueuse/shared",
        "@sapphire/utilities",
        "@sapphire/utilities/isNullish",
        "@sapphire/utilities/cast",
        "tailwindcss/colors",
        "ufo",
        "std-env",
        "ohash/utils",
        "@sentry/vue",
        "@sentry/nuxt",
        "deepmerge",
        "discord-api-types/v10",
        "@discordjs/rest",
        "motion-v",
        "@vueuse/integrations/useFuse",
        "yup",
        "@discordjs/core/http-only",
        "@sapphire/time-utilities",
        "@sapphire/bitfield",
        "@sapphire/snowflake",
        "@sapphire/async-queue",
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "uuid",
      ],
    },
  },
  postcss: {
    plugins: {
      "postcss-nested": {},
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
    customCollections: [
      {
        prefix: "custom",
        dir: resolve("./app/assets/icons"),
      },
    ],
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
    provider: "iconify",
  },

  image: {
    format: ["webp", "jpeg", "jpg", "png", "svg"],
    provider: "ipx",
    ipx: {
      baseURL: "https://ipx.wolfstar.rocks",
    },
  },

  ogImage: {
    zeroRuntime: true,
  },
  // PWA configuration
  pwa,
  robots: {},
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-ignore nuxt-security is conditional
  security: {
    nonce: true, // Enable nonce support for SSR
    headers: {
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        "default-src": ["'self'"],
        "base-uri": ["'self'"],
        "connect-src": [
          "'self'",
          "https:",
          "http:",
          "wss:",
          "ws:",
          "https://cdn.wolfstar.rocks",
          "https://cloudflareinsights.com",
          "https://static.cloudflareinsights.com",
          "https://cdn.discordapp.com",
          "https://media.discordapp.net",
        ],
        "font-src": ["'self'", "https:", "data:", "https://cdn.wolfstar.rocks"],
        "form-action": ["'none'"],
        "frame-ancestors": ["'none'"],
        "frame-src": ["https:"],
        "img-src": [
          "'self'",
          "https:",
          "http:",
          "data:",
          "blob:",
          "https://ipx.wolfstar.rocks",
          "https://cdn.wolfstar.rocks",
          "https://cdn.discordapp.com",
          "https://media.discordapp.net",
        ],
        "manifest-src": ["'self'"],
        "media-src": [
          "'self'",
          "https:",
          "http:",
          "https://ipx.wolfstar.rocks",
          "https://cdn.wolfstar.rocks",
          "https://cdn.discordapp.com",
          "https://media.discordapp.net",
        ],
        "object-src": ["'none'"],
        "script-src": [
          "'self'",
          "https://static.cloudflareinsights.com",
          "'wasm-unsafe-eval'",
          "'strict-dynamic'",
          "'nonce-{{nonce}}'",
        ],
        "worker-src": ["'self'", "blob:"],
        "child-src": ["'self'", "blob:"],
        "script-src-attr": ["'none'"],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https:",
          "https://cdn.wolfstar.rocks",
          "https://rsms.me/inter/inter.css",
        ],
        "upgrade-insecure-requests": true,
      },
      permissionsPolicy: {
        fullscreen: "*",
      },
    },
    rateLimiter: false,
  },

  sentry: {
    ...runtimeConfig.sentry,
  },

  seo: {
    meta: {
      description:
        "WolfStar is a multipurpose Discord bot designed to handle most tasks, helping users manage their servers easily.",
      author: "WolfStar Project, contact@wolfstar.rocks",
      colorScheme: "dark light",
      applicationName: "WolfStar",
      ogSiteName: "WolfStar",
      ogLocale: "en",
      ogType: "website",
      ogUrl: "https://wolfstar.rocks",
      ogTitle: "WolfStar",
      ogDescription:
        "WolfStar is a multipurpose Discord bot designed to handle most tasks, helping users manage their servers easily.",
      robots: "archive,follow,imageindex,index,odp,snippet,translate",
      msapplicationConfig: "/browserconfig.xml",
      mobileWebAppCapable: "yes",
      appleMobileWebAppStatusBarStyle: "black",
    },
  },
  sitemap: {
    exclude: ["/oauth/guild", "/oauth/callback", "/[...id]"],
  },
});
