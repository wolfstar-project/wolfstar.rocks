import {
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

const coercedNumber = (min = 0) =>
	pipe(unknown(), transform(Number), number(), integer(), minValue(min));

const optionalString = (maxLen: number) => optional(pipe(string(), trim(), maxLength(maxLen)));

const optionalIsoDate = optional(pipe(string(), trim(), maxLength(30)));

export const ModerationLogQuerySchema = object({
	limit: optional(pipe(coercedNumber(1), maxValue(100)), 30),
	offset: optional(coercedNumber(), 0),
	userId: optionalString(19),
	moderatorId: optionalString(19),
	typeCode: optional(coercedNumber(0)),
	from: optionalIsoDate,
	to: optionalIsoDate,
	q: optionalString(200),
});

export const CommandLogQuerySchema = object({
	limit: optional(pipe(coercedNumber(1), maxValue(100)), 30),
	offset: optional(coercedNumber(), 0),
	userId: optionalString(19),
	commandName: optionalString(64),
	success: optional(pipe(string(), trim()), "all"),
	from: optionalIsoDate,
	to: optionalIsoDate,
	q: optionalString(200),
});

export const DashboardActivityQuerySchema = object({
	limit: optional(pipe(coercedNumber(1), maxValue(100)), 10),
	offset: optional(coercedNumber(), 0),
	actorId: optionalString(19),
	from: optionalIsoDate,
	to: optionalIsoDate,
	q: optionalString(200),
});
