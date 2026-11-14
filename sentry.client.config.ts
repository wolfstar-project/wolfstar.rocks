import * as Sentry from "@sentry/nuxt";
import { isDevelopment } from "std-env";
import { CONSENT_COOKIE_IDS, readConsentedIds, readDocumentCookie } from "~/utils/consent";
import { isMarketingPath } from "~/utils/marketing-routes";
import { startSessionReplay } from "~/utils/session-replay";

const {
	public: { sentry, environment, cookieControl },
} = useRuntimeConfig();

const marketingPage = isMarketingPath(location.pathname);

if (sentry.dsn) {
	Sentry.init({
		// If set up, you can use the Nuxt runtime config here
		// Dsn: useRuntimeConfig().public.sentry.dsn
		// Modify depending on your custom runtime config
		dsn: sentry.dsn,
		// Specify a set of allowed URLs to reduce noise from third-party services
		// https://docs.sentry.io/platforms/javascript/guides/nuxt/configuration/options/#allowurls
		allowUrls: [/https?:\/\/((cdn|www|beta|alpha)\.)?wolfstar\.rocks/],

		// Sentry 11 replaced `sendDefaultPii` with `dataCollection`, whose defaults
		// collect more. Keep what `sendDefaultPii: true` sent (user info, headers and
		// cookies, which Sentry still scrubs of secrets) and nothing the SDK did not
		// send before: no request or response bodies.
		dataCollection: { userInfo: true, cookies: true, httpBodies: [] },

		// Replay is loaded lazily below to keep its rrweb-based bundle out of the
		// initial critical path. Browser tracing is skipped on marketing pages to
		// avoid main-thread work competing with LCP hydration.
		integrations: marketingPage
			? []
			: [
					// oxlint-disable-next-line import/namespace
					Sentry.browserTracingIntegration({
						beforeStartSpan: (context) => ({
							...context,
							name: location.pathname
								.replace(/\/\d{15,21}/g, "/:id")
								.replace(/\/[a-f0-9]{32}/gi, "/:id"),
						}),
						shouldCreateSpanForRequest: (url) =>
							!url.includes("_nuxt_icon") &&
							!url.includes("__nuxt_error") &&
							!url.includes("/health"),
						enableInp: true,
					}),
				],

		// Set tracesSampleRate to 1.0 to capture 100%
		// Of transactions for tracing.
		// We recommend adjusting this value in production
		// Learn more at
		// https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
		tracesSampleRate: marketingPage ? 0 : isDevelopment ? 1 : sentry.tracesSampleRate,

		// Define what the valid targets for trace propagation are
		// Learn more at
		// https://docs.sentry.io/platforms/javascript/configuration/options/#tracePropagationTargets
		tracePropagationTargets: [
			"localhost", // For local development
			/^\/api\//, // For same-origin API calls
			// "https://api.wolfstar.rocks", // For your backend domain
			// "https://api.beta.wolfstar.rocks", // For your backend domain beta
		],

		// Capture Replay for 10% of all sessions,
		// Plus for 100% of sessions with an error
		// Learn more at
		// https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
		replaysSessionSampleRate: 0.1,

		replaysOnErrorSampleRate: 1,
		environment,
	});

	// Session Replay records the screen, so it waits for the visitor's consent
	// (components/consent/). A choice made later in the visit starts it from there.
	const { cookies, cookieNameIsConsentGiven, cookieNameCookiesEnabledIds } = cookieControl;
	const allowsReplay = () =>
		readConsentedIds({
			consentGiven: readDocumentCookie(cookieNameIsConsentGiven),
			enabledIds: readDocumentCookie(cookieNameCookiesEnabledIds),
			allIds: [...cookies.necessary, ...cookies.optional].map((cookie) => cookie.id),
		}).includes(CONSENT_COOKIE_IDS.sessionReplay);

	if (!marketingPage && allowsReplay()) {
		// Defer it until the browser is idle so its sizable bundle never competes
		// with first paint or hydration. The choice is read again then: the visitor
		// may have withdrawn it in the meantime.
		const loadReplay = () => {
			if (allowsReplay()) startSessionReplay(location.pathname);
		};

		if (typeof window.requestIdleCallback === "function") {
			window.requestIdleCallback(loadReplay);
		} else {
			setTimeout(loadReplay, 2000);
		}
	}
}
