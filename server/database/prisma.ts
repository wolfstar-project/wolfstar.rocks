import type { Contract, Models } from "#server/database/generated/prisma/contract";
import contractJson from "#server/database/generated/prisma/contract.json" with { type: "json" };
import { lints } from "@prisma/orm-postgres/family-runtime";
import postgres from "@prisma/orm-postgres/runtime";
import { useEvent } from "nitropack/runtime";
import { typedRuntimeDescriptor } from "prisma-orm-extension-typed-json/runtime";
import { runtime } from "std-env";

/**
 * Prisma ORM 8 client for the database this app shares with the WolfStar bot.
 *
 * Wired the way the bot's `projects/database` package wires its own
 * (wolfstar-project/wolfstar, V7): the same contract, the typed-JSON extension
 * for the columns that hold structured values, and the lint middleware.
 */
export function createDatabase(url: string | undefined, idleTimeoutMillis?: number) {
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
		/** The request's database client, set by `server/plugins/database.ts` on Cloudflare Workers. */
		database?: Database;
	}
}

/**
 * Cloudflare Workers refuse I/O across requests: a connection opened while
 * serving one request cannot be used by the next. There each request gets its
 * own client, which `server/plugins/database.ts` makes from the Hyperdrive
 * binding and keeps on the event, and which `useEvent()` finds here through
 * Nitro's async context.
 */
function requestDatabase(): Database {
	const { database } = useEvent().context;
	if (!database) {
		throw new Error(
			"[database] the request has no database client: it carries no Hyperdrive binding, as a request made with the global $fetch does not (use event.$fetch)",
		);
	}
	return database;
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

export const db: Database =
	runtime === "workerd"
		? requestScopedDatabase()
		: createDatabase(process.env.DATABASE_URL || undefined);

export type { Contract, Models };
