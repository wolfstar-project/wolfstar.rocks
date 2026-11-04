import {
	array,
	boolean,
	integer,
	maxLength,
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
	SETTING_LIST_LIMITS,
	SETTING_NUMBER_RANGES,
	SETTING_TEXT_LIMITS,
	type ChoiceSettingKey,
	type NumberSettingKey,
	type TextSettingKey,
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
	/** Settings that hold a text the server writes, empty for none. */
	texts?: readonly TextSettingKey[];
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
	const listLimits: Partial<Record<string, number>> = SETTING_LIST_LIMITS;
	for (const key of spec.many ?? []) {
		const limit = listLimits[key];
		shape[key] =
			limit === undefined
				? optional(array(string()), [])
				: optional(pipe(array(string()), maxLength(limit)), []);
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
	for (const key of spec.texts ?? []) {
		shape[key] = nullable(pipe(string(), maxLength(SETTING_TEXT_LIMITS[key])));
	}

	return object(shape);
}
