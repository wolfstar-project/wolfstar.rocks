import {
	array,
	boolean,
	integer,
	maxValue,
	minValue,
	nullable,
	number,
	object,
	optional,
	picklist,
	pipe,
	string,
	type GenericSchema,
	type ObjectSchema,
} from "valibot";
import {
	SETTING_CHOICES,
	SETTING_NUMBER_RANGES,
	type ChoiceSettingKey,
	type NumberSettingKey,
} from "../utils/settings-choices";

export interface SettingsFormSpec {
	/** Settings that hold one channel or role, or nothing. */
	one?: readonly string[];
	/** Settings that hold a list of channels, roles or names. */
	many?: readonly string[];
	/** Settings that are switched on or off. */
	toggles?: readonly string[];
	/** Settings that hold a whole number, in the range the bot accepts. */
	numbers?: readonly NumberSettingKey[];
	/** Settings that hold one word of a fixed set. */
	choices?: readonly ChoiceSettingKey[];
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
	for (const key of spec.numbers ?? []) {
		const { maximum, minimum } = SETTING_NUMBER_RANGES[key];
		shape[key] = pipe(number(), integer(), minValue(minimum), maxValue(maximum));
	}
	for (const key of spec.choices ?? []) {
		shape[key] = picklist(SETTING_CHOICES[key]);
	}

	return object(shape);
}
