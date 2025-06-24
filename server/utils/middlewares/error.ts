import type { EventHandler, EventHandlerRequest, H3Event } from 'h3';
import { createError, defineEventHandler } from 'h3';
import { getErrorMessage, getErrorStatusCode } from '~~/server/utils';

/**
 * Utility function to handle errors manually in API routes
 *
 * @param error - The error to handle
 * @param event - The Nitro event handler
 * @param context - Additional context for the error
 */
export function handleServerError(error: unknown, event: H3Event, context?: Record<string, any>) {
	// Log for debugging
	useLogger('API').error('Server Error:', {
		error: error instanceof Error ? error.message : String(error),
		url: event.node.req.url,
		method: event.node.req.method,
		context
	});

	// Determine status code
	const statusCode = getErrorStatusCode(error) || 500;
	const message = getErrorMessage(error);

	throw createError({
		statusCode,
		message
	});
}

/**
 * Wrapper to handle async errors in API routes
 */
export function defineWrappedHandlingError<T extends EventHandlerRequest, D>(
	handler: EventHandler<T, D>,
	context?: Record<string, any>
): EventHandler<T, D> {
	return defineEventHandler<T>(async (event) => {
		try {
			return await handler(event);
		} catch (error) {
			handleServerError(error, event, context);
		}
	});
}
