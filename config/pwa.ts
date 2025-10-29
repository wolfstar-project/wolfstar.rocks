import type { ModuleOptions } from "@vite-pwa/nuxt";

export const pwa: ModuleOptions = {
  registerType: "autoUpdate",
  includeManifestIcons: true,
  devOptions: {
    enabled: process.env.VITE_DEV_PWA === "true",
    type: "module",
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
