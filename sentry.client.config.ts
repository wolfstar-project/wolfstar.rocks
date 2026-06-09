import * as Sentry from "@sentry/nuxt";
import { isDevelopment } from "std-env";

const {
	public: { sentry, environment },
} = useRuntimeConfig();

if (sentry.dsn) {
	Sentry.init({
		// If set up, you can use the Nuxt runtime config here
		// Dsn: useRuntimeConfig().public.sentry.dsn
		// Modify depending on your custom runtime config
		dsn: sentry.dsn,
		// Specify a set of allowed URLs to reduce noise from third-party services
		// https://docs.sentry.io/platforms/javascript/guides/nuxt/configuration/options/#allowurls
		allowUrls: [/https?:\/\/((cdn|www|beta)\.)?wolfstar\.rocks/],

		// Adds request headers and IP for users, for more info visit:
		// https://docs.sentry.io/platforms/javascript/guides/nuxt/configuration/options/#sendDefaultPii
		sendDefaultPii: true,

		// Replay is loaded lazily below to keep its rrweb-based bundle out of the
		// initial critical path; only tracing is initialized eagerly here.
		integrations: [
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
		tracesSampleRate: isDevelopment ? 1 : sentry.tracesSampleRate,

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

	// Defer Session Replay until the browser is idle so its sizable bundle never
	// competes with first paint or hydration. Loaded from the Sentry CDN (allowed
	// by CSP), which also keeps it out of the initial app bundle.
	const loadReplay = () => {
		void Sentry.lazyLoadIntegration("replayIntegration").then((replayIntegration) => {
			Sentry.addIntegration(replayIntegration());
		});
	};

	if (typeof window.requestIdleCallback === "function") {
		window.requestIdleCallback(loadReplay);
	} else {
		setTimeout(loadReplay, 2000);
	}
}
