import * as Sentry from "@sentry/nuxt";
import { isDevelopment } from "std-env";
import { generateRuntimeConfig } from "./server/utils/runtimeConfig";

const { public: { sentry, environment } } = generateRuntimeConfig();

if (sentry.dsn) {
  Sentry.init({
    dsn: sentry.dsn,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for tracing.
    // We recommend adjusting this value in production
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: isDevelopment ? 1.0 : sentry.tracesSampleRate,
    environment,

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
  });
}
