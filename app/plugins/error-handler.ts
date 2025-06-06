export default defineNuxtPlugin(async (nuxtApp) => {
	const { handleError, handleVueError } = await useErrorHandler();

	// Global Vue error handler
	nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
		// eslint-disable-next-line no-console
		console.trace(error);
		handleVueError(error, instance, info);
	};

	// Nuxt Vue error hook
	nuxtApp.hook('vue:error', (error, instance, info) => {
		handleVueError(error, instance, info);

		// eslint-disable-next-line no-console
		console.trace(error);
	});

	// Nuxt app error hook
	nuxtApp.hook('app:error', (error) => {
		// eslint-disable-next-line no-console
		console.trace(error);
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
});
