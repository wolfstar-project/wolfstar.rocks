import { boolean, object, optional, record, string } from "valibot";

const commandSchema = object({
	category: optional(string(), "General"),
	description: optional(string(), ""),
	isEnabled: optional(boolean(), true),
	name: string(),
});

export const disabledCommandsSchema = optional(record(string(), commandSchema), {});
