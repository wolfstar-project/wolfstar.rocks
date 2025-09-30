import type { ModuleOptions as NuxtHubModuleOptions } from "@nuxthub/core";
import type { NuxtPage } from "nuxt/schema";
import { isDevelopment, isWindows } from "std-env";
import { getEnv } from "./config/env";
import { pwa } from "./config/pwa";
import { generateRuntimeConfig } from "./server/utils/runtimeConfig";
import "@vite-pwa/nuxt";
import "nuxt";

const { env, commit } = await getEnv();
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
    "@sentry/nuxt/module",
    // #TODO: maybe remove this
    ...(preset ? ["@nuxthub/core"] : []),
    "nuxt-auth-utils",
    "nuxt-authorization",
    "nuxt-vitalizer",
    ...(isDevelopment || isWindows) ? [] : ["nuxt-security"],
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
  runtimeConfig: generateRuntimeConfig(),

  routeRules: {
    "/": { prerender: true },
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
      external: process.env.NUXT_NITRO_PRESET !== "node-server" ? ["pg-native"] : undefined,
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
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-ignore nuxt-security is conditional
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
        "script-src": ["'self'", "'wasm-unsafe-eval'", "'nonce-{generated-nonce}'", "https://static.cloudflareinsights.com"],
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
    release: {
      name: commit,
      deploy: {
        env,
        url: process.env.CF_PAGES_URL,
      },
    },
    ...generateRuntimeConfig().sentry,
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
    exclude: ["/join", "/oauth/guild", "/oauth/callback", "/[...id]"],
  },
});
