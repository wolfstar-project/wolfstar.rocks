import { array, boolean, nullable, object, optional, string, type InferOutput } from "valibot";
import { ConfigurableRoles } from "../utils/settingsDataEntries";

/**
 * Keys whose guild-data value is an array of role IDs (vs. a single role ID / null).
 */
const ROLES_ARRAY_KEYS = new Set([
	"rolesAdmin",
	"rolesModerator",
	"rolesPublic",
	"rolesInitial",
	"rolesMuted",
]);

export function isRoleArrayKey(key: string): boolean {
	return ROLES_ARRAY_KEYS.has(key);
}

// Concrete schema instances — `typeof` captures the precise Valibot types
// so that InferOutput resolves to the correct union instead of `unknown`.
const _arrayRoleSchema = optional(array(string()), [] as string[]);
const _singleRoleSchema = nullable(string());
const _booleanSchema = boolean();
type RoleFieldSchema = typeof _arrayRoleSchema | typeof _singleRoleSchema | typeof _booleanSchema;

/**
 * Schema for the Roles settings form.
 * Dynamically built from the configurable roles list.
 */
const schemaShape: Record<string, RoleFieldSchema> = {
	rolesRemoveInitial: _booleanSchema,
};

for (const roleConfig of ConfigurableRoles) {
	schemaShape[roleConfig.key] = isRoleArrayKey(roleConfig.key)
		? optional(array(string()), [] as string[])
		: nullable(string());
}

export const RolesSettingsSchema = object(schemaShape);

export type RolesSettingsSchemaType = InferOutput<typeof RolesSettingsSchema>;
