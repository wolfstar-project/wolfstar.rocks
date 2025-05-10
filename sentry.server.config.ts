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

            // Performance tracking
            Sentry.httpIntegration({ breadcrumbs: true }),
        ],

        // We recommend adjusting this value in production, or using tracesSampler
        // for finer control
        tracesSampleRate: 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    });
}
