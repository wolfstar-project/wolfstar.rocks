import {
	array,
	boolean,
	nullable,
	object,
	optional,
	string,
	type GenericSchema,
	type ObjectSchema,
} from "valibot";

export interface SettingsFormSpec {
	/** Settings that hold one channel or role, or nothing. */
	one?: readonly string[];
	/** Settings that hold a list of channels, roles or names. */
	many?: readonly string[];
	/** Settings that are switched on or off. */
	toggles?: readonly string[];
}

/**
 * Builds the Valibot schema of a settings form from the kinds of its keys, so
 * a section never hand-writes a schema that can drift from the entries it
 * renders.
 */
export function buildSettingsFormSchema(
	spec: SettingsFormSpec,
): ObjectSchema<Record<string, GenericSchema>, undefined> {
	const shape: Record<string, GenericSchema> = {};

	for (const key of spec.one ?? []) {
		shape[key] = nullable(string());
	}
	for (const key of spec.many ?? []) {
		shape[key] = optional(array(string()), []);
	}
	for (const key of spec.toggles ?? []) {
		shape[key] = optional(boolean(), false);
	}

	return object(shape);
}
