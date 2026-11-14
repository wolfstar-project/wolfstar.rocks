import {
	integer,
	maxValue,
	minValue,
	number,
	object,
	optional,
	picklist,
	pipe,
	transform,
	unknown,
} from "valibot";
import {
	AppealQueueFilters,
	AppealQueuePageSize,
	MaximumAppealQueueLimit,
} from "../utils/appeal-queue";

const coercedNumber = (min: number) =>
	pipe(unknown(), transform(Number), number(), integer(), minValue(min));

/**
 * The furthest a page of the queue can start. A guild has nowhere near this
 * many appeals; the bound keeps a huge number from reaching Postgres, which
 * would fail with a 500 instead of answering 400.
 */
export const MaximumAppealQueueOffset = 1_000_000;

/** What the review queue of the appeals asks for: one status or all, and a page of them. */
export const AppealQueueQuerySchema = object({
	status: optional(picklist(AppealQueueFilters), "all"),
	limit: optional(pipe(coercedNumber(1), maxValue(MaximumAppealQueueLimit)), AppealQueuePageSize),
	offset: optional(pipe(coercedNumber(0), maxValue(MaximumAppealQueueOffset)), 0),
});
