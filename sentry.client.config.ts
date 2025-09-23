import * as Sentry from "@sentry/nuxt";
import { isDevelopment } from "std-env";
import "nuxt";

const { public: { sentry, environment } } = useRuntimeConfig();

if (sentry.dsn) {
  Sentry.init({
    // If set up, you can use the Nuxt runtime config here
    // dsn: useRuntimeConfig().public.sentry.dsn
    // modify depending on your custom runtime config
    dsn: sentry.dsn,

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

    // Specify a set of allowed URLs to reduce noise from third-party services
    // https://docs.sentry.io/platforms/javascript/guides/nuxt/configuration/options/#allowurls
    allowUrls: [/https?:\/\/((cdn|www)\.)?wolfstar\.rocks/],

    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nuxt/configuration/options/#sendDefaultPii
    sendDefaultPii: true,

    // Replay may only be enabled for the client-side
    integrations: [
      Sentry.replayIntegration(),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for tracing.
    // We recommend adjusting this value in production
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: isDevelopment ? 1.0 : sentry.tracesSampleRate,

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
    replaysSessionSampleRate: 0.1,

    replaysOnErrorSampleRate: 1.0,
    environment,
  });
}
