import * as v from "valibot";

const commandSchema = v.object({
	category: v.optional(v.string(), "General"),
	description: v.optional(v.string(), ""),
	isEnabled: v.optional(v.boolean(), true),
	name: v.string(),
});

export const disabledCommandsSchema = v.optional(v.record(v.string(), commandSchema), {});
