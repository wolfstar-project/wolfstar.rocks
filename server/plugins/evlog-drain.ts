import type { DrainContext, DrainFn } from "evlog";
import { createPostgresAuditDrain } from "#server/utils/audit/postgres-drain";
import { signed } from "evlog";
import { createFsDrain } from "evlog/fs";
import { createDrainPipeline } from "evlog/pipeline";
import { createSentryDrain } from "evlog/sentry";
import { isDevelopment } from "std-env";
import consola from "consola";

type FlushableDrain = DrainFn & { flush?: () => Promise<void> };

/**
 * Wraps a drain so it only receives events that carry an `audit` payload.
 * Non-audit events (regular logs, errors) are silently dropped.
 * The `flush` method from `baseDrain` is forwarded when present.
 *
 * @param baseDrain - The underlying drain to forward audit events to.
 * @returns A new drain that filters to audit-only events, with `flush` preserved.
 */
function auditOnly(baseDrain: FlushableDrain): FlushableDrain {
	const fn = async (ctx: DrainContext): Promise<void> => {
		if (!ctx.event.audit) return;
		await baseDrain(ctx);
	};
	if (baseDrain.flush) {
		return Object.assign(fn, { flush: () => baseDrain.flush!() });
	}
	return fn;
}

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
			)
		: auditOnly(createPostgresAuditDrain());
	nitroApp.hooks.hook("evlog:drain", auditDrain);
	nitroApp.hooks.hook("close", async () => {
		try {
			await auditDrain.flush?.();
		} catch (err) {
			consola.error("[audit] Failed to flush audit drain on close", err);
		}
	});
});
