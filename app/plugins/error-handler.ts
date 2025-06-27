export default defineNuxtPlugin(async (nuxtApp) => {
	const { handleError, handleVueError } = await useErrorHandler();

	// Global Vue error handler
	nuxtApp.vueApp.config.errorHandler = (error, instance, info) => handleVueError(error, instance, info);

	// Nuxt Vue error hook
	nuxtApp.hook('vue:error', (error, instance, info) => handleVueError(error, instance, info));

	// Nuxt app error hook
	nuxtApp.hook('app:error', (error) =>
		handleError(error, {
			logToConsole: true,
			showToast: true,
			tags: {
				errorType: 'app',
				source: 'nuxt-app'
			}
		})	);
});
