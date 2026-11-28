import * as Sentry from "@sentry/nuxt";
import { isDevelopment } from "std-env";
import { isCloudflareBuild } from "./config/cloudflare";
import { SERVER_DATA_COLLECTION } from "./server/utils/sentry/data-collection";
import { dropExpectedHttpErrors } from "./server/utils/sentry/expected-errors";
import { parseTracesSampleRate } from "./shared/utils/sentry-sample-rate";

// The Node SDK starts before Nitro, so `useRuntimeConfig()` is not there yet:
// read the variables that set `public.sentry` and `public.environment`, with
// the override first, as Nitro would.
const dsn = process.env.NUXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
const environment = process.env.NUXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || "production";

if (dsn && !isCloudflareBuild) {
	Sentry.init({
		dsn,
		beforeSend: dropExpectedHttpErrors,
		dataCollection: SERVER_DATA_COLLECTION,
		// Set tracesSampleRate to 1.0 to capture 100%
		// Of transactions for tracing.
		// We recommend adjusting this value in production
		// Learn more at
		// https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
		tracesSampleRate: isDevelopment
			? 1
			: parseTracesSampleRate(process.env.NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE),

		// Define what the valid targets for trace propagation are
		// Learn more at
		// https://docs.sentry.io/platforms/javascript/configuration/options/#tracePropagationTargets
		tracePropagationTargets: [
			"localhost", // For local development
			/^\/api\//, // For same-origin API calls
			// "https://api.wolfstar.rocks", // For your backend domain
			// "https://api.beta.wolfstar.rocks", // For your backend domain beta
		],

		environment,
	});
}
