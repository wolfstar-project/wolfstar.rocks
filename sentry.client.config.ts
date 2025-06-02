import * as Sentry from '@sentry/nuxt';
import { isDevelopment } from 'std-env';

if (useRuntimeConfig().public.sentry.dsn) {
	Sentry.init({
		dsn: useRuntimeConfig().public.sentry.dsn,
		integrations: [
			// Base client integrations
			Sentry.browserTracingIntegration({
				enableInp: true,
				enableLongAnimationFrame: true
			}),
			Sentry.replayIntegration({
				// Mask sensitive data
				maskAllInputs: true,
				maskAllText: false,
				blockAllMedia: true
			}),
			Sentry.browserProfilingIntegration(),
			Sentry.piniaIntegration(usePinia()),
			// Enhanced feedback integration
			Sentry.feedbackIntegration({
				colorScheme: 'system',
				showBranding: false
			})
		],
		tracesSampleRate: isDevelopment ? 1.0 : 0.1,
		profilesSampleRate: isDevelopment ? 1.0 : 0.1,
		normalizeDepth: 10,

		// Enhanced session replay configuration
		replaysSessionSampleRate: isDevelopment ? 1.0 : 0.1,
		replaysOnErrorSampleRate: 1.0,

		// Enhanced configuration
		environment: useRuntimeConfig().public.environment,

		// Enhanced error filtering
		beforeSend(event, hint) {
			// Filter out non-critical errors
			const error = hint.originalException;

			// Skip network errors that are likely user-caused
			if (error instanceof Error) {
				if (error.message.includes('Network request failed') && error.message.includes('aborted')) {
					return null;
				}

				// Skip chunk loading errors (handled by Nuxt)
				if (error.message.includes('Loading chunk')) {
					return null;
				}

				// Skip ResizeObserver errors (browser quirks)
				if (error.message.includes('ResizeObserver loop limit exceeded')) {
					return null;
				}
			}

			return event;
		},

		// Enhanced breadcrumb filtering
		beforeBreadcrumb(breadcrumb) {
			// Filter out noisy breadcrumbs
			if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
				return null;
			}

			return breadcrumb;
		},

		// Additional configuration
		ignoreErrors: [
			// Browser extensions
			'top.GLOBALS',
			// Random plugins/extensions
			'originalCreateNotification',
			'canvas.contentDocument',
			'MyApp_RemoveAllHighlights',
			// Facebook borked
			'fb_xd_fragment',
			// ISP "optimizing" proxy - `Cache-Control: no-transform` seems to reduce this. (thanks @acdha)
			// See http://stackoverflow.com/questions/4113268
			'bmi_SafeAddOnload',
			'EBCallBackMessageReceived',
			// See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
			'conduitPage'
		]
	});
}
