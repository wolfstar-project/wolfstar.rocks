import { Columns, isStoredKey, type StoredKey } from "#server/database/settings/columns";
import { getDefaultGuildSettings } from "#server/database/settings/constants";
import {
	AppealThreadModes,
	HoneypotActions,
	MessageUpdateStyles,
	type GuildData,
	type PermissionsNode,
	type StickyRole,
	type UniqueRoleSet,
} from "#server/database/settings/types";
import { createAccessEntry } from "#shared/utils/dashboard-access";
import { JoinGuardCheckpointTimeoutHours, SecondsPerHour } from "#shared/utils/join-guard";
import {
	SETTING_LIST_LIMITS,
	SETTING_NUMBER_RANGES,
	SETTING_TEXT_LIMITS,
	type NumberSettingKey,
	type TextSettingKey,
} from "#shared/utils/settings-choices";
import { isSnowflake } from "#shared/utils/snowflake";

/** The bot's `JoinGuardCheckpointTimeoutLimits`, in seconds. */
const JoinGuardCheckpointTimeoutLimits = {
	minimum: JoinGuardCheckpointTimeoutHours.minimum * SecondsPerHour,
	maximum: JoinGuardCheckpointTimeoutHours.maximum * SecondsPerHour,
} as const;

/** The most entries a list setting holds (roles, channels, commands, nodes). */
export const MAXIMUM_SETTING_LIST_LENGTH = 250;
const MAXIMUM_COMMAND_NAME_LENGTH = 32;
const MAXIMUM_UNIQUE_ROLE_SET_NAME_LENGTH = 32;

// BCP 47 tags as the bot ships them: `en-US`, `es-419`, `pt-BR`, …
const LANGUAGE_PATTERN = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/u;

type Validator = (value: unknown) => unknown;

/** Thrown by a validator; its message is what the API reports for the key. */
class SettingValueError extends Error {}

