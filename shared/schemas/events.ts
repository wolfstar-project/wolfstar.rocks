import { boolean, object, optional, type GenericSchema, type InferOutput } from "valibot";
import {
	ConfigurableMessageEvents,
	ConfigurableModerationEvents,
} from "../utils/settingsDataEntries";

/**
 * Schema for the Events settings form.
 * Dynamically built from the configurable moderation and message event lists.
 */
const schemaObject: Record<string, GenericSchema<boolean | undefined>> = {};

for (const event of [...ConfigurableModerationEvents, ...ConfigurableMessageEvents]) {
	schemaObject[event.key] = optional(boolean(), false);
}

export const EventsSettingsSchema = object(schemaObject);

export type EventsSettingsSchemaType = InferOutput<typeof EventsSettingsSchema>;
