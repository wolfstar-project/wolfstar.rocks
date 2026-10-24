import { object, optional, string, type InferOutput } from "valibot";

/**
 * Schema for the General settings form: the language the bot answers in and
 * the time zone of the server, by its IANA name. The server checks the zone
 * against the ones its runtime knows.
 */
export const GeneralSettingsSchema = object({
	language: optional(
		object({
			label: string(),
			value: string(),
		}),
	),
	timezone: optional(string()),
});

export type GeneralSettingsSchemaType = InferOutput<typeof GeneralSettingsSchema>;
