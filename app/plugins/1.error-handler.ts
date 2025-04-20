import type { H3Error } from 'h3';
import * as Sentry from '@sentry/nuxt';

export default defineNuxtPlugin((nuxtApp) => {
	// Gestione degli errori lato client
	nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
		const error = err as Error & { statusCode?: number; response?: { status: number } };
		const statusCode = error?.statusCode ?? error?.response?.status ?? 500;

		Sentry.captureException(error, {
			extra: {
				componentName: instance?.$.type?.name,
				info,
				statusCode
			}
		});

		useLogger().error('Error:', error);
	};

	// Hook per errori Vue (opzionale)
	nuxtApp.hook('vue:error', (error, instance, info) => {
		Sentry.captureException(error, {
			extra: {
				componentName: instance?.$.type?.name,
				info
			}
		});
	});

	// Gestione degli errori lato server
	if (import.meta.server) {
		nuxtApp.hooks.hook('app:error', (error: H3Error) => {
			error.unhandled = false;
			// Send server-side error to Sentry
			Sentry.captureException(error);

			// Log the error
			useLogger().error('Server error:', error);
		});
	}
});
