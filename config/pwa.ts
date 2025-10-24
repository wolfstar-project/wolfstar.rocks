import type { ModuleOptions } from "@vite-pwa/nuxt";
import { isDevelopment } from "std-env";

export const pwa: ModuleOptions = {
  registerType: "autoUpdate",
  includeManifestIcons: true,
  disable: isDevelopment && process.env.VITE_DEV_PWA !== "true",
  devOptions: {
    enabled: process.env.VITE_DEV_PWA === "true",
    type: "module",
  },
  workbox: {
    navigateFallback: "/",
    navigateFallbackDenylist: [/^\/api\/.*/, /^\/oauth\/.*/],
    globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff,woff2}"],
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages-cache",
          networkTimeoutSeconds: 5,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          },
        },
      },
      {
        urlPattern: /^https:\/\/static\.cloudflareinsights\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "cloudflare-insights-cache",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/cdn\.wolfstar\.rocks\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "cdn-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
  manifest: {
    background_color: "#050505",
    categories: [
      "discord",
      "bot",
      "wolfstar",
      "moderation",
      "automation",
      "cyborg",
      "logging",
    ],
    dir: "ltr",
    display: "minimal-ui",
    lang: "en_US",
    name: "WolfStar",
    orientation: "portrait-primary",
    scope: "/",
    short_name: "WolfStar",
    start_url: "/",
    theme_color: "#fd171b",
    shortcuts: [
      {
        name: "WolfStar",
        short_name: "Homepage",
        description: "Go to WolfStar's dashboard",
        url: "/",
        icons: [
          {
            src: "/icons/android-chrome-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "WolfStar Commands",
        short_name: "Commands",
        description: "View WolfStar's commands",
        url: "/commands",
        icons: [
          {
            src: "/icons/android-chrome-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "WolfStar Terms of Service",
        short_name: "Terms of Service",
        description: "Read WolfStar's Terms of Service",
        url: "/terms",
        icons: [
          {
            src: "/icons/android-chrome-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
      {
        name: "WolfStar Privacy Policy",
        short_name: "Privacy Policy",
        description: "Read WolfStar's Privacy Policy",
        url: "/privacy",
        icons: [
          {
            src: "/icons/android-chrome-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
        ],
      },
    ],
  },
};
