import {
	check,
	maxLength,
	minValue,
	maxValue,
	number,
	integer,
	object,
	optional,
	pipe,
	string,
	transform,
	trim,
	unknown,
} from "valibot";
import { isSnowflake } from "../utils/snowflake";

const coercedNumber = (min = 0) =>
	pipe(unknown(), transform(Number), number(), integer(), minValue(min));

const optionalString = (maxLen: number) => optional(pipe(string(), trim(), maxLength(maxLen)));

/**
 * A Discord snowflake filter. The value is converted with `BigInt()` and
 * compared with a `BIGINT` column, so anything that is not a number in that
 * range is refused here and answers 400 instead of failing in the query.
 */
const optionalSnowflake = optional(
	pipe(
		string(),
		trim(),
		maxLength(20),
		check((value) => isSnowflake(value), "Expected a Discord snowflake"),
	),
);

const ISO_DATE_PATTERN =
	/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?<zone>Z|[+-]\d{2}(?::?\d{2})?)?)?$/u;

/**
 * Reads an ISO 8601 date or date-time as the instant it names. Without a zone
 * designator it is taken as UTC, which is what the log tables store.
 */
function parseIsoDate(value: string): Date {
	const match = ISO_DATE_PATTERN.exec(value);
	if (!match) return new Date(Number.NaN);
	const zoned = value.includes("T") && !match.groups?.["zone"] ? `${value}Z` : value;
	return new Date(zoned);
}

/**
 * A date filter, normalized to a UTC ISO string. The columns it is compared
 * with are `timestamp without time zone`: PostgreSQL would drop an offset such
 * as `+02:00` instead of applying it, and fail on text that is not a date.
 */
const optionalIsoDate = optional(
	pipe(
		string(),
		trim(),
		maxLength(40),
		check((value) => !Number.isNaN(parseIsoDate(value).getTime()), "Expected an ISO 8601 date"),
		transform((value) => parseIsoDate(value).toISOString()),
	),
);

export const ModerationLogQuerySchema = object({
	limit: optional(pipe(coercedNumber(1), maxValue(100)), 30),
	offset: optional(coercedNumber(), 0),
	userId: optionalSnowflake,
	moderatorId: optionalSnowflake,
	typeCode: optional(coercedNumber(0)),
	from: optionalIsoDate,
	to: optionalIsoDate,
	q: optionalString(200),
});

export const CommandLogQuerySchema = object({
	limit: optional(pipe(coercedNumber(1), maxValue(100)), 30),
	offset: optional(coercedNumber(), 0),
	userId: optionalSnowflake,
	commandName: optionalString(64),
	success: optional(pipe(string(), trim()), "all"),
	from: optionalIsoDate,
	to: optionalIsoDate,
	q: optionalString(200),
});

export const DashboardActivityQuerySchema = object({
	limit: optional(pipe(coercedNumber(1), maxValue(100)), 10),
	offset: optional(coercedNumber(), 0),
	actorId: optionalSnowflake,
	from: optionalIsoDate,
	to: optionalIsoDate,
	q: optionalString(200),
});
