import { describe, expect, it } from "vitest";
import {
	optionalInteger,
	requiredString,
	requiredStringWithBuildDefault,
} from "../../../config/runtime-config";

type Schema = ReturnType<typeof requiredString> | ReturnType<typeof optionalInteger>;

// Nuxt reads a runtime config schema the same two ways: its JSON Schema for the
// type and the default, and a validation of `undefined` to tell required keys.
function describeSchema(schema: Schema) {
	const standard = schema["~standard"];
	const result = standard.validate(undefined);
	if (result instanceof Promise) throw new TypeError("expected a synchronous schema");
	return {
		json: standard.jsonSchema.output({ target: "draft-2020-12" }),
		required: Boolean(result.issues),
	};
}

describe("runtime config schemas", () => {
	it("marks a required string as a string with no default", () => {
		const { json, required } = describeSchema(requiredString());

		expect(required).toBe(true);
		expect(json).toMatchObject({ type: "string" });
		expect(json).not.toHaveProperty("default");
	});

	it("keeps a value read at build time as the default", () => {
		const { json, required } = describeSchema(requiredStringWithBuildDefault("1234"));

		expect(required).toBe(false);
		expect(json).toMatchObject({ default: "1234", type: "string" });
	});

	it("is required when the build had no value", () => {
		expect(describeSchema(requiredStringWithBuildDefault(undefined)).required).toBe(true);
		expect(describeSchema(requiredStringWithBuildDefault("")).required).toBe(true);
	});

	it("describes a whole number with its default", () => {
		const { json, required } = describeSchema(optionalInteger(60));

		expect(required).toBe(false);
		expect(json).toMatchObject({ default: 60, type: "integer" });
	});
});
