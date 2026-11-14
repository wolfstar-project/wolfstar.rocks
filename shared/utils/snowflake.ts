const SNOWFLAKE_PATTERN = /^\d{17,19}$/u;
// Snowflakes are stored in PostgreSQL `BIGINT` columns, which are signed.
const MAXIMUM_SNOWFLAKE = 2n ** 63n - 1n;

/**
 * Whether a value is a Discord snowflake the database can hold. A 19-digit
 * number can still exceed `BIGINT`, and one that does would pass a digits-only
 * check here and then fail inside the query, so the range is checked as well.
 */
export function isSnowflake(value: unknown): value is string {
	return (
		typeof value === "string" &&
		SNOWFLAKE_PATTERN.test(value) &&
		BigInt(value) <= MAXIMUM_SNOWFLAKE
	);
}
