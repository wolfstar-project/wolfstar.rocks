import * as Sentry from '@sentry/nuxt';

if (process.env.SENTRY_DSN) {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		integrations: [
			// Base server integrations
			Sentry.consoleIntegration(),
			Sentry.functionToStringIntegration(),
			Sentry.linkedErrorsIntegration(),
			Sentry.onUncaughtExceptionIntegration(),
			Sentry.onUnhandledRejectionIntegration(),

			// Server-specific integrations
			Sentry.prismaIntegration(),

			// Enhanced performance tracking
			Sentry.httpIntegration({
				breadcrumbs: true
			}),

			// Node.js specific integrations
			Sentry.nodeContextIntegration(),
			Sentry.localVariablesIntegration({
				captureAllExceptions: false,
				maxExceptionsPerSecond: 5
			})
		],

		// Enhanced sampling configuration
		tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
		profilesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

		// Enhanced configuration
		environment: process.env.NODE_ENV || 'unknown',
		release: process.env.BUILD_VERSION || 'unknown',

		// Server-specific error filtering
		beforeSend(event, hint) {
			// Filter out non-critical server errors
			const error = hint.originalException;

			if (error instanceof Error) {
				// Skip certain known issues
				if (error.message.includes('ECONNRESET')) {
					return null;
				}

				// Skip timeout errors that are likely client-caused
				if (error.message.includes('timeout') && error.message.includes('client')) {
					return null;
				}
			}

			return event;
		},

		// Enhanced server context
		initialScope: {
			tags: {
				component: 'wolfstar-server',
				runtime: 'node'
			}
		},

		// Performance optimizations
		maxBreadcrumbs: 50,
		attachStacktrace: true,
		sendDefaultPii: false
	});
}
