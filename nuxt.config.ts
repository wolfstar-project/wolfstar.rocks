import type { ModuleOptions as SecurityModuleOptions } from "nuxt-security";
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
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/hints",
    "@nuxt/fonts",
    "@nuxtjs/seo",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@netlify/nuxt",
    "@vite-pwa/nuxt",
    "@vueuse/motion/nuxt",
    "@sentry/nuxt/module",
    "@vue-macros/nuxt",
    "@josephanson/nuxt-ai",
    "nuxt-auth-utils",
    "nuxt-authorization",
    "nuxt-vitalizer",
    "~~/modules/build-env",
    "stale-dep/nuxt",
    ...(isDevelopment || isWindows) ? [] : ["nuxt-security"],
  ],

  $development: {
    site: {
      url: "http://localhost:3000",
      name: "WolfStar (Dev)",
    },
  },

  $production: {
    image: {
      provider: "netlify",
    },
    scripts: {
      registry: {
        cloudflareWebAnalytics: {
          token: process.env.NUXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN,
        },
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
        { rel: "icon", href: "/favicon.ico", sizes: "any" },
        { rel: "icon", type: "image/svg+xml", href: "/icons/logo.svg" },
        { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
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

  future: {
    compatibilityVersion: 5,
  },

  features: {
    inlineStyles: true,
  },

  experimental: {
    payloadExtraction: false,
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
    storage: {
      "wolfstar:ratelimiter": {
        driver: "netlify-blobs",
        name: "wolfstar:ratelimiter",
      },
    },
    devStorage: {
      "wolfstar:ratelimiter": {
        driver: "memory",
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
          hideClientButton: false,
          showSidebar: true,
          showDeveloperTools: "localhost",
          showToolbar: "localhost",
          operationTitleSource: "summary",
          persistAuth: false,
          telemetry: true,
          isEditable: false,
          isLoading: false,
          hideModels: false,
          documentDownloadType: "none",
          hideTestRequestButton: false,
          hideSearch: false,
          showOperationId: false,
          hideDarkModeToggle: false,
          withDefaultFonts: true,
          defaultOpenAllTags: false,
          expandAllModelSections: false,
          expandAllResponses: false,
          orderSchemaPropertiesBy: "alpha",
          orderRequiredPropertiesFirst: true,
          searchHotKey: "k",
          _integration: "html",
          hideDownloadButton: true,
          darkMode: true,
          default: false,
          slug: "api-1",
          title: "API #1",

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
  },
  // PWA configuration
  pwa,

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
          "https://cloudflareinsights.com",
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
          "https://static.cloudflareinsights.com",
          "https://beta.wolfstar.rocks",
          "https://wolfstar.rocks",
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
  } satisfies Partial<SecurityModuleOptions>,

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
      ogImage: "https://wolfstar.rocks/icons/opengraph.png",
      ogLocale: "en",
      ogType: "website",
      ogUrl: "https://wolfstar.rocks",
      ogTitle: "WolfStar",
      ogDescription:
        "WolfStar is a multipurpose Discord bot designed to handle most tasks, helping users manage their servers easily.",
      twitterCard: "summary_large_image",
      twitterSite: "@WolfStarBot",
      twitterCreator: "@RedStar071",
      twitterImage: "https://wolfstar.rocks/opengraph.png",
      twitterDescription:
        "WolfStar is a multipurpose Discord bot designed to handle most tasks, helping users manage their servers easily.",
      twitterTitle: "WolfStar",
      robots: "archive,follow,imageindex,index,odp,snippet,translate",
      msapplicationConfig: "/browserconfig.xml",
      mobileWebAppCapable: "yes",
      appleMobileWebAppStatusBarStyle: "black",
    },
  },

  sitemap: {
    exclude: ["/oauth/guild", "/oauth/callback", "/guilds/[...id]"],
  },

  vitalizer: {
    disableStylesheets: "entry",
  },
});
