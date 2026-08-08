import * as Sentry from "@sentry/nuxt";
import { isDevelopment } from "std-env";
import { generateRuntimeConfig } from "./server/utils/runtimeConfig";

const {
	public: { sentry, environment },
} = generateRuntimeConfig();

const EXPECTED_HTTP_STATUSES = new Set([400, 401, 403, 404, 409, 429]);

function getHttpStatus(event: Sentry.ErrorEvent, hint: Sentry.EventHint): number | undefined {
	const originalException = hint.originalException;

	if (originalException && typeof originalException === "object") {
		const exception = originalException as Record<string, unknown>;
		const status = exception.statusCode ?? exception.status;

		if (typeof status === "number") return status;
	}

	const responseStatus = event.contexts?.response?.status_code;
	return typeof responseStatus === "number" ? responseStatus : undefined;
}

if (sentry.dsn) {
	Sentry.init({
		dsn: sentry.dsn,
		beforeSend(event, hint) {
			const status = getHttpStatus(event, hint);
			return status !== undefined && EXPECTED_HTTP_STATUSES.has(status) ? null : event;
		},
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
