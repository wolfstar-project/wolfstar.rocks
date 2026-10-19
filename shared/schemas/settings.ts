import { MaximumConfigurationFileSize } from "#shared/utils/settings-transfer";
import { array, boolean, maxLength, object, optional, pipe, string, tuple, unknown } from "valibot";

/**
 * Schema for the guild settings PATCH body.
 * Accepts an array of [key, value] tuples to apply as a settings transaction.
 */
export const SettingsUpdateSchema = object({
	data: optional(array(tuple([string(), unknown()]))),
});

/**
 * Schema for the body of the settings import: the content of the file, and
 * whether to write it. The file is checked for its size here, so a body that
 * is not a configuration file is refused before it is parsed.
 */
export const ConfigurationImportSchema = object({
	text: pipe(string(), maxLength(MaximumConfigurationFileSize)),
	apply: optional(boolean()),
});
