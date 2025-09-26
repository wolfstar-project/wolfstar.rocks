import { sentryCloudflareNitroPlugin } from "@sentry/nuxt/module/plugins";
import { runtimeConfig } from "~~/server/utils/runtimeConfig";

export default defineNitroPlugin(
  ["cloudflare_pages", "cloudflare_module"].includes(runtimeConfig.preset)
    ? sentryCloudflareNitroPlugin((nitroApp) => ({
        dsn: runtimeConfig.public.sentry.dsn,
        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for tracing.
        // We recommend adjusting this value in production
        // Learn more at
        // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
        tracesSampleRate: runtimeConfig.public.sentry.tracesSampleRate,

        // Enable logging for Sentry
        // as it will log useful information to the console
        // Learn more at
        // https://docs.sentry.io/platforms/javascript/guides/nuxt/logs/,
        enableLogs: true,

        beforeSendLog: ({ level, ...log }) => {
          if (level === "info") {
            // Filter out all info logs
            return null;
          }
          return { level, ...log };
        },
        debug: nitroApp.h3App.options.debug,
        environment: runtimeConfig.public.environment,
      }))
    : () => {},
);
