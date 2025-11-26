import type { ModuleOptions } from "@vite-pwa/nuxt";

export const pwa: ModuleOptions = {
  registerType: "autoUpdate",
  includeManifestIcons: true,
  disable: process.env.VITE_DEV_PWA !== "true" && process.env.NODE_ENV === "development",
  devOptions: {
    enabled: process.env.VITE_DEV_PWA === "true",
    type: "module",
  },
  workbox: {
    navigateFallback: "/",
    globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /^https:\/\/cdn\.wolfstar\.rocks\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "wolfstar-cdn-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/cdn\.discordapp\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "discord-cdn-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "images",
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
      {
        urlPattern: /\.(?:js|css)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-resources",
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          },
        },
      },
    ],
  },
  manifest: {
    background_color: "#050505",
    categories: ["discord", "bot", "wolfstar", "moderation", "automation", "cyborg", "logging"],
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
