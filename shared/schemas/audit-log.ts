import {
	number,
	object,
	optional,
	pipe,
	integer,
	minValue,
	maxValue,
	transform,
	unknown,
} from "valibot";

// Query string values are always strings; transform coerces them to numbers before validation.
export const AuditLogQuerySchema = object({
	limit: optional(
		pipe(unknown(), transform(Number), number(), integer(), minValue(1), maxValue(100)),
		10,
	),
	offset: optional(pipe(unknown(), transform(Number), number(), integer(), minValue(0)), 0),
});
