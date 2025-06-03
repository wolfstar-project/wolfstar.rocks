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
			userAgent: event ? getRequestHeader(event, 'User-Agent') : 'unknown',
			ip: event ? getClientIP(event) : 'unknown',
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined
		};

		// Log the error
		useLogger().error(
			`Unhandled Server Error: \n${errorInfo.error} \n URL: ${errorInfo.url} \n Method: ${errorInfo.method} \n User Agent: ${errorInfo.userAgent} \n IP: ${errorInfo.ip}`
		);

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
				timestamp: new Date().toISOString(),
				userAgent: event ? getRequestHeader(event, 'User-Agent') : 'unknown',
				ip: event ? getClientIP(event) : 'unknown',
				statusCode: response.statusCode
			};

			// Only log server errors for render responses
			if (response.statusCode >= 500) {
				useLogger().error('SSR Error:', {
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
