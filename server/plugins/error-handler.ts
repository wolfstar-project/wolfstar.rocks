import { captureException, withScope } from '@sentry/nuxt';

export default defineNitroPlugin((nitroApp) => {
	// Global error handler for unhandled errors
	nitroApp.hooks.hook('error', async (error, { event }) => {
		// Skip if it's already handled by middleware
		if (event?.context?.errorHandled) 
return;

		const errorInfo = {
			url: event?.node?.req?.url || 'unknown',
			method: event?.node?.req?.method || 'unknown',
			timestamp: new Date().toISOString(),
			userAgent: event?.node?.req?.headers?.['user-agent'] || 'unknown',
			ip: getClientIP(event),
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined
		};

		// Log the error
		console.error('Unhandled Server Error:', {
			url: errorInfo.url,
			method: errorInfo.method,
			error: errorInfo.error
		});

		// Send to Sentry
		withScope((scope) => {
			scope.setContext('unhandledError', errorInfo);
			scope.setTag('errorType', 'unhandled-server');
			scope.setTag('endpoint', errorInfo.url);
			scope.setTag('method', errorInfo.method);
			scope.setLevel('error');

			// Set fingerprint for better grouping
			scope.setFingerprint(['unhandled-error', errorInfo.method, errorInfo.url]);

			captureException(error);
		});

		// Mark as handled to prevent duplicate processing
		if (event?.context) {
			event.context.errorHandled = true;
		}
	});

	// Hook for render errors (SSR)
	nitroApp.hooks.hook('render:response', async (response, { event }) => {
		if (response.statusCode && response.statusCode >= 400) {
			const errorInfo = {
				url: event?.node?.req?.url || 'unknown',
				method: event?.node?.req?.method || 'unknown',
				statusCode: response.statusCode,
				timestamp: new Date().toISOString(),
				userAgent: event?.node?.req?.headers?.['user-agent'] || 'unknown',
				ip: getClientIP(event)
			};

			// Only log server errors for render responses
			if (response.statusCode >= 500) {
				console.error('SSR Error:', {
					url: errorInfo.url,
					method: errorInfo.method,
					statusCode: errorInfo.statusCode
				});

				withScope((scope) => {
					scope.setContext('ssrError', errorInfo);
					scope.setTag('errorType', 'ssr-render');
					scope.setTag('endpoint', errorInfo.url);
					scope.setTag('statusCode', String(errorInfo.statusCode));
					scope.setLevel('error');

					captureException(new Error(`SSR Error ${errorInfo.statusCode}: ${errorInfo.url}`));
				});
			}
		}
	});
});

/**
 * Get client IP safely
 */
function getClientIP(event: any): string {
	if (!event?.node?.req?.headers) 
return 'unknown';

	const forwarded = event.node.req.headers['x-forwarded-for'];
	if (forwarded) {
		return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
	}

	return event.node.req.headers['x-real-ip'] || event.node.req.socket?.remoteAddress || 'unknown';
}
