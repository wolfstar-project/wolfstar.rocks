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

/** What the review queue of the appeals asks for: one status or all, and a page of them. */
export const AppealQueueQuerySchema = object({
	status: optional(picklist(AppealQueueFilters), "all"),
	limit: optional(pipe(coercedNumber(1), maxValue(MaximumAppealQueueLimit)), AppealQueuePageSize),
	offset: optional(coercedNumber(0), 0),
});
