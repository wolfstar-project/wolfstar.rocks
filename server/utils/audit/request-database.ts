import type { Database } from "#server/database/prisma";

/**
 * The database client of each request in flight on Cloudflare Workers, by the
 * ID evlog gives the request. The audit drain finds its client here when it
 * runs outside the request's async context, where `db` cannot: h3 reports a
 * thrown error after the handler's context is gone, and that is the path of
 * every denied request, whose audit event would otherwise be lost.
 */
const databases = new Map<string, Database>();

/** A drain forgets its request; this bounds what requests without one leave. */
const MAXIMUM_REMEMBERED = 256;

export function rememberRequestDatabase(requestId: string, database: Database): void {
	if (databases.size >= MAXIMUM_REMEMBERED) {
		const oldest = databases.keys().next();
		if (!oldest.done) databases.delete(oldest.value);
	}
	databases.set(requestId, database);
}

export function findRequestDatabase(requestId: string | undefined): Database | undefined {
	return requestId === undefined ? undefined : databases.get(requestId);
}

export function forgetRequestDatabase(requestId: string | undefined): void {
	if (requestId !== undefined) databases.delete(requestId);
}
