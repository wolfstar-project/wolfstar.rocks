import * as Sentry from "@sentry/nuxt";
import { isDevelopment } from "std-env";
import { isCloudflareBuild } from "./config/cloudflare";
import { generateRuntimeConfig } from "./server/utils/runtimeConfig";
import { dropExpectedHttpErrors } from "./server/utils/sentry-expected-errors";

const {
	public: { sentry, environment },
} = generateRuntimeConfig();

if (sentry.dsn && !isCloudflareBuild) {
	Sentry.init({
		dsn: sentry.dsn,
		beforeSend: dropExpectedHttpErrors,
		// Set tracesSampleRate to 1.0 to capture 100%
		// Of transactions for tracing.
		// We recommend adjusting this value in production
		// Learn more at
		// https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
		tracesSampleRate: isDevelopment ? 1 : sentry.tracesSampleRate,

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
