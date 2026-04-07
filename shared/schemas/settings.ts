import { object, optional, tuple, array, string, unknown } from "valibot";

/**
 * Schema for the guild settings PATCH body.
 * Accepts an array of [key, value] tuples to apply as a settings transaction.
 */
export const SettingsUpdateSchema = object({
	data: optional(array(tuple([string(), unknown()]))),
});
