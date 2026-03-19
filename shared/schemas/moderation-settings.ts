import { boolean, object, optional, type GenericSchema, type InferOutput } from "valibot";
import { ConfigurableModerationKeys } from "../utils/settingsDataEntries";

/**
 * Schema for the Moderation settings form.
 * Dynamically built from the configurable moderation key list.
 */
const schemaObject: Record<string, GenericSchema<boolean | undefined>> = {};

for (const setting of ConfigurableModerationKeys) {
	schemaObject[setting.key] = optional(boolean(), false);
}

export const ModerationSettingsSchema = object(schemaObject);

export type ModerationSettingsSchemaType = InferOutput<typeof ModerationSettingsSchema>;
