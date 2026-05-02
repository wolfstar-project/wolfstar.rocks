import { createPostgresAuditDrain } from "#server/utils/audit/postgres-drain";
import { type DrainContext } from "evlog";
import { createDrainPipeline } from "evlog/pipeline";
import { createSentryDrain } from "evlog/sentry";

export default defineNitroPlugin((nitroApp) => {
	const config = useRuntimeConfig();
	const postgresAudit = createPostgresAuditDrain();

	const auditPipeline = createDrainPipeline<DrainContext>({ batch: { size: 50, intervalMs: 5000 } });
	const auditDrain = auditPipeline(async (batch) => {
		const auditBatch = batch.filter((ctx) => ctx.event.audit);
		const results = await Promise.allSettled(
			auditBatch.map((ctx) => Promise.resolve(postgresAudit(ctx))),
		);
		for (const [index, result] of results.entries()) {
			if (result.status === "rejected") {
				console.error(
					"[evlog] postgres audit drain failed, event not persisted:",
					result.reason,
					{ action: auditBatch[index]?.event.audit?.action },
				);
			}
		}
	});

	nitroApp.hooks.hook("evlog:drain", auditDrain);

	if (config.public.sentry.dsn) {
		const sentry = createSentryDrain();
		const sentryPipeline = createDrainPipeline<DrainContext>({ batch: { size: 50, intervalMs: 5000 } });
		const sentryDrain = sentryPipeline(async (batch) => {
			const results = await Promise.allSettled(
				batch.map((ctx) => Promise.resolve(sentry(ctx))),
			);
			for (const result of results) {
				if (result.status === "rejected") {
					console.warn("[evlog] sentry drain failed:", result.reason);
				}
			}
		});

		nitroApp.hooks.hook("evlog:drain", sentryDrain);
		nitroApp.hooks.hook("close", async () => {
			await sentryDrain.flush();
		});
	}

	nitroApp.hooks.hook("close", async () => {
		await auditDrain.flush();
	});
});
