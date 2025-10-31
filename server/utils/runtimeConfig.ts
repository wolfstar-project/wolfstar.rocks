import type { NitroRuntimeConfig } from "nitropack/types";
import { config } from "@dotenvx/dotenvx";
import { cast } from "@sapphire/utilities/cast";

let runtimeConfigInstance: NitroRuntimeConfig;

export function generateRuntimeConfig() {
  return {
    preset: process.env.NUXT_NITRO_PRESET,
    public: {
      clientId: process.env.NUXT_OAUTH_DISCORD_CLIENT_ID,
      environment: process.env.NODE_ENV ?? process.env.SENTRY_ENVIRONMENT ?? "production",
      app: {
        version: process.env.NUXT_PUBLIC_APP_VERSION,
        apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
      },
      sentry: {
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE ? Number(process.env.NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE) : 0.2,
      },
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
  };
}

if (typeof useRuntimeConfig !== "undefined") {
  runtimeConfigInstance = useRuntimeConfig();
}
else {
  config();
  runtimeConfigInstance = cast<NitroRuntimeConfig>(generateRuntimeConfig());
}

export const runtimeConfig = runtimeConfigInstance;
