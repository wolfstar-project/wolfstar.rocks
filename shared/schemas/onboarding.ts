import { isSnowflake } from "#shared/utils/snowflake";
import {
	array,
	boolean,
	check,
	integer,
	maxLength,
	minValue,
	nullable,
	number,
	object,
	optional,
	partial,
	picklist,
	pipe,
	regex,
	string,
	transform,
	type InferOutput,
} from "valibot";
import {
	MaximumOnboardingStages,
	OnboardingChallenges,
	OnboardingFailureActions,
	OnboardingStageTriggers,
} from "../utils/onboarding";

/** The ID of a row of a table whose key is generated, a positive `bigint`. */
const ROW_ID_PATTERN = /^\d{1,18}$/u;

const SnowflakeSchema = pipe(
	string(),
	check((value) => isSnowflake(value), "Expected a Discord snowflake"),
);

const RowIdSchema = pipe(string(), regex(ROW_ID_PATTERN, "Expected the ID of a row"));

/**
 * The revision a write read: the server refuses the write when the
 * configuration moved on since.
 */
const RevisionSchema = pipe(number(), integer(), minValue(0));

/**
 * A text of a stage. Its length is not checked here but by
 * `parseOnboardingStage()`, which names the problem the editor shows; the
 * bound only keeps an absurd body from being read.
 */
const StageTextSchema = pipe(string(), maxLength(1000));

/**
 * The fields of a stage, each of its type. What makes a stage one the bot can
 * run (a name, a question with its answers, the limits) is
 * `parseOnboardingStage()`'s.
 */
const OnboardingStageFieldsEntries = {
	name: StageTextSchema,
	enabled: boolean(),
	trigger: picklist(OnboardingStageTriggers),
	challenge: picklist(OnboardingChallenges),
	question: nullable(StageTextSchema),
	answers: pipe(array(StageTextSchema), maxLength(50)),
	maxAttempts: number(),
	timeLimit: number(),
	roleId: nullable(SnowflakeSchema),
	failureAction: picklist(OnboardingFailureActions),
	failureTimeout: nullable(number()),
};

/**
 * A stage read field by field: the name is required, everything else takes
 * the bot's default when it is left out.
 */
const OnboardingStageFieldsSchema = object({
	name: OnboardingStageFieldsEntries.name,
	enabled: optional(boolean(), true),
	trigger: optional(OnboardingStageFieldsEntries.trigger, "Join"),
	challenge: optional(OnboardingStageFieldsEntries.challenge, "Button"),
	question: optional(OnboardingStageFieldsEntries.question, null),
	answers: optional(OnboardingStageFieldsEntries.answers, []),
	maxAttempts: optional(number(), 3),
	timeLimit: optional(number(), 600),
	roleId: optional(OnboardingStageFieldsEntries.roleId, null),
	failureAction: optional(OnboardingStageFieldsEntries.failureAction, "None"),
	failureTimeout: optional(OnboardingStageFieldsEntries.failureTimeout, null),
});

/** The body of `POST /api/guilds/:guild/onboarding/stages`. */
export const OnboardingStageCreateBodySchema = object({
	revision: RevisionSchema,
	stage: OnboardingStageFieldsSchema,
});
export type OnboardingStageCreateBody = InferOutput<typeof OnboardingStageCreateBodySchema>;

/**
 * The body of `PATCH /api/guilds/:guild/onboarding/stages/:stage`: the fields
 * that change. The stage they make with the others is checked on the server,
 * against the stage the database has.
 */
export const OnboardingStagePatchBodySchema = object({
	revision: RevisionSchema,
	stage: partial(object(OnboardingStageFieldsEntries)),
});
export type OnboardingStagePatchBody = InferOutput<typeof OnboardingStagePatchBodySchema>;

/** The body of `PUT /api/guilds/:guild/onboarding/stages/order`: every stage's ID, in the new order. */
export const OnboardingStageOrderBodySchema = object({
	revision: RevisionSchema,
	order: pipe(array(RowIdSchema), maxLength(MaximumOnboardingStages)),
});
export type OnboardingStageOrderBody = InferOutput<typeof OnboardingStageOrderBodySchema>;

/** The body of `PATCH /api/guilds/:guild/onboarding`: the log channel, or `null` for none. */
export const OnboardingSettingsBodySchema = object({
	revision: RevisionSchema,
	logChannelId: nullable(SnowflakeSchema),
});
export type OnboardingSettingsBody = InferOutput<typeof OnboardingSettingsBodySchema>;

/** The query of `DELETE /api/guilds/:guild/onboarding/stages/:stage`, which has no body. */
export const OnboardingRevisionQuerySchema = object({
	revision: pipe(
		string(),
		regex(/^\d{1,9}$/u, "Expected a revision"),
		transform((value) => Number(value)),
	),
});

/** The ID of a stage in a path. */
export const OnboardingStageIdSchema = RowIdSchema;
