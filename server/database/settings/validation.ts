import type {
	GuildData,
	PermissionsNode,
	StickyRole,
	UniqueRoleSet,
} from "#server/database/settings/types";
import { Columns, isStoredKey, type StoredKey } from "#server/database/settings/columns";
import { getDefaultGuildSettings } from "#server/database/settings/constants";

/** The most entries a list setting holds (roles, channels, commands, nodes). */
export const MAXIMUM_SETTING_LIST_LENGTH = 250;
const MAXIMUM_COMMAND_NAME_LENGTH = 32;
const MAXIMUM_UNIQUE_ROLE_SET_NAME_LENGTH = 32;

const SNOWFLAKE_PATTERN = /^\d{17,20}$/u;
// BCP 47 tags as the bot ships them: `en-US`, `es-419`, `pt-BR`, …
const LANGUAGE_PATTERN = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/u;

type Validator = (value: unknown) => unknown;

/** Thrown by a validator; its message is what the API reports for the key. */
class SettingValueError extends Error {}

function fail(message: string): never {
	throw new SettingValueError(message);
}

function isSnowflake(value: unknown): value is string {
	return typeof value === "string" && SNOWFLAKE_PATTERN.test(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function list<T>(value: unknown, entry: (item: unknown) => T): T[] {
	if (!Array.isArray(value)) fail("Expected an array.");
	if (value.length > MAXIMUM_SETTING_LIST_LENGTH) {
		fail(`Expected at most ${MAXIMUM_SETTING_LIST_LENGTH} entries.`);
	}
	return value.map(entry);
}

function snowflake(value: unknown): string {
	return isSnowflake(value) ? value : fail("Expected a Discord ID.");
}

const validateSnowflake: Validator = (value) => snowflake(value);
const validateSnowflakes: Validator = (value) => [...new Set(list(value, snowflake))];
const validateBoolean: Validator = (value) =>
	typeof value === "boolean" ? value : fail("Expected a boolean.");

const validateLanguage: Validator = (value) =>
	typeof value === "string" && LANGUAGE_PATTERN.test(value)
		? value
		: fail("Expected a language tag.");

const validateCommandNames: Validator = (value) => [
	...new Set(
		list(value, (item) =>
			typeof item === "string" &&
			item.length > 0 &&
			item.length <= MAXIMUM_COMMAND_NAME_LENGTH
				? item
				: fail(`Expected command names of 1 to ${MAXIMUM_COMMAND_NAME_LENGTH} characters.`),
		),
	),
];

function commandNames(value: unknown): string[] {
	return validateCommandNames(value) as string[];
}

const validatePermissionNodes: Validator = (value) =>
	list(value, (item): PermissionsNode => {
		if (!isPlainObject(item)) fail("Expected permission nodes.");
		return {
			id: snowflake(item.id),
			allow: commandNames(item.allow),
			deny: commandNames(item.deny),
		};
	});

const validateUniqueRoleSets: Validator = (value) =>
	list(value, (item): UniqueRoleSet => {
		if (!isPlainObject(item)) fail("Expected unique role sets.");
		const { name } = item;
		if (
			typeof name !== "string" ||
			name.trim().length === 0 ||
			name.length > MAXIMUM_UNIQUE_ROLE_SET_NAME_LENGTH
		) {
			fail(`Expected set names of 1 to ${MAXIMUM_UNIQUE_ROLE_SET_NAME_LENGTH} characters.`);
		}
		return { name, roles: [...new Set(list(item.roles, snowflake))] };
	});

const validateStickyRoles: Validator = (value) =>
	list(value, (item): StickyRole => {
		if (!isPlainObject(item)) fail("Expected sticky roles.");
		return { user: snowflake(item.user), roles: [...new Set(list(item.roles, snowflake))] };
	});

/**
 * The settings whose column is stored as-is and is not a boolean. Every other
 * `value` column is a boolean, which {@link validatorFor} checks from the
 * default, so a column added to `Columns` without an entry here still gets a
 * validator rather than being written unchecked.
 */
const ValueValidators: Partial<Record<StoredKey, Validator>> = {
	language: validateLanguage,
	commandsDisabled: validateCommandNames,
	permissionsUsers: validatePermissionNodes,
	permissionsRoles: validatePermissionNodes,
	rolesUniqueRoleSets: validateUniqueRoleSets,
};

function validatorFor(key: StoredKey): Validator {
	const { kind } = Columns[key];
	if (kind === "snowflake") return validateSnowflake;
	if (kind === "snowflakes") return validateSnowflakes;

	const explicit = ValueValidators[key];
	if (explicit) return explicit;

	if (typeof getDefaultGuildSettings()[key] === "boolean") return validateBoolean;
	return () => fail("This setting cannot be changed from the dashboard.");
}

export type SettingsChangesResult =
	| { data: Partial<GuildData>; errors?: undefined }
	| { data?: undefined; errors: string[] };

/**
 * Reads the `[key, value]` pairs of a settings PATCH body, which is not
 * trusted: a key the schema does not have is refused, and so is a value that
 * is not of its key's type. `null` resets a key to its default, as it does in
 * the bot's own settings route.
 *
 * @returns The changes to write, or what is wrong with the body, one message per key.
 */
export function parseSettingsChanges(
	entries: readonly (readonly [string, unknown])[],
): SettingsChangesResult {
	const defaults = getDefaultGuildSettings() as Record<string, unknown>;
	const data: Record<string, unknown> = {};
	const errors: string[] = [];

	for (const [key, value] of entries) {
		const validate =
			key === "stickyRoles"
				? validateStickyRoles
				: isStoredKey(key)
					? validatorFor(key)
					: null;
		if (validate === null) {
			errors.push(`${key}: The key does not exist in the current schema.`);
			continue;
		}

		if (value === null) {
			data[key] = structuredClone(defaults[key]);
			continue;
		}

		try {
			data[key] = validate(value);
		} catch (error) {
			if (!(error instanceof SettingValueError)) throw error;
			errors.push(`${key}: ${error.message}`);
		}
	}

	return errors.length === 0 ? { data: data as Partial<GuildData> } : { errors };
}
