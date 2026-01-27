import type { NitroRuntimeConfig } from "nitropack/types";
import { cast } from "@sapphire/utilities/cast";
import { config } from "dotenv";

let runtimeConfigInstance: NitroRuntimeConfig;

export function generateRuntimeConfig() {
  return {
    public: {
      clientId: process.env.NUXT_OAUTH_DISCORD_CLIENT_ID,
      environment: process.env.NODE_ENV ?? "production",
      app: {
        apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
      },
      sentry: {
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE ? Number(process.env.NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE) : 0.2,
      },
    },
    session: {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      name: "wolfstar-session",
      password: process.env.NUXT_SESSION_PASSWORD || "",
      cookie: {
        sameSite: "strict" as "lax" | "strict" | "none",
        secure: true,
      },
    },
    cloudflare: {
      accountId: process.env.NUXT_CLOUDFLARE_ACCOUNT_ID,
      namespaceId: process.env.NUXT_CLOUDFLARE_NAMESPACE_ID,
      apiToken: process.env.NUXT_CLOUDFLARE_API_TOKEN,
    },
    sentry: {
      authToken: process.env.SENTRY_AUTH_TOKEN,
      project: process.env.SENTRY_PROJECT,
      org: process.env.SENTRY_ORG,
    },
    discord: {
      clientId: process.env.NUXT_OAUTH_DISCORD_CLIENT_ID,
      clientSecret: process.env.NUXT_OAUTH_DISCORD_CLIENT_SECRET,
      botToken: process.env.NUXT_OAUTH_DISCORD_BOT_TOKEN,
    },
    storage: {
      fsBase: process.env.NUXT_STORAGE_FS_BASE ?? "node_modules/.cache/app",
    },
  };
}

if (typeof useRuntimeConfig !== "undefined") {
  runtimeConfigInstance = useRuntimeConfig();
}
else {
  config({ quiet: true });
  runtimeConfigInstance = cast<NitroRuntimeConfig>(generateRuntimeConfig());
}

export const runtimeConfig = runtimeConfigInstance;
