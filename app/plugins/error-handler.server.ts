export default defineNuxtPlugin(async (nuxtApp) => {
	const { handleError, handleVueError } = await useErrorHandler();

	// Server-side Vue error handler
	nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
		handleVueError(error, instance, info);
	};

	// Nuxt Vue error hook for server
	nuxtApp.hook('vue:error', (error, instance, info) => {
		handleVueError(error, instance, info);
	});

	// Server app error hook
	nuxtApp.hook('app:error', (error) => {
		handleError(error, {
			captureToSentry: true,
			logToConsole: true,
			showToast: false, // No toast on server
			tags: {
				errorType: 'server-app',
				source: 'nuxt-server'
			},
			context: {
				ssrContext: nuxtApp.ssrContext
					? {
							url: nuxtApp.ssrContext.url,
							statusCode: nuxtApp.ssrContext.event?.node?.res?.statusCode
						}
					: undefined
			}
		});
	});

	// Additional server error monitoring
	nuxtApp.hook('app:rendered', () => {
		// Hook for post-render monitoring
		// Errors are already handled by app:error hook
	});

	// Global process error handlers (only in server)
	if (import.meta.server) {
		// Handle uncaught exceptions
		process.on('uncaughtException', (error) => {
			handleError(error, {
				captureToSentry: true,
				logToConsole: true,
				level: 'error',
				tags: {
					errorType: 'uncaught-exception',
					source: 'process'
				}
			});
		});

		// Handle unhandled promise rejections
		process.on('unhandledRejection', (reason, promise) => {
			handleError(reason, {
				captureToSentry: true,
				logToConsole: true,
				level: 'error',
				tags: {
					errorType: 'unhandled-rejection',
					source: 'process'
				},
				context: {
					promise: String(promise)
				}
			});
		});
	}
});
