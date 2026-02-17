import { createSentryDrain } from "evlog/sentry";

export default defineNitroPlugin((nitroApp) => {
	if (!runtimeConfig.public.sentry.dsn) {
		return;
	}
	// Hook evlog drain
	nitroApp.hooks.hook(
		"evlog:drain",
		createSentryDrain({
			dsn: runtimeConfig.public.sentry.dsn,
			environment: "development",
		}),
	);
});
