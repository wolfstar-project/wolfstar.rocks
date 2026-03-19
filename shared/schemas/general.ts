import {
	maxLength,
	minLength,
	object,
	optional,
	pipe,
	string,
	trim,
	type InferOutput,
} from "valibot";

/**
 * Schema for the General settings form.
 * Validates the bot command prefix and language selection.
 */
export const GeneralSettingsSchema = object({
	language: optional(
		object({
			label: string(),
			value: string(),
		}),
	),
	prefix: optional(
		pipe(
			string(),
			trim(),
			minLength(1, "Prefix must be at least 1 character"),
			maxLength(10, "Prefix cannot be longer than 10 characters"),
		),
	),
});

export type GeneralSettingsSchemaType = InferOutput<typeof GeneralSettingsSchema>;
