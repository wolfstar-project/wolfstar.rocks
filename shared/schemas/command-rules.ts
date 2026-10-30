import { isSnowflake } from "#shared/utils/snowflake";
import {
	array,
	boolean,
	check,
	integer,
	maxLength,
	maxValue,
	minLength,
	minValue,
	number,
	object,
	pipe,
	regex,
	string,
} from "valibot";

/**
 * Past what a server can have: 500 channels and 250 roles. A list stored by
 * the bot is never longer, so a save of what the editor read always fits.
 */
const MAXIMUM_COMMAND_RULE_ENTRIES = 500;

/** The bot's piece name of a command, as `commandsDisabled` holds it: `ban`, `warnThresholds`. */
export const CommandRuleNameSchema = pipe(
	string(),
	minLength(1),
	maxLength(32),
	regex(/^[\w-]+$/u, "Expected a command name"),
);

const RuleListSchema = pipe(
	array(
		pipe(
			string(),
			check((value) => isSnowflake(value), "Expected a Discord snowflake"),
		),
	),
	maxLength(MAXIMUM_COMMAND_RULE_ENTRIES),
);

/**
 * The body of `PUT /api/guilds/:guild/command-rules/:command`: the command's
 * status, the lists the dashboard edits and whether it is kept to the allowed
 * ones, and the revision the editor opened with (`getCommandRuleRevision`).
 */
export const CommandRulePutSchema = object({
	revision: pipe(number(), integer(), minValue(0), maxValue(4_294_967_295)),
	enabled: boolean(),
	onlyAllowed: boolean(),
	allowedChannels: RuleListSchema,
	ignoredChannels: RuleListSchema,
	allowedRoles: RuleListSchema,
	ignoredRoles: RuleListSchema,
});
