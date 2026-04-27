import { createPostgresAuditDrain } from "#server/utils/audit/postgres-drain";
import { type DrainContext } from "evlog";
import { createDrainPipeline } from "evlog/pipeline";
import { createSentryDrain } from "evlog/sentry";

export default defineNitroPlugin((nitroApp) => {
	const config = useRuntimeConfig();
	const sentry = config.public.sentry.dsn ? createSentryDrain() : undefined;
	const postgresAudit = createPostgresAuditDrain();

	const pipeline = createDrainPipeline<DrainContext>({
		batch: { size: 50, intervalMs: 5000 },
	});

	const drain = pipeline(async (batch) => {
		const tasks: Promise<any>[] = [];

		for (const ctx of batch) {
			// 1. If the event is an audit event, send it to Postgres
			if (ctx.event.audit) {
				// Wrap in Promise.resolve because the drain can be sync or async
				tasks.push(Promise.resolve(postgresAudit(ctx)));
			}

			// 2. Send the event to Sentry
			if (sentry) {
				tasks.push(Promise.resolve(sentry(ctx)));
			}
		}

		// Execute all writes in parallel for this batch
		await Promise.allSettled(tasks);
	});

	nitroApp.hooks.hook("evlog:drain", drain);

	nitroApp.hooks.hook("close", async () => {
		await drain.flush();
	});
});
