import type { EventHandler, EventHandlerRequest, H3Event } from 'h3';
import { captureException, withScope } from '@sentry/nuxt';
import { getErrorMessage, getErrorStatusCode } from '~~/server/utils';

/**
 * Utility function to handle errors manually in API routes
 *
 * @param error - The error to handle
 * @param event - The Nitro event handler
 * @param context - Additional context for the error
 */
export function handleServerError(error: unknown, event: H3Event, context?: Record<string, any>) {
	const errorInfo = {
		url: event.node.req.url,
		method: event.node.req.method,
		headers: event.node.req.headers,
		timestamp: new Date().toISOString(),
		userAgent: event.node.req.headers['user-agent'],
		ip: event.node.req.headers['x-forwarded-for'] || event.node.req.socket?.remoteAddress || 'unknown',
		context: context || {}
	};

	// Log for debugging
	console.error('Server API Error:', {
		error: error instanceof Error ? error.message : String(error),
		url: event.node.req.url,
		method: event.node.req.method,
		context
	});

	// Send to Sentry
	withScope((scope) => {
		scope.setContext('serverError', errorInfo);
		scope.setTag('errorType', 'manual-server-api');
		scope.setTag('endpoint', event.node.req.url || 'unknown');
		scope.setTag('method', event.node.req.method || 'unknown');

		// Add tags from context if present
		if (context) {
			Object.entries(context).forEach(([key, value]) => {
				if (typeof value === 'string') {
					scope.setTag(key, value);
				}
			});
		}

		captureException(error);
	});

	// Determine status code
	const statusCode = getErrorStatusCode(error) || 500;
	const message = getErrorMessage(error);

	throw createError({
		statusCode,
		statusMessage: message
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
			throw error; // TypeScript placeholder, will never reach this point
		}
	});
}
