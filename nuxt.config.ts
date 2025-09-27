import type { ModuleOptions as NuxtHubModuleOptions } from "@nuxthub/core";
import type { NuxtPage } from "nuxt/schema";
import { isDevelopment } from "std-env";
import { pwa } from "./config/pwa";
import { generateRuntimeConfig } from "./server/utils/runtimeConfig";
import { Env } from "./shared/types/index";
import "@vite-pwa/nuxt";
import "nuxt";

const environment
  = isDevelopment
    ? Env.Dev
    : process.env.CF_PAGES_BRANCH === "main"
      ? Env.Prod
      : process.env.CF_PAGES_BRANCH
        ?? "unknown";

const sentryReleaseName = process.env.CF_PAGES_COMMIT_SHA ?? "unknown commit";

const isHubEnabled = process.env.NUXT_NITRO_PRESET !== "node-server";

const preset = isHubEnabled || isDevelopment;

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
    "@vite-pwa/nuxt",
    "nuxt-auth-utils",
    "@vueuse/motion/nuxt",
    "nuxt-authorization",
    "nuxt-vue-dragscroll",
    "nuxt-vitalizer",
    "@sentry/nuxt/module",
    // #TODO: maybe remove this
    ...(preset ? ["@nuxthub/core"] : []),
    "~~/modules/build-env",
    "stale-dep/nuxt",
  ],

  $development: {
    site: {
      url: "http://localhost:3000",
      name: "WolfStar (Development)",
    },
  },

  $production: {

    modules: ["nuxt-security"],
    scripts: {
      registry: {
        cloudflareWebAnalytics: true,
      },
    },
    security: {
      headers: {
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: {
          "default-src": ["'self'"],
          "base-uri": ["'self'"],
          "connect-src": ["'self'", "https:", "http:", "wss:", "ws:"],
          "font-src": ["'self'"],
          "form-action": ["'none'"],
          "frame-ancestors": ["'none'"],
          "frame-src": ["https:"],
          "img-src": ["'self'", "https:", "http:", "data:", "blob:"],
          "manifest-src": ["'self'"],
          "media-src": ["'self'", "https:", "http:"],
          "object-src": ["'none'"],
          "script-src": ["'self'", "'wasm-unsafe-eval'", "'nonce-{generated-nonce}'"],
          "script-src-attr": ["'none'"],
          "style-src": ["'self'", "'unsafe-inline'"],
          "upgrade-insecure-requests": true,
        },
        permissionsPolicy: {
          fullscreen: "*",
        },
      },
      rateLimiter: false,
    },
    sentry: {
      unstable_sentryBundlerPluginOptions: {
        telemetry: false,
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
        { "http-equiv": "Page-Enter", "content": "RevealTrans(Duration=2.0,Transition=2)" },
        { "http-equiv": "Page-Exit", "content": "RevealTrans(Duration=3.0,Transition=12)" },

        // Mobile specific (only keep if not in seo.meta)
        { name: "HandheldFriendly", content: "True" },

        // Microsoft specific (only keep if not in seo.meta)
        { name: "application-name", content: "WolfStar" },
        { name: "msapplication-TileImage", content: "/icons/mstile-144x144.png" },

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
  runtimeConfig: generateRuntimeConfig(),

  routeRules: {
    "/api/**": {
      cors: true,
    },
  },

  sourcemap: {
    client: "hidden",
  },

  experimental: {
    viewTransition: true,
    payloadExtraction: false,
    typedPages: true,
  },

  compatibilityDate: "2025-07-20",
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
      external: process.env.NUXT_NITRO_PRESET !== "node-server" ? ["pg-native", "node:fs"] : undefined,
    },
    openAPI: {
      // OpenAPI configuration
      meta: {
        title: "WolfStar API",
        description: "WolfStar API documentation",
        version: "1.0.0",
      },
      route: "/_docs/openapi.json",
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
  ...(
    preset
      ? {
          hub: {
            workers: true,
            cache: true,
          } as Partial<NuxtHubModuleOptions>,
        }
      : {}),

  vite: {
    build: {
      target: "esnext",
    },
    optimizeDeps: {
      include: [
        "@vueuse/shared",
        "@sapphire/utilities",
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
        "@sapphire/utilities",
        "@sapphire/bitfield",
        "@sapphire/snowflake",
        "@sapphire/async-queue",
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "@sapphire/utilities/isNullish",
      ],
    },
  },

  postcss: {
    plugins: {
      "postcss-nested": {},
      "postcss-nesting": {},
    },
  },

  hooks: {
    "pages:extend": function (pages) {
      const pagesToRemove: NuxtPage[] = [];
      pages.forEach((page) => {
        if (page.path.includes("component") || page.path.includes("/api")) {
          pagesToRemove.push(page);
        }
      });

      pagesToRemove.forEach((page) => {
        pages.splice(pages.indexOf(page), 1);
      });
      // Uncomment to show current Routes
      // console.log(`\nCurrent Routes:`)
      // console.log(pages)
      // console.log(`\n`)
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
        dir: "./app/assets/icons",
      },
    ],
    serverBundle: {
      collections: ["ph", "ic", "heroicons", "lucide"],
    },
    clientBundle: {
      scan: {
        globInclude: ["**\/*.{vue,jsx,tsx,md,mdc,mdx}", "app/**/*.ts"],
      },
    },
  },

  image: {
    screens: {},
  },

  ogImage: {
    zeroRuntime: true,
  },
  // PWA configuration
  pwa,

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
    sourceMapsUploadOptions: generateRuntimeConfig().sentry,
  },

  seo: {
    meta: {
      description: "WolfStar is a multipurpose Discord bot designed to handle most tasks, helping users manage their servers easily.",
      author: "WolfStar Project, contact@wolfstar.rocks",
      colorScheme: "dark light",
      applicationName: "WolfStar",
      ogSiteName: "WolfStar",
      ogLocale: "en",
      ogType: "website",
      ogUrl: "https://wolfstar.rocks",
      ogTitle: "WolfStar",
      ogDescription: "WolfStar is a multipurpose Discord bot designed to handle most tasks, helping users manage their servers easily.",
      robots: "archive,follow,imageindex,index,odp,snippet,translate",
      msapplicationConfig: "/browserconfig.xml",
      mobileWebAppCapable: "yes",
      appleMobileWebAppStatusBarStyle: "black",
    },
  },
  sitemap: {
    ...(isHubEnabled
      ? { runtimeCacheStorage: {
          driver: "cloudflare-kv-binding",
          binding: "OG_IMAGE_CACHE",
        } }
      : {}),
    exclude: ["/join", "/oauth/guild", "/oauth/callback", "/[...id]"],
  },
});
