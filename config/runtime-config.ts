import { toStandardJsonSchema } from "@valibot/to-json-schema";
import * as v from "valibot";

/**
 * Schemas for `runtimeConfig` (Nuxt 4.7, https://nuxt.com/docs/guide/going-further/runtime-config#validating-with-a-schema).
 *
 * Nuxt compiles each schema at build time into a description of its type, its
 * default and whether it is required, and checks the `NUXT_*` variables against
 * it when the server first reads its config: a missing required value, or one
 * that cannot be read as its type, stops the server with `NUXT_E8014`, listing
 * every problem at once. Only that description reaches the server bundle, so a
 * check that JSON Schema types cannot carry (a minimum length, a URL format) is
 * not run at run time: keep these to types, required values and choices.
 *
 * Nuxt reads a schema through Standard JSON Schema, which Valibot implements in
 * `@valibot/to-json-schema`.
 */

/** A string the server cannot start without. */
export function requiredString() {
	return toStandardJsonSchema(v.string());
}

/**
 * A string the server cannot start without, unless the build had one: a value
 * read from a build variable becomes the default, and the server then starts on
 * it when its own `NUXT_*` variable is not set.
 */
export function requiredStringWithBuildDefault(buildValue: string | undefined) {
	return buildValue ? optionalString(buildValue) : requiredString();
}

/** A string with a default, which its `NUXT_*` variable may override. */
export function optionalString(fallback = "") {
	return toStandardJsonSchema(v.optional(v.string(), fallback));
}

/** A number with a default. */
export function optionalNumber(fallback: number) {
	return toStandardJsonSchema(v.optional(v.number(), fallback));
}

/** A whole number with a default. */
export function optionalInteger(fallback: number) {
	return toStandardJsonSchema(v.optional(v.pipe(v.number(), v.integer()), fallback));
}
