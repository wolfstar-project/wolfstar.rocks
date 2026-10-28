import { createDatabase } from "#server/database/prisma";
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
export default defineNitroPlugin((nitroApp) => {
	if (runtime !== "workerd") return;

	nitroApp.hooks.hook("request", (event) => {
		const url = hyperdriveConnectionString(event.context.cloudflare);
		if (url === undefined) return;
		event.context.database = createDatabase(url, 0);
	});
});
