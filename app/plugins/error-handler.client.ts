export default defineNuxtPlugin(async (nuxtApp) => {
	const { handleError, handleVueError, setSentryUser } = await useErrorHandler();

	// Global Vue error handler
	nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
		handleVueError(error, instance, info);
	};

	// Nuxt Vue error hook
	nuxtApp.hook('vue:error', (error, instance, info) => {
		handleVueError(error, instance, info);
	});

	// Nuxt app error hook
	nuxtApp.hook('app:error', (error) => {
		handleError(error, {
			captureToSentry: true,
			logToConsole: true,
			showToast: true,
			tags: {
				errorType: 'app',
				source: 'nuxt-app'
			}
		});
	});

	// Global unhandled promise rejection handler
	if (import.meta.client) {
		window.addEventListener('unhandledrejection', (event) => {
			handleError(event.reason, {
				captureToSentry: true,
				logToConsole: true,
				tags: {
					errorType: 'unhandled-promise',
					source: 'window'
				},
				context: {
					promiseReason: String(event.reason)
				}
			});
		});

		// Global JavaScript error handler
		window.addEventListener('error', (event) => {
			handleError(event.error || event.message, {
				captureToSentry: true,
				logToConsole: true,
				tags: {
					errorType: 'javascript',
					source: 'window',
					filename: event.filename,
					lineno: String(event.lineno),
					colno: String(event.colno)
				},
				context: {
					errorEvent: {
						filename: event.filename,
						lineno: event.lineno,
						colno: event.colno,
						message: event.message
					}
				}
			});
		});

		// Set user context when auth state changes
		const { user } = await useAuth();
		if (user) {
			watch(
				user,
				(user) => {
					if (user) {
						setSentryUser({
							id: user.id,
							username: user.username
						});
					}
				},
				{ immediate: true }
			);
		}
	}
});
