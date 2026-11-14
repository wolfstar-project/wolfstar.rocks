import { isSnowflake } from "#shared/utils/snowflake";
import {
	boolean,
	check,
	literal,
	maxLength,
	nullable,
	number,
	object,
	optional,
	partial,
	picklist,
	pipe,
	regex,
	string,
	trim,
	variant,
} from "valibot";
import {
	JoinGuardHardActions,
	JoinGuardLimits,
	JoinGuardQueueFilters,
	validateJoinGuardRule,
	type JoinGuardRuleInput,
} from "../utils/join-guard";

/** The ID of a row of a table whose key is generated, a positive `bigint`. */
const ROW_ID_PATTERN = /^\d{1,18}$/u;

const SnowflakeSchema = pipe(
	string(),
	check((value) => isSnowflake(value), "Expected a Discord snowflake"),
);

const RowIdSchema = pipe(string(), regex(ROW_ID_PATTERN, "Expected the ID of a row"));

/**
 * A text of a rule. Its length is not checked here but by
 * `validateJoinGuardRule()`, which names the problem the editor shows; the
 * bound only keeps an absurd body from being read.
 */
const RuleTextSchema = pipe(string(), maxLength(1000), trim());

/**
 * The fields of a rule, each of its type. What makes a rule one the bot can
 * run (a name, a condition, an action, the limits) is `validateJoinGuardRule()`'s.
 */
const JoinGuardRuleFieldsEntries = {
	name: RuleTextSchema,
	enabled: boolean(),
	accountAgeMax: nullable(number()),
	defaultAvatar: boolean(),
	generatedName: boolean(),
	nameContains: nullable(RuleTextSchema),
	unverifiedBot: boolean(),
	sendToCheckpoint: boolean(),
	roleId: nullable(SnowflakeSchema),
	directMessage: boolean(),
	alertChannelId: nullable(SnowflakeSchema),
	hardAction: nullable(picklist(JoinGuardHardActions)),
};

/**
 * The body of `POST /api/guilds/:guild/joinguard/rules`, read field by field:
 * the name is required, everything else takes the bot's default when it is
 * left out (enabled, no condition, no action).
 */
export const JoinGuardRuleFieldsSchema = object({
	name: JoinGuardRuleFieldsEntries.name,
	enabled: optional(boolean(), true),
	accountAgeMax: optional(JoinGuardRuleFieldsEntries.accountAgeMax, null),
	defaultAvatar: optional(boolean(), false),
	generatedName: optional(boolean(), false),
	nameContains: optional(JoinGuardRuleFieldsEntries.nameContains, null),
	unverifiedBot: optional(boolean(), false),
	sendToCheckpoint: optional(boolean(), false),
	roleId: optional(JoinGuardRuleFieldsEntries.roleId, null),
	directMessage: optional(boolean(), false),
	alertChannelId: optional(JoinGuardRuleFieldsEntries.alertChannelId, null),
	hardAction: optional(JoinGuardRuleFieldsEntries.hardAction, null),
});

/**
 * A whole rule the bot can run: {@link JoinGuardRuleFieldsSchema}, and then
 * `validateJoinGuardRule()` (its problem is the message of the issue).
 */
export const JoinGuardRuleInputSchema = pipe(
	JoinGuardRuleFieldsSchema,
	check(
		(input: JoinGuardRuleInput) => validateJoinGuardRule(input) === null,
		(issue) => validateJoinGuardRule(issue.input as JoinGuardRuleInput) ?? "invalid",
	),
);

/**
 * The body of `PATCH /api/guilds/:guild/joinguard/rules/:rule`: the fields
 * that change. The rule they make with the others is checked on the server,
 * against the rule the database has.
 */
export const JoinGuardRulePatchSchema = partial(object(JoinGuardRuleFieldsEntries));

/**
 * The query of `GET /api/guilds/:guild/joinguard/checkpoints`: one status, or
 * `all`, and the ID of the last row of the page before.
 */
export const JoinGuardQueueQuerySchema = object({
	status: optional(picklist(JoinGuardQueueFilters), "all"),
	cursor: optional(RowIdSchema),
});

/** The body of `POST /api/guilds/:guild/joinguard/requests`, see `JoinGuardModeratorRequestBody`. */
export const JoinGuardModeratorRequestBodySchema = variant("kind", [
	object({ kind: literal("Verify"), checkpointId: RowIdSchema }),
	object({
		kind: literal("Kick"),
		checkpointId: RowIdSchema,
		reason: optional(pipe(string(), trim(), maxLength(JoinGuardLimits.reason))),
	}),
	object({ kind: literal("PostButton") }),
]);

/** The body of `POST /api/verify/:guild`: the Turnstile token, when the guild asks for a captcha. */
export const JoinGuardVerifyBodySchema = object({
	// Turnstile's tokens are 2048 characters at most.
	turnstileToken: optional(pipe(string(), trim(), maxLength(2048))),
});
