import { number, object, optional, pipe, integer, minValue, maxValue } from "valibot";

export const AuditLogQuerySchema = object({
	limit: optional(pipe(number(), integer(), minValue(1), maxValue(100)), 10),
	offset: optional(pipe(number(), integer(), minValue(0)), 0),
});
