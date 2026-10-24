import type { Contract, Models } from "#server/database/generated/prisma/contract";
import type { H3Event } from "h3";
import contractJson from "#server/database/generated/prisma/contract.json" with { type: "json" };
import { lints } from "@prisma/orm-postgres/family-runtime";
import postgres from "@prisma/orm-postgres/runtime";
import { useEvent } from "nitropack/runtime";
import { typedRuntimeDescriptor } from "prisma-orm-extension-typed-json/runtime";
import { CLOUDFLARE_BINDINGS } from "~~/config/cloudflare";

/**
 * Prisma ORM 8 client for the database this app shares with the WolfStar bot.
 *
 * Wired the way the bot's `projects/database` package wires its own
 * (wolfstar-project/wolfstar, V7): the same contract, the typed-JSON extension
 * for the columns that hold structured values, and the lint middleware.
 */
function createDatabase(url: string | undefined, idleTimeoutMillis?: number) {
	return postgres<Contract>({
		// `undefined`, never `""`: the factory connects lazily and accepts a missing
		// URL (it only throws once a query needs a connection), but it rejects an
		// empty string outright. Prerendering imports this module at build time,
		// where `DATABASE_URL` is not set.
		url,
		contractJson,
		extensions: [typedRuntimeDescriptor],
		// Refuses a `DELETE` or an `UPDATE` without a `WHERE` before it reaches the database:
		middleware: [lints()],
		...(idleTimeoutMillis === undefined ? {} : { poolOptions: { idleTimeoutMillis } }),
	});
}

export type Database = ReturnType<typeof createDatabase>;

declare module "h3" {
	interface H3EventContext {
		/** The request's database client, on Cloudflare Workers. */
		database?: Database;
	}
}

const isWorkers = globalThis.navigator?.userAgent === "Cloudflare-Workers";

function isHyperdrive(value: unknown): value is { connectionString: string } {
	return (
		typeof value === "object" &&
		value !== null &&
		"connectionString" in value &&
		typeof value.connectionString === "string"
	);
}

function hyperdriveConnectionString(event: H3Event): string {
	const cloudflare: unknown = event.context.cloudflare;
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
 * Cloudflare Workers refuse I/O across requests: a connection opened while
 * serving one request cannot be used by the next. There each request gets its
 * own client, made from the Hyperdrive binding the first time the request
 * reaches the database and kept on the event, which `useEvent()` finds through
 * Nitro's async context. Idle connections are never timed out, since that
 * timer would fire during another request; the runtime closes the request's
 * sockets when the request, and what it hands to `waitUntil`, is done.
 */
function requestDatabase(): Database {
	const event = useEvent();
	event.context.database ??= createDatabase(hyperdriveConnectionString(event), 0);
	return event.context.database;
}

function requestScopedDatabase(): Database {
	return new Proxy({} as Database, {
		get(_target, property) {
			const database = requestDatabase();
			const value: unknown = Reflect.get(database, property, database);
			return typeof value === "function" ? value.bind(database) : value;
		},
	});
}

export const db: Database = isWorkers
	? requestScopedDatabase()
	: createDatabase(process.env.DATABASE_URL || undefined);

export type { Contract, Models };
