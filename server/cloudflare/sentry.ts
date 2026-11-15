import { SERVER_DATA_COLLECTION } from "#server/utils/sentry-data-collection";
import { dropExpectedHttpErrors } from "#server/utils/sentry-expected-errors";
import { sentryCloudflareNitroPlugin } from "@sentry/nuxt/module/plugins";

/**
 * Sentry on the Workers. On Node the SDK is preloaded from
 * `sentry.server.config.ts`, which a Worker cannot do, so the Cloudflare build
 * registers this plugin instead (see `nuxt.config.ts`), with the same options.
 */
export default defineNitroPlugin(
	sentryCloudflareNitroPlugin(() => {
		const { environment, sentry } = useRuntimeConfig().public;
		return {
			beforeSend: dropExpectedHttpErrors,
			dataCollection: SERVER_DATA_COLLECTION,
			dsn: sentry.dsn,
			environment,
			// Same-origin API calls, as on Node.
			tracePropagationTargets: [/^\/api\//],
			tracesSampleRate: sentry.tracesSampleRate,
		};
	}),
);
