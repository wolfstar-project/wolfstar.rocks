import { literal, object } from "valibot";

/** The body of the owner's removal of the legacy permission nodes: the typed confirmation. */
export const LegacyRemovalSchema = object({ confirm: literal("REMOVE") });
