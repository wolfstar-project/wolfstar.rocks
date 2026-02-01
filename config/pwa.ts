import type { ModuleOptions } from "@vite-pwa/nuxt";
import { isCI, isDevelopment } from "std-env";

export const pwa: ModuleOptions = {
  mode: isCI ? "production" : "development",
  disable: isDevelopment && process.env.VITE_DEV_PWA !== "true",
  scope: "/",
  srcDir: "../service-worker",
  filename: "sw.ts",
  injectRegister: "auto",
  strategies: "injectManifest",
  registerType: "autoUpdate",
  injectManifest: {
    globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
  },
  pwaAssets: {
    config: false,
  },
  manifest: {
    background_color: "#050505",
    categories: ["discord", "bot", "wolfstar", "moderation", "automation", "cyborg", "logging"],
    dir: "ltr",
    display: "minimal-ui",
    lang: "en_US",
    name: "WolfStar",
    orientation: "portrait-primary",
    short_name: "WolfStar",
    start_url: "/",
    scope: "/",
    theme_color: "#fd171b",
    icons: [
      {
        src: "/icons/android-chrome-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/android-chrome-256x256.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/android-chrome-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable_icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/icons/opengraph.png",
        sizes: "1200x630",
        type: "image/png",
        form_factor: "wide",
        label: "WolfStar Dashboard",
      },
      {
        src: "/icons/apple-splash-portrait-1170x2532.png",
        sizes: "1170x2532",
        type: "image/png",
        form_factor: "narrow",
        label: "WolfStar Mobile",
      },
    ],
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
  devOptions: {
    enabled: process.env.VITE_DEV_PWA === "true",
    type: "module",
  },
  client: {
    installPrompt: true,
    periodicSyncForUpdates: 3600,
  },
};
