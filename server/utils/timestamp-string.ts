import type { TimestampString } from "@prisma/orm-postgres/target/codec-types";

/**
 * Narrows a validated ISO timestamp to the branded string the Prisma ORM 8
 * `TimestampString(3)` codec reads and writes.
 *
 * The contract authors its `timestamp(3)` columns as `TimestampString` rather
 * than `Timestamp`, whose `Temporal` codec needs a global this project's Node
 * versions do not provide. The brand exists so a plain string cannot be bound
 * to such a column by accident; callers pass values the query schemas have
 * already validated as ISO timestamps.
 */
export function asTimestampString(value: string): TimestampString<3> {
	return value as TimestampString<3>;
}
