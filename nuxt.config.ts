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
    "@nuxtjs/seo",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@netlify/nuxt",
    "@vite-pwa/nuxt",
    "@sentry/nuxt/module",
    "@josephanson/nuxt-ai",
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
        { rel: "preconnect", href: "https://rsms.me/" },
        { rel: "stylesheet", href: "https://rsms.me/inter/inter.css" },
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon.png",
        },

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
  },

  sourcemap: {
    client: "hidden",
    server: false,
  },

  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
    checkOutdatedBuildInterval: 20 * 60 * 1000, // 20 minutes
    viteEnvironmentApi: true,
    typescriptPlugin: true,
  },

  compatibilityDate: "2025-09-20",

  nitro: {
    preset: process.env.NUXT_NITRO_PRESET,
    rollupConfig: {
      external:
        process.env.NUXT_NITRO_PRESET !== "node-server"
          ? ["pg-native"]
          : undefined,
    },
    storage: {
      "cache": {
        driver: "netlify-blobs",
        /* redis connector options */
      },
      "@wolfstar/ratelimiter": {
        driver: "netlify-blobs",
      },
    },

    esbuild: {
      options: {
        target: "esnext",
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
  },

  ogImage: {
    zeroRuntime: true,
  },
  // PWA configuration
  pwa,
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-ignore nuxt-security is conditional
  security: {
    nonce: true, // Enables HTML nonce support in SSR mode
    ssg: {
      meta: true, // Enables CSP as a meta tag in SSG mode
      hashScripts: true, // Enables CSP hash support for scripts in SSG mode
      hashStyles: false, // Disables CSP hash support for styles in SSG mode (recommended)
    },
    headers: {
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
        "worker-src": ["'self'", "blob:"],
        "child-src": ["'self'", "blob:"],
        "script-src-attr": ["'none'"],
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "'strict-dynamic'",
          "'wasm-unsafe-eval'",
          "'nonce-{generated-nonce}'",
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
  },

  seo: {
    meta: {
      author: "WolfStar Project, contact@wolfstar.rocks",
      colorScheme: "dark light",
      applicationName: "WolfStar",
      ogSiteName: "WolfStar",
      ogImage: "https://wolfstar.rocks/opengraph.png",
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
    exclude: ["/oauth/guild", "/oauth/callback", "/[...id]"],
  },
});
