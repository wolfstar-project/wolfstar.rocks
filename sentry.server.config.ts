import * as Sentry from "@sentry/nuxt";
import { isDevelopment } from "std-env";

if (process.env.SENTRY_DSN && process.env.NUXT_NITRO_PRESET === "node-server") {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for tracing.
    // We recommend adjusting this value in production
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: isDevelopment ? 1.0 : 0.7,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "production",
  });
}
