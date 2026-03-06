import { object, optional, boolean, type InferOutput } from "valibot";

/**
 * Schema for guild route query parameters.
 * Controls optional serialisation of the returned guild payload.
 */
export const GuildQuerySchema = object({
	shouldSerialize: optional(boolean()),
});

export type GuildQuery = InferOutput<typeof GuildQuerySchema>;
