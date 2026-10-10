import { boolean, object, optional, type GenericSchema, type InferOutput } from "valibot";
import { GUILD_MODULES } from "../utils/guild-modules";

/**
 * Schema for the Modules overview form: one enable flag per moderation module.
 */
const schemaObject: Record<string, GenericSchema<boolean | undefined>> = {};

for (const module of GUILD_MODULES) {
	schemaObject[module.key] = optional(boolean(), false);
}

export const ModulesSettingsSchema = object(schemaObject);

export type ModulesSettingsSchemaType = InferOutput<typeof ModulesSettingsSchema>;
