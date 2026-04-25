import type { DrainContext } from "evlog";
import { createPostgresAuditDrain } from "#server/utils/audit/postgres-drain";
import { auditOnly, signed } from "evlog";
import { createFsDrain } from "evlog/fs";
import { createDrainPipeline } from "evlog/pipeline";
import { createSentryDrain } from "evlog/sentry";
import { isDevelopment } from "std-env";

export default defineNitroPlugin((nitroApp) => {
	const pipeline = createDrainPipeline<DrainContext>();
	if (runtimeConfig.public.sentry.dsn) {
		const drain = pipeline(createSentryDrain());

		nitroApp.hooks.hook("evlog:drain", drain);
		nitroApp.hooks.hook("close", () => drain.flush());
	}

	// Audit drain — registered unconditionally regardless of Sentry config
	const auditDrain = isDevelopment
		? auditOnly(
				signed(createFsDrain({ dir: ".audit", maxFiles: 30 }), { strategy: "hash-chain" }),
				{
					await: true,
				},
			)
		: auditOnly(createPostgresAuditDrain(), { await: true });
	nitroApp.hooks.hook("evlog:drain", auditDrain);
});
