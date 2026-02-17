import type { DrainContext } from "evlog";
import { createDrainPipeline } from "evlog/pipeline";
import { createSentryDrain } from "evlog/sentry";

export default defineNitroPlugin((nitroApp) => {
	const pipeline = createDrainPipeline<DrainContext>();
	const drain = pipeline(
		createSentryDrain({
			dsn: runtimeConfig.public.sentry.dsn,
			environment: runtimeConfig.public.environment,
		}),
	);

	nitroApp.hooks.hook("evlog:drain", drain);
	nitroApp.hooks.hook("close", () => drain.flush());
});
