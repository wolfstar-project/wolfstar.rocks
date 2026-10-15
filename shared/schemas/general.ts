import { object, optional, string, type InferOutput } from "valibot";

/**
 * Schema for the General settings form: the language the bot answers in.
 */
export const GeneralSettingsSchema = object({
	language: optional(
		object({
			label: string(),
			value: string(),
		}),
	),
});

export type GeneralSettingsSchemaType = InferOutput<typeof GeneralSettingsSchema>;
