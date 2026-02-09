import { createResolver } from "nuxt/kit";
import { isCI } from "std-env";
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
    "nuxt-auth-utils",
    "nuxt-vitalizer",
    "stale-dep/nuxt",
    "@nuxt/test-utils/module",
  ],

  $development: {
    site: {
      url: "http://localhost:3000",
      name: "WolfStar (Dev)",
    },
  },

  $production: {
    modules: ["nuxt-security"],
    image: {
      provider: "netlify",
    },
    pwa: {
      pwaAssets: {
        disabled: true,
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
      titleTemplate: "%s %separator %siteName",
      templateParams: {
        separator: "·",
        siteName: "WolfStar",
      },
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      htmlAttrs: { lang: "en" },
      link: [
        // DNS prefetch for external domains
        { rel: "dns-prefetch", href: "https://cdn.discordapp.com" },
        { rel: "dns-prefetch", href: "https://cdn.wolfstar.rocks" },
        // Preconnect to critical external origins
        { rel: "preconnect", href: "https://cdn.discordapp.com", crossorigin: "anonymous" },
      ],
      meta: [
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
          content: "/mstile-144x144.png",
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
    description:
      "WolfStar is a multipurpose Discord bot designed to handle most tasks, helping users manage their servers easily.",
    name: "WolfStar",
    defaultLocale: "en-US",
    indexable: true,
  },

  colorMode: {
    preference: "system", // default theme
    dataValue: "theme", // activate data-theme in <html> tag
    classSuffix: "",
    fallback: "light",
    storageKey: "wolfstar-theme",
  },

  ui: {
    experimental: {
      componentDetection: true,
    },
  },

  appConfig: {
    storage: {
      driver: process.env.NUXT_STORAGE_DRIVER ?? (isCI ? "cloudflare" : "fs"),
    },
  },
  // Runtime configuration
  runtimeConfig,

  dir: {
    modules: resolve("./modules"),
  },

  routeRules: {
    "/api/commands": {
      proxy: `${runtimeConfig.public.app.apiBaseUrl}/commands`,
    },
    "/api/languages": {
      proxy: `${runtimeConfig.public.app.apiBaseUrl}/languages`,
    },
    "/": { prerender: true, appLayout: "default", robots: true },
    "/wolfstar": { appLayout: "default", robots: true, prerender: true },
    "/starly": { appLayout: "default", robots: true },
    "/__og-image__/**": { prerender: true },
    "/sitemap.xml": { prerender: true },
    "/oauth/**": {
      robots: "nosnippet,notranslate,noimageindex,noarchive,max-snippet:-1,max-image-preview:none,max-video-preview:-1",
      // @ts-expect-error nuxt-security route-specific headers
      security: {
        headers: {
          contentSecurityPolicy: false,
          xContentTypeOptions: "nosniff",
          xFrameOptions: "DENY",
          referrerPolicy: "strict-origin-when-cross-origin",
        },
      },
    },
    "/oauth/callback": { robots: "nosnippet,notranslate,noimageindex,noarchive,max-snippet:-1,max-image-preview:none,max-video-preview:-1" },
    "/oauth/login": { robots: true },
    "/terms": { appLayout: "default", robots: true, prerender: true },
    "/privacy": { appLayout: "default", robots: true, prerender: true },
    "/profile": { appLayout: "default", robots: true },
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
  },

  compatibilityDate: "2025-09-20",

  nitro: {
    rollupConfig: {
      external:
        process.env.NITRO_PRESET !== "node-server"
          ? ["pg-native"]
          : undefined,
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
          layout: "alternate",
          theme: "mars",
        },
      },
    },
    experimental: {
      openAPI: true,
    },
    future: {
      nativeSWR: true,
    },

    storage: {
      "fetch-cache": {
        driver: "fsLite",
        base: "./.cache/fetch",
      },
      "wolfstar:ratelimiter": {
        driver: "fsLite",
        base: "./.cache/atproto-oauth/state",
      },
      "oauth-atproto-session": {
        driver: "fsLite",
        base: "./.cache/atproto-oauth/session",
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
      include: ["../test/nuxt"],
      exclude: ["../service-worker"],
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

  fonts: {
    families: [
      {
        name: "Inter",
        weights: [400, 500, 600, 700, 800, 900],
        subsets: ["latin"],
        preload: true,
        global: true,
      },
    ],
  },

  icon: {
    customCollections: [
      {
        prefix: "custom",
        dir: resolve("./app/assets/icons"),
      },
      {
        prefix: "discord",
        dir: resolve("./app/assets/icons/discord"),
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
    domains: [
      "cdn.discordapp.com",
      "media.discordapp.net",
      "cdn.wolfstar.rocks",
    ],
  },

  macros: {
    setupSFC: true,
    betterDefine: false,
    defineModels: false,
    reactivityTransform: true,
  },

  ogImage: {
    zeroRuntime: true,
    defaults: {
      component: "Default",
    },
  },
  // PWA configuration
  pwa,

  robots: {
    blockAiBots: true,
    blockNonSeoBots: true,
  },
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-ignore nuxt-security is conditional
  security: {
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
          "https://cdn.discordapp.com",
          "https://media.discordapp.net",
          "https://*.netlify.com",
          "https://*.netlify.app",
          "https://*.wolfstar.rocks",
          "https://*.ingest.us.sentry.io",
          "https://*.sentry.io",
        ],
        "font-src": ["'self'", "https:", "data:", "https://cdn.wolfstar.rocks", "https://rsms.me"],
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
        "worker-src": ["'self'", "blob:", "https://beta.wolfstar.rocks", "https://wolfstar.rocks"],
        "child-src": ["'self'", "blob:"],
        "script-src-attr": ["'self'", "'unsafe-inline'"],
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
    autoInjectServerSentry: "top-level-import",
  },

  seo: {
    meta: {
      author: "WolfStar Project, contact@wolfstar.rocks",
      colorScheme: "dark light",
      applicationName: "WolfStar",
      ogSiteName: "WolfStar",
      ogLocale: "en",
      ogType: "website",
      ogTitle: "WolfStar",
      ogDescription:
        "WolfStar is a multipurpose Discord bot designed to handle most tasks, helping users manage their servers easily.",
      twitterCard: "summary_large_image",
      twitterSite: "@WolfStarBot",
      twitterCreator: "@RedStar071",
      twitterDescription:
        "WolfStar is a multipurpose Discord bot designed to handle most tasks, helping users manage their servers easily.",
      twitterTitle: "WolfStar",
      robots: "archive,follow,imageindex,index,odp,snippet,translate",
      msapplicationConfig: "/browserconfig.xml",
      mobileWebAppCapable: "yes",
      appleMobileWebAppStatusBarStyle: "black",
      themeColor: [
        { content: "#121212", media: "(prefers-color-scheme: dark)" },
        { content: "#ffffff", media: "(prefers-color-scheme: light)" },
      ],
    },
  },

  sitemap: {
    exclude: ["/oauth/guild", "/oauth/callback", "/guilds/[...id]"],
  },

  vitalizer: {
    disableStylesheets: "entry",
  },
});
