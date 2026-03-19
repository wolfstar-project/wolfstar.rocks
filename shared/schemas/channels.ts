import {
	array,
	nullable,
	object,
	optional,
	string,
	type GenericSchema,
	type InferOutput,
} from "valibot";
import {
	ConfigurableIgnoreChannels,
	ConfigurableLoggingChannels,
} from "../utils/settingsDataEntries";

/**
 * Schema for the Channels settings form.
 * Dynamically built from the configurable logging and ignore channel lists.
 */
const schemaShape: Record<string, GenericSchema> = {};

for (const config of ConfigurableLoggingChannels) {
	schemaShape[config.key] = nullable(string());
}

for (const config of ConfigurableIgnoreChannels) {
	schemaShape[config.key] = optional(array(string()), []);
}

export const ChannelsSettingsSchema = object(schemaShape);

export type ChannelsSettingsSchemaType = InferOutput<typeof ChannelsSettingsSchema>;
