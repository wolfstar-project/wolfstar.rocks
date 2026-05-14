import { promises as fsp } from "node:fs";
import { join } from "node:path";
import { createPostgresAuditDrain } from "#server/utils/audit/postgres-drain";
import { type DrainContext, auditOnly, signed } from "evlog";
import { createFsDrain } from "evlog/fs";
import { createDrainPipeline } from "evlog/pipeline";
import { createSentryDrain } from "evlog/sentry";

const AUDIT_DIR = join(process.cwd(), ".audit");
const AUDIT_HEAD_FILE = join(AUDIT_DIR, "head");

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
				tasks.push({
					promise: Promise.resolve(auditOnly(postgresAudit)(ctx)),
					tag: "postgres",
					ctx,
				});
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

	// Secondary tamper-evident FS journal alongside the Postgres hash-chain.
	// auditOnly filters to audit events only; signed wraps with a cross-process
	// hash-chain (head hash persisted to disk); await:true flushes before the
	// response returns so no audit event is lost on crash or unhandled rejection.
	const signedFsDrain = signed(createFsDrain({ dir: AUDIT_DIR }), {
		strategy: "hash-chain",
		state: {
			load: () => fsp.readFile(AUDIT_HEAD_FILE, "utf8").catch(() => null),
			save: (h) => fsp.writeFile(AUDIT_HEAD_FILE, h, "utf8"),
		},
	});
	nitroApp.hooks.hook("evlog:drain", auditOnly(signedFsDrain, { await: true }));

	nitroApp.hooks.hook("close", async () => {
		await drain.flush();
	});
});
