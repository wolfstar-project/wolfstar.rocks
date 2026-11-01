import { EvlogError } from "evlog";
import { isError } from "h3";
import { EXPECTED_HTTP_STATUSES } from "~~/server/utils/sentry-expected-errors";

/**
 * Whether the app answered with this error on purpose: a refusal made with
 * h3's or evlog's `createError()`, with one of the statuses Sentry drops too.
 *
 * h3 wraps every error that is not its own before Nitro's `error` hook sees
 * it, and flags the wrapper `unhandled`. evlog's errors are wrapped too, so a
 * wrapper counts only when its cause is one. A foreign error with a client
 * status, such as an ofetch error from the bot API, stays an error.
 */
function isRefusal(error: unknown): boolean {
	if (!isError(error) || !EXPECTED_HTTP_STATUSES.has(error.statusCode)) return false;
	return error.unhandled !== true || EvlogError.isEvlogError(error.cause);
}

/**
 * Logs the requests the app refused on purpose at warn. evlog logs a request
 * that ends in an error at error, so every 409 from the skew guard, 429 from
 * the rate limiter and 404 for an unknown route became a Worker issue.
 *
 * The hook is registered synchronously, so it runs before evlog's own `error`
 * hook, which evlog registers once its configuration has loaded and which
 * emits the event.
 */
export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook("error", (error, { event }) => {
		if (event && isRefusal(error)) event.context.log?.setLevel("warn");
	});
});
