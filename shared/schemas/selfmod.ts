import * as v from "valibot";

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

/**
 * Hard-action punishment type: 0 (None) … 5 (Ban).
 */
const HardActionSchema = v.pipe(v.number(), v.minValue(0), v.maxValue(5));

/**
 * Threshold window in seconds (0 – 120 s).
 */
const ThresholdDurationSecondsSchema = v.pipe(v.number(), v.minValue(0), v.maxValue(120));

/**
 * Maximum infraction count before the hard-action triggers (0 – 60).
 */
const ThresholdMaximumSchema = v.pipe(v.number(), v.minValue(0), v.maxValue(60));

/**
 * Hard-action punishment duration in milliseconds.
 * 0 = no duration (instant / permanent), otherwise 1 000 ms … 1 year.
 */
export const HardActionDurationSchema = v.union([
	v.literal(0),
	v.pipe(v.number(), v.minValue(1000), v.maxValue(31_536_000_000)),
]);

// ---------------------------------------------------------------------------
// Per-filter schemas
// ---------------------------------------------------------------------------

/**
 * Schema for the Capitals filter settings form.
 */
export const CapitalsFilterSchema = v.object({
	hardActionDurationMs: HardActionDurationSchema,
	selfmodCapitalsEnabled: v.boolean(),
	selfmodCapitalsHardAction: HardActionSchema,
	selfmodCapitalsMaximum: v.pipe(v.number(), v.minValue(10), v.maxValue(100)),
	selfmodCapitalsMinimum: v.pipe(v.number(), v.minValue(5), v.maxValue(2000)),
	selfmodCapitalsThresholdDurationSeconds: ThresholdDurationSecondsSchema,
	selfmodCapitalsThresholdMaximum: ThresholdMaximumSchema,
	softActionAlerts: v.boolean(),
	softActionDeletes: v.boolean(),
	softActionLogs: v.boolean(),
});

/**
 * Schema for the Invites filter settings form.
 */
export const InvitesFilterSchema = v.object({
	hardActionDurationMs: HardActionDurationSchema,
	selfmodInvitesEnabled: v.boolean(),
	selfmodInvitesHardAction: HardActionSchema,
	selfmodInvitesThresholdDurationSeconds: ThresholdDurationSecondsSchema,
	selfmodInvitesThresholdMaximum: ThresholdMaximumSchema,
	softActionAlerts: v.boolean(),
	softActionDeletes: v.boolean(),
	softActionLogs: v.boolean(),
});

/**
 * Schema for the Links filter settings form.
 */
export const LinksFilterSchema = v.object({
	hardActionDurationMs: HardActionDurationSchema,
	selfmodLinksAllowed: v.array(v.string()),
	selfmodLinksEnabled: v.boolean(),
	selfmodLinksHardAction: HardActionSchema,
	selfmodLinksThresholdDurationSeconds: ThresholdDurationSecondsSchema,
	selfmodLinksThresholdMaximum: ThresholdMaximumSchema,
	softActionAlerts: v.boolean(),
	softActionDeletes: v.boolean(),
	softActionLogs: v.boolean(),
});

/**
 * Schema for the Message Duplication filter settings form.
 */
export const MessagesFilterSchema = v.object({
	hardActionDurationMs: HardActionDurationSchema,
	selfmodMessagesEnabled: v.boolean(),
	selfmodMessagesHardAction: HardActionSchema,
	selfmodMessagesThresholdDurationSeconds: ThresholdDurationSecondsSchema,
	selfmodMessagesThresholdMaximum: ThresholdMaximumSchema,
	softActionAlerts: v.boolean(),
	softActionDeletes: v.boolean(),
	softActionLogs: v.boolean(),
});

/**
 * Schema for the New Lines filter settings form.
 */
export const NewlinesFilterSchema = v.object({
	hardActionDurationMs: HardActionDurationSchema,
	selfmodNewlinesEnabled: v.boolean(),
	selfmodNewlinesHardAction: HardActionSchema,
	selfmodNewlinesMaximum: v.pipe(v.number(), v.minValue(10), v.maxValue(2000)),
	selfmodNewlinesThresholdDurationSeconds: ThresholdDurationSecondsSchema,
	selfmodNewlinesThresholdMaximum: ThresholdMaximumSchema,
	softActionAlerts: v.boolean(),
	softActionDeletes: v.boolean(),
	softActionLogs: v.boolean(),
});

/**
 * Schema for the Reactions filter settings form.
 */
export const ReactionsFilterSchema = v.object({
	hardActionDurationMs: HardActionDurationSchema,
	selfmodReactionsEnabled: v.boolean(),
	selfmodReactionsHardAction: HardActionSchema,
	selfmodReactionsThresholdDurationSeconds: ThresholdDurationSecondsSchema,
	selfmodReactionsThresholdMaximum: ThresholdMaximumSchema,
	softActionAlerts: v.boolean(),
	softActionDeletes: v.boolean(),
	softActionLogs: v.boolean(),
});

/**
 * Schema for the Word filter settings form.
 */
export const WordFilterSchema = v.object({
	hardActionDurationMs: v.pipe(v.number(), v.minValue(0)),
	selfmodFilterEnabled: v.boolean(),
	selfmodFilterHardAction: HardActionSchema,
	selfmodFilterRaw: v.array(v.string()),
	selfmodFilterThresholdDurationSeconds: ThresholdDurationSecondsSchema,
	selfmodFilterThresholdMaximum: ThresholdMaximumSchema,
	softActionAlerts: v.boolean(),
	softActionDeletes: v.boolean(),
	softActionLogs: v.boolean(),
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type CapitalsFilter = v.InferOutput<typeof CapitalsFilterSchema>;
export type InvitesFilter = v.InferOutput<typeof InvitesFilterSchema>;
export type LinksFilter = v.InferOutput<typeof LinksFilterSchema>;
export type MessagesFilter = v.InferOutput<typeof MessagesFilterSchema>;
export type NewlinesFilter = v.InferOutput<typeof NewlinesFilterSchema>;
export type ReactionsFilter = v.InferOutput<typeof ReactionsFilterSchema>;
export type WordFilter = v.InferOutput<typeof WordFilterSchema>;
