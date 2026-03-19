import {
	pipe,
	number,
	minValue,
	maxValue,
	union,
	literal,
	object,
	boolean,
	array,
	string,
	type InferOutput,
} from "valibot";

/**
 * Hard-action punishment type: 0 (None) … 5 (Ban).
 */
const HardActionSchema = pipe(number(), minValue(0), maxValue(5));

/**
 * Threshold window in seconds (0 – 120 s).
 */
const ThresholdDurationSecondsSchema = pipe(number(), minValue(0), maxValue(120));

/**
 * Maximum infraction count before the hard-action triggers (0 – 60).
 */
const ThresholdMaximumSchema = pipe(number(), minValue(0), maxValue(60));

/**
 * Hard-action punishment duration in milliseconds.
 * 0 = no duration (instant / permanent), otherwise 1 000 ms … 1 year.
 */
export const HardActionDurationSchema = union([
	literal(0),
	pipe(number(), minValue(1000), maxValue(31_536_000_000)),
]);

/**
 * Schema for the Capitals filter settings form.
 */
export const CapitalsFilterSchema = object({
	hardActionDurationMs: HardActionDurationSchema,
	selfmodCapitalsEnabled: boolean(),
	selfmodCapitalsHardAction: HardActionSchema,
	selfmodCapitalsMaximum: pipe(number(), minValue(10), maxValue(100)),
	selfmodCapitalsMinimum: pipe(number(), minValue(5), maxValue(2000)),
	selfmodCapitalsThresholdDurationSeconds: ThresholdDurationSecondsSchema,
	selfmodCapitalsThresholdMaximum: ThresholdMaximumSchema,
	softActionAlerts: boolean(),
	softActionDeletes: boolean(),
	softActionLogs: boolean(),
});

/**
 * Schema for the Invites filter settings form.
 */
export const InvitesFilterSchema = object({
	hardActionDurationMs: HardActionDurationSchema,
	selfmodInvitesEnabled: boolean(),
	selfmodInvitesHardAction: HardActionSchema,
	selfmodInvitesThresholdDurationSeconds: ThresholdDurationSecondsSchema,
	selfmodInvitesThresholdMaximum: ThresholdMaximumSchema,
	softActionAlerts: boolean(),
	softActionDeletes: boolean(),
	softActionLogs: boolean(),
});

/**
 * Schema for the Links filter settings form.
 */
export const LinksFilterSchema = object({
	hardActionDurationMs: HardActionDurationSchema,
	selfmodLinksAllowed: array(string()),
	selfmodLinksEnabled: boolean(),
	selfmodLinksHardAction: HardActionSchema,
	selfmodLinksThresholdDurationSeconds: ThresholdDurationSecondsSchema,
	selfmodLinksThresholdMaximum: ThresholdMaximumSchema,
	softActionAlerts: boolean(),
	softActionDeletes: boolean(),
	softActionLogs: boolean(),
});

/**
 * Schema for the Message Duplication filter settings form.
 */
export const MessagesFilterSchema = object({
	hardActionDurationMs: HardActionDurationSchema,
	selfmodMessagesEnabled: boolean(),
	selfmodMessagesHardAction: HardActionSchema,
	selfmodMessagesThresholdDurationSeconds: ThresholdDurationSecondsSchema,
	selfmodMessagesThresholdMaximum: ThresholdMaximumSchema,
	softActionAlerts: boolean(),
	softActionDeletes: boolean(),
	softActionLogs: boolean(),
});

/**
 * Schema for the New Lines filter settings form.
 */
export const NewlinesFilterSchema = object({
	hardActionDurationMs: HardActionDurationSchema,
	selfmodNewlinesEnabled: boolean(),
	selfmodNewlinesHardAction: HardActionSchema,
	selfmodNewlinesMaximum: pipe(number(), minValue(10), maxValue(2000)),
	selfmodNewlinesThresholdDurationSeconds: ThresholdDurationSecondsSchema,
	selfmodNewlinesThresholdMaximum: ThresholdMaximumSchema,
	softActionAlerts: boolean(),
	softActionDeletes: boolean(),
	softActionLogs: boolean(),
});

/**
 * Schema for the Reactions filter settings form.
 */
export const ReactionsFilterSchema = object({
	hardActionDurationMs: HardActionDurationSchema,
	selfmodReactionsEnabled: boolean(),
	selfmodReactionsHardAction: HardActionSchema,
	selfmodReactionsThresholdDurationSeconds: ThresholdDurationSecondsSchema,
	selfmodReactionsThresholdMaximum: ThresholdMaximumSchema,
	softActionAlerts: boolean(),
	softActionDeletes: boolean(),
	softActionLogs: boolean(),
});

/**
 * Schema for the Word filter settings form.
 */
export const WordFilterSchema = object({
	hardActionDurationMs: pipe(number(), minValue(0)),
	selfmodFilterEnabled: boolean(),
	selfmodFilterHardAction: HardActionSchema,
	selfmodFilterRaw: array(string()),
	selfmodFilterThresholdDurationSeconds: ThresholdDurationSecondsSchema,
	selfmodFilterThresholdMaximum: ThresholdMaximumSchema,
	softActionAlerts: boolean(),
	softActionDeletes: boolean(),
	softActionLogs: boolean(),
});

export type CapitalsFilter = InferOutput<typeof CapitalsFilterSchema>;
export type InvitesFilter = InferOutput<typeof InvitesFilterSchema>;
export type LinksFilter = InferOutput<typeof LinksFilterSchema>;
export type MessagesFilter = InferOutput<typeof MessagesFilterSchema>;
export type NewlinesFilter = InferOutput<typeof NewlinesFilterSchema>;
export type ReactionsFilter = InferOutput<typeof ReactionsFilterSchema>;
export type WordFilter = InferOutput<typeof WordFilterSchema>;
