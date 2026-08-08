import * as Sentry from "@sentry/nuxt";
import { isDevelopment } from "std-env";
import { generateRuntimeConfig } from "./server/utils/runtimeConfig";

const {
	public: { sentry, environment },
} = generateRuntimeConfig();

const EXPECTED_HTTP_STATUSES = new Set([400, 401, 403, 404, 409, 429]);

/**
 * Matches only errors the application deliberately created via `createError()`.
 * The `__h3_error__` constructor marker alone is not enough: h3 normalizes
 * every foreign exception (e.g. ofetch `FetchError`s from the bot API) with
 * `createError()` before invoking Nitro's error hooks, so those wrappers carry
 * the marker too. h3 flags normalized wrappers with `unhandled: true`, while
 * deliberate `createError()` throws keep the default `unhandled: false`, so
 * upstream dependency failures stay visible in Sentry.
 */
function isApplicationHttpError(exception: unknown): exception is { statusCode: unknown } {
	if (typeof exception !== "object" || exception === null) return false;
	if ((exception.constructor as { __h3_error__?: boolean } | undefined)?.__h3_error__ !== true)
		return false;
	return (exception as { unhandled?: unknown }).unhandled !== true;
}

/**
 * Application-generated H3 errors always carry a numeric `statusCode`, so no
 * fallback to `event.contexts.response` is needed. Relying on the outgoing
 * response status would wrongly drop unexpected statusless exceptions captured
 * late in a request (e.g. an unhandled rejection after a 404/429 response).
 */
function getApplicationHttpStatus(hint: Sentry.EventHint): number | undefined {
	const exception = hint.originalException;

	if (!isApplicationHttpError(exception)) return undefined;

	const status = exception.statusCode;
	return typeof status === "number" ? status : undefined;
}

if (sentry.dsn) {
	Sentry.init({
		dsn: sentry.dsn,
		beforeSend(event, hint) {
			const status = getApplicationHttpStatus(hint);
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
