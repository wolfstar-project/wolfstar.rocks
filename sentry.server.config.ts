import * as Sentry from "@sentry/nuxt";
import { isDevelopment } from "std-env";
import { generateRuntimeConfig } from "./server/utils/runtimeConfig";

const {
	public: { sentry, environment },
} = generateRuntimeConfig();

const EXPECTED_HTTP_STATUSES = new Set([400, 401, 403, 404, 409, 429]);

/**
 * Matches only application-generated H3 errors (created via `createError()`),
 * mirroring h3's own `isError()` marker check. Upstream dependency failures
 * (e.g. ofetch `FetchError`s from the bot API) also carry a numeric
 * `status`/`statusCode` but must stay visible in Sentry.
 */
function isApplicationHttpError(exception: unknown): exception is { statusCode: unknown } {
	return (
		typeof exception === "object" &&
		exception !== null &&
		(exception.constructor as { __h3_error__?: boolean } | undefined)?.__h3_error__ === true
	);
}

function getHttpStatus(event: Sentry.ErrorEvent, hint: Sentry.EventHint): number | undefined {
	const originalException = hint.originalException;

	if (isApplicationHttpError(originalException)) {
		const status = originalException.statusCode;

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
