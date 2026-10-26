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

function hyperdriveConnectionString(cloudflare: unknown): string {
	const env: unknown =
		typeof cloudflare === "object" && cloudflare !== null && "env" in cloudflare
			? cloudflare.env
			: undefined;
	const binding: unknown =
		typeof env === "object" && env !== null
			? Reflect.get(env, CLOUDFLARE_BINDINGS.database)
			: undefined;
	if (!isHyperdrive(binding)) {
		throw new Error(
			`[database] the Worker has no Hyperdrive binding named ${CLOUDFLARE_BINDINGS.database}`,
		);
	}
	return binding.connectionString;
}

/**
 * On Cloudflare Workers, gives each request its own database client, made from
 * the Hyperdrive binding. The client connects lazily, on the request's first
 * query. Idle connections are never timed out (`0`), since that timer would
 * fire during another request; the runtime closes the request's sockets when
 * the request, and what it hands to `waitUntil`, is done.
 */
export default defineNitroPlugin((nitroApp) => {
	if (runtime !== "workerd") return;

	nitroApp.hooks.hook("request", (event) => {
		event.context.database = createDatabase(
			hyperdriveConnectionString(event.context.cloudflare),
			0,
		);
	});
});
