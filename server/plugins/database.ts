import type { H3Event } from "h3";
import { createDatabase } from "#server/database/prisma";
import { rememberRequestDatabase } from "#server/utils/audit/request-database";
import { runtime } from "std-env";
import { CLOUDFLARE_BINDINGS } from "~~/config/cloudflare";

function isHyperdrive(value: unknown): value is { connectionString: string } {
	return (
		typeof value === "object" &&
		value !== null &&
		"connectionString" in value &&
		typeof value.connectionString === "string"
	);
}

function hyperdriveConnectionString(cloudflare: unknown): string | undefined {
	const env: unknown =
		typeof cloudflare === "object" && cloudflare !== null && "env" in cloudflare
			? cloudflare.env
			: undefined;
	const binding: unknown =
		typeof env === "object" && env !== null
			? Reflect.get(env, CLOUDFLARE_BINDINGS.database)
			: undefined;
	return isHyperdrive(binding) ? binding.connectionString : undefined;
}

/**
 * On Cloudflare Workers, gives each request its own database client, made from
 * the Hyperdrive binding. The client connects lazily, on the request's first
 * query. Idle connections are never timed out (`0`), since that timer would
 * fire during another request; the runtime closes the request's sockets when
 * the request, and what it hands to `waitUntil`, is done.
 *
 * A request made inside another one with the global `$fetch`, as the
 * translations and the icons are during server rendering, carries no bindings
 * and gets no client. The hook must not throw for it: Nitro would skip the
 * `request` hooks after this one, evlog's among them, and the request would
 * fail for want of a logger.
 */
/**
 * The ID evlog gives a request, which the drain reads back as
 * `ctx.request.requestId`. Once evlog's request hook has run, its logger holds
 * it. Before, it is the one evlog will pick: Cloudflare's ray on Workers, else
 * `event.context.requestId`, which is set here so evlog takes the same.
 */
function evlogRequestId(event: H3Event): string {
	const logger = event.context.log as { getContext?: () => { requestId?: unknown } } | undefined;
	const fromLogger = logger?.getContext?.().requestId;
	if (typeof fromLogger === "string") return fromLogger;

	const ray = event.headers?.get("cf-ray");
	if (ray) return ray;
	event.context.requestId ??= crypto.randomUUID();
	return event.context.requestId;
}

export default defineNitroPlugin((nitroApp) => {
	if (runtime !== "workerd") return;

	nitroApp.hooks.hook("request", (event) => {
		const url = hyperdriveConnectionString(event.context.cloudflare);
		if (url === undefined) return;
		const database = createDatabase(url, 0);
		event.context.database = database;

		// The audit drain finds the client by the ID evlog gives the request
		// (see `request-database.ts`), so the key is that ID, whichever of the
		// two request hooks ran first.
		rememberRequestDatabase(evlogRequestId(event), database);
	});
});
