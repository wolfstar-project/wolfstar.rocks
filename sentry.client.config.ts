import * as Sentry from '@sentry/nuxt';

if (useRuntimeConfig().public.sentry.dsn) {
	Sentry.init({
		dsn: useRuntimeConfig().public.sentry.dsn,
		integrations: [
			// Base client integrations
			Sentry.browserTracingIntegration(),
			Sentry.replayIntegration(),
			Sentry.browserProfilingIntegration(),

			// Vue specific integrations
			Sentry.vueIntegration({
				tracingOptions: {
					trackComponents: true
				}
			})
		],
		tracesSampleRate: 1.0,

		// This sets the sample rate to be 10%. You may want this to be 100% while
		// in development and sample at a lower rate in production
		replaysSessionSampleRate: 0.1,

		// If the entire session is not sampled, use the below sample rate to sample
		// sessions when an error occurs.
		replaysOnErrorSampleRate: 1.0,
		debug: true,
		environment: useRuntimeConfig().public.environment
	});
}