function fail(message: string): never {
	throw new SettingValueError(message);
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

/** IDs, as {@link validateSnowflakes} reads them, of which at most `maximum` different ones. */
function snowflakesUpTo(maximum: number): Validator {
	return (value) => {
		const ids = validateSnowflakes(value) as string[];
		return ids.length <= maximum ? ids : fail(`Expected at most ${maximum} IDs.`);
	};
}

/**
 * A text the server writes, as the bot's `string` settings take it: the
 * spaces around are dropped, and an empty text is none, so the bot writes its
 * own line again.
 */
function text(maximum: number): Validator {
	return (value) => {
		if (typeof value !== "string") fail("Expected a text.");
		const trimmed = value.trim();
		if (trimmed.length === 0) return null;
		return trimmed.length <= maximum
			? trimmed
			: fail(`Expected a text of at most ${maximum} characters.`);
	};
}

const TextValidators = Object.fromEntries(
	Object.entries(SETTING_TEXT_LIMITS).map(([key, maximum]) => [key, text(maximum)]),
) as Record<TextSettingKey, Validator>;
const validateBoolean: Validator = (value) =>
	typeof value === "boolean" ? value : fail("Expected a boolean.");

const validateLanguage: Validator = (value) =>
	typeof value === "string" && LANGUAGE_PATTERN.test(value)
		? value
		: fail("Expected a language tag.");

let timeZones: ReadonlySet<string> | null = null;

// The IANA names the runtime knows, and `UTC`, as the bot's `isTimeZone()` reads them:
const validateTimeZone: Validator = (value) => {
	timeZones ??= new Set(["UTC", ...Intl.supportedValuesOf("timeZone")]);
	return typeof value === "string" && timeZones.has(value)
		? value
		: fail("Expected the name of a time zone, such as Europe/Rome.");
};

function oneOf(values: readonly string[]): Validator {
	return (value) =>
		typeof value === "string" && values.includes(value)
			? value
			: fail(`Expected one of ${values.join(", ")}.`);
}

/** A whole number within the range the bot accepts for `key`. */
function wholeNumber(key: NumberSettingKey): Validator {
	const { maximum, minimum } = SETTING_NUMBER_RANGES[key];
	return (value) =>
		Number.isInteger(value) && (value as number) >= minimum && (value as number) <= maximum
			? value
			: fail(`Expected a whole number from ${minimum} to ${maximum}.`);
}

const NumberValidators = Object.fromEntries(
	Object.keys(SETTING_NUMBER_RANGES).map((key) => [key, wholeNumber(key as NumberSettingKey)]),
) as Record<NumberSettingKey, Validator>;

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
		const id = snowflake(item.id);
		const allow = commandNames(item.allow);
		const deny = commandNames(item.deny);
		if (item.dashboard === undefined) return { id, allow, deny };

		if (item.dashboard !== "allow" && item.dashboard !== "deny") {
			fail('Expected a dashboard access rule of "allow" or "deny".');
		}
		if (allow.length > 0 || deny.length > 0) {
			fail("Expected a dashboard access rule without commands.");
		}
		return createAccessEntry(id, item.dashboard);
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

/**
 * How long a member waits at the checkpoint before the bot kicks them, in
 * seconds, as the bot's `isJoinGuardCheckpointTimeout()` reads it: `0` never
 * kicks, otherwise one hour to a week.
 */
const validateCheckpointTimeout: Validator = (value) =>
	Number.isSafeInteger(value) &&
	(value === 0 ||
		((value as number) >= JoinGuardCheckpointTimeoutLimits.minimum &&
			(value as number) <= JoinGuardCheckpointTimeoutLimits.maximum))
		? value
		: fail(
				`Expected 0 or a whole number of seconds from ${JoinGuardCheckpointTimeoutLimits.minimum} to ${JoinGuardCheckpointTimeoutLimits.maximum}.`,
			);

const validateStickyRoles: Validator = (value) =>
	list(value, (item): StickyRole => {
		if (!isPlainObject(item)) fail("Expected sticky roles.");
		return { user: snowflake(item.user), roles: [...new Set(list(item.roles, snowflake))] };
	});

/**
 * The settings that are not checked by the kind of their column alone: the
 * ones stored as-is that are not booleans, and the lists that hold fewer IDs
 * than every list may. Every other `value` column is a boolean, which
 * {@link validatorFor} checks from the default, so a column added to `Columns`
 * without an entry here still gets a validator rather than being written
 * unchecked.
 */
const ValueValidators: Partial<Record<StoredKey, Validator>> = {
	...TextValidators,
	...NumberValidators,
	moderationLockdownChannels: snowflakesUpTo(SETTING_LIST_LIMITS.moderationLockdownChannels),
	language: validateLanguage,
	timezone: validateTimeZone,
	commandsDisabled: validateCommandNames,
	honeypotAction: oneOf(HoneypotActions),
	logsMessageUpdateStyle: oneOf(MessageUpdateStyles),
	appealsThread: oneOf(AppealThreadModes),
	permissionsUsers: validatePermissionNodes,
	permissionsRoles: validatePermissionNodes,
	rolesUniqueRoleSets: validateUniqueRoleSets,
	joinGuardCheckpointTimeout: validateCheckpointTimeout,
};

/**
 * Settings these generic writes refuse, a `null` reset included:
 * `commandsRestrictions` is written one command at a time, with the revision
 * check the bot's `/commands` makes, by
 * `PUT /api/guilds/:guild/command-rules/:command`; and a change of
 * `updatesChannel` has to move the
 * follow of the support server's announcements, which only the bot does
 * (`syncUpdatesChannelFollow`); and `joinGuardCheckpointMessage` is the
 * message of the checkpoint's button, which the bot writes when it posts it
 * (the dashboard asks for that with a `PostButton` request).
 */
export const BOT_ONLY_SETTINGS: ReadonlySet<string> = new Set<string>([
	"commandsRestrictions",
	"updatesChannel",
	"joinGuardCheckpointMessage",
]);

const refuse: Validator = () => fail("This setting cannot be changed from the dashboard.");

function validatorFor(key: StoredKey): Validator {
	if (BOT_ONLY_SETTINGS.has(key)) return refuse;

	const explicit = ValueValidators[key];
	if (explicit) return explicit;

	const { kind } = Columns[key];
	if (kind === "snowflake") return validateSnowflake;
	if (kind === "snowflakes") return validateSnowflakes;

	if (typeof getDefaultGuildSettings()[key] === "boolean") return validateBoolean;
	return refuse;
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

		// A setting the dashboard cannot change cannot be reset from it either:
		if (value === null && validate !== refuse) {
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
