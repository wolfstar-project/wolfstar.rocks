import {
	object,
	pipe,
	optional,
	boolean,
	transform,
	type InferOutput,
	minValue,
	integer,
	number,
	string,
	picklist,
	array,
} from "valibot";

/**
 * Schema for rate limiting configuration.
 * Validates and normalises all rate-limit options with sensible defaults.
 */
export const RateLimitSchema = object({
	enabled: optional(
		pipe(
			boolean(),
			transform((val) => val ?? true),
		),
		true,
	),
	ipHeader: optional(string()),
	limit: optional(
		pipe(
			number(),
			integer(),
			minValue(1),
			transform((val) => val ?? 5),
		),
		5,
	),
	scope: optional(picklist(["global", "route"]), "global"),
	type: optional(picklist(["fixed", "sliding"]), "fixed"),
	whitelist: optional(array(string()), []),
	window: optional(
		pipe(
			number(),
			integer(),
			minValue(1),
			transform((val) => val ?? 10_000),
		),
		10_000,
	),
});

export type RateLimit = InferOutput<typeof RateLimitSchema>;
export type PartialRateLimit = Partial<RateLimit>;
