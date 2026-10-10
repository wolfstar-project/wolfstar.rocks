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

// A `Z` or `±HH[[:]MM]` designator. `timestamp(3)` columns carry no zone, so it
// only matches values that already went through a conversion.
const EXPLICIT_ZONE_PATTERN = /(?:Z|[+-]\d{2}(?::?\d{2})?)$/i;

// Only the time component can carry a zone; testing the whole string would read
// a bare date's `-09` as an offset.
function hasExplicitZone(isoLike: string): boolean {
	const timeStart = isoLike.indexOf("T");
	return timeStart !== -1 && EXPLICIT_ZONE_PATTERN.test(isoLike.slice(timeStart + 1));
}

/**
 * Reads a `TimestampString(3)` column value as the UTC instant it stores.
 *
 * The codec hands back PostgreSQL's `timestamp without time zone` text
 * verbatim — `2026-10-09 21:02:50.123`, with no zone designator. `new Date()`
 * resolves that against the *local* zone, so every consumer outside UTC would
 * shift the value. These columns hold UTC (the ORM 7 client this project
 * migrated from decoded them that way), so the zone is appended before parsing
 * rather than inferred.
 */
export function timestampStringToDate(value: string): Date {
	const isoLike = value.replace(" ", "T");
	const zoned = hasExplicitZone(isoLike) ? isoLike : `${isoLike}Z`;
	const parsed = new Date(zoned);
	if (Number.isNaN(parsed.getTime())) {
		throw new TypeError(`Expected a TimestampString, received: ${value}`);
	}
	return parsed;
}

/**
 * Converts a `TimestampString(3)` column value to a UTC ISO string, which is
 * what every API response carrying a timestamp returns and what the dashboard
 * tables hand to `new Date()`.
 */
export function timestampStringToUtcIso(value: string): string {
	return timestampStringToDate(value).toISOString();
}
