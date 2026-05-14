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
		const tasks: Array<{ promise: Promise<unknown>; tag: string; ctx?: DrainContext }> = [];

		for (const ctx of batch) {
			if (ctx.event.audit) {
				tasks.push({ promise: Promise.resolve(postgresAudit(ctx)), tag: "postgres", ctx });
			}

			if (sentry) {
				tasks.push({ promise: Promise.resolve(sentry(ctx)), tag: "sentry" });
			}
		}

		const results = await Promise.allSettled(tasks.map((t) => t.promise));

		for (const [index, result] of results.entries()) {
			if (result.status === "rejected") {
				const task = tasks[index];
				if (task?.tag === "postgres") {
					// eslint-disable-next-line no-console
					console.error(
						"[evlog] postgres audit drain failed, event not persisted:",
						result.reason,
						{ action: task.ctx?.event.audit?.action },
					);
				} else {
					// eslint-disable-next-line no-console
					console.warn("[evlog] sentry drain failed:", result.reason);
				}
			}
		}
	});

	nitroApp.hooks.hook("evlog:drain", drain);

	nitroApp.hooks.hook("close", async () => {
		await drain.flush();
	});
});
