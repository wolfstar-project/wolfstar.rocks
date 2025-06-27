export default defineNitroPlugin((nitroApp) => {
	// Global error handler for unhandled errors
	nitroApp.hooks.hook('error', async (error, { event }) => {
		// Skip if it's already handled by middleware
		if (event?.context?.errorHandled) return;

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
		useLogger().error(`Unhandled Server Error: \n${errorInfo.error}`, {
			url: errorInfo.url,
			method: errorInfo.method,
			userAgent: errorInfo.userAgent,
			ip: errorInfo.ip,
			timestamp: errorInfo.timestamp,
			stack: errorInfo.stack
		});

		// Additional error processing can be added here if needed

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
					statusCode: errorInfo.statusCode,
					userAgent: errorInfo.userAgent,
					ip: errorInfo.ip
				});

				// Additional SSR error processing can be added here if needed
			}
		}
	});
});
