import {
	maxLength,
	regex,
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

const coercedNumber = (min = 0) =>
	pipe(unknown(), transform(Number), number(), integer(), minValue(min));

const optionalString = (maxLen: number) => optional(pipe(string(), trim(), maxLength(maxLen)));

/**
 * A Discord snowflake filter. The value is converted with `BigInt()` before it
 * reaches the database, which throws on anything non-numeric, so the shape is
 * checked here and a malformed filter answers 400 instead of 500.
 */
const optionalSnowflake = optional(
	pipe(string(), trim(), maxLength(20), regex(/^\d+$/u, "Expected a Discord snowflake")),
);

const optionalIsoDate = optional(pipe(string(), trim(), maxLength(30)));

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
