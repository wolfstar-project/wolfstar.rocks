import * as Sentry from "@sentry/nuxt";
import { isDevelopment } from "std-env";
import { runtimeConfig } from "./server/utils/runtimeConfig";

Sentry.init({
  dsn: runtimeConfig.public.sentry.dsn,
  tunnel: "/tunnel",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  // We recommend adjusting this value in production
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
  tracesSampleRate: isDevelopment ? 1.0 : 0.7,
});
