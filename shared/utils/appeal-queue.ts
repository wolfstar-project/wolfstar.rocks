/**
 * What the review queue of the appeals shares between the dashboard's server
 * and its page: the appeals of a guild as the page lists them, and the request
 * the page makes to the bot to decide one.
 *
 * The bot decides, not the dashboard: a decision is an `AppealRequest` row,
 * announced with `NOTIFY appeal_request, '<id>'`, that the bot claims, runs
 * and marks done, with why it could not be (see `projects/bot/src/lib/moderation/
 * appealRequests.ts` in wolfstar-project/wolfstar, V7).
 */
import type { ModerationTypeName } from "#shared/types/moderation-types";

/** Where an appeal stands, as the bot's `AppealStatuses` lists it. */
export const AppealStatuses = ["pending", "accepted", "denied"] as const;
export type AppealStatus = (typeof AppealStatuses)[number];

/** What the queue shows: one status, or all of them. */
export const AppealQueueFilters = [...AppealStatuses, "all"] as const;
export type AppealQueueFilter = (typeof AppealQueueFilters)[number];

/** How many appeals a page of the queue holds, and the most a request can ask for. */
export const AppealQueuePageSize = 25;
export const MaximumAppealQueueLimit = 100;

/** What the dashboard can ask the bot to do with an appeal, as the bot's `AppealRequestKind` spells it. */
const AppealDecisions = ["Approve", "Deny"] as const;
export type AppealDecision = (typeof AppealDecisions)[number];

export function isAppealDecision(value: unknown): value is AppealDecision {
	return AppealDecisions.includes(value as AppealDecision);
}

/** The longest reason of a decision, the bot's `MaximumAppealReasonLength`. */
export const MaximumAppealDecisionReasonLength = 500;

/** A user of the queue: who appealed, or who decided. */
export interface AppealQueueUser {
	id: string;
	/** What Discord shows of them: their global name, or their username. */
	displayName: string;
	/** The hash of their avatar, `null` for the default one. */
	avatar: string | null;
}

/** The answer to a question of the form, written for a person to read. */
export interface AppealQueueAnswer {
	questionId: string;
	/** The question as it was asked when the member answered. */
	label: string;
	/** The text; the labels picked, joined; the names of the files, joined. */
	value: string;
}

/** An appeal as the queue lists it. */
export interface AppealQueueEntry {
	id: string;
	/** The case it appeals. */
	caseId: number;
	/** The type of that case, `null` when the case is gone. */
	caseType: ModerationTypeName | null;
	/** The form it was sent with, `null` for the built-in one or a form that was deleted. */
	formName: string | null;
	user: AppealQueueUser;
	status: AppealStatus;
	answers: AppealQueueAnswer[];
	/** The reason the staff gave, `null` while pending or when they gave none. */
	reason: string | null;
	/** Who decided it, `null` while pending. */
	reviewer: AppealQueueUser | null;
	/** An ISO 8601 date. */
	createdAt: string;
	/** An ISO 8601 date, `null` while pending. */
	decidedAt: string | null;
}

export interface AppealQueueResponse {
	entries: AppealQueueEntry[];
	/** How many appeals the filter matches, for the pages after this one. */
	total: number;
	/** How many appeals the guild has in each status, for the filters. */
	counts: Record<AppealStatus, number>;
	/** Whether who asks reviews the appeals of the guild, so can accept and deny. */
	canReview: boolean;
}

/** Why the bot could not do a request, the codes its `AppealFailureCode` has for a decision. */
const AppealFailureCodes = ["caseGone", "decided", "undoFailed", "noAccess", "failed"] as const;
export type AppealFailureCode = (typeof AppealFailureCodes)[number];

/** Where a request of the dashboard is: not claimed yet, done, or refused with a code. */
type AppealRequestState = "pending" | "done" | "failed";

export interface AppealRequestOutcome {
	id: string;
	state: AppealRequestState;
	/** Why it failed; `null` unless `state` is `failed`. */
	code: AppealFailureCode | null;
	/** The sentence the bot wrote for the code, in English; `null` unless `state` is `failed`. */
	detail: string | null;
}

/**
 * Reads the `error` column of a request, which the bot writes as `<code>: <detail>`.
 * A code the dashboard does not know reads as `failed`.
 */
export function parseAppealFailure(error: string): { code: AppealFailureCode; detail: string } {
	const separator = error.indexOf(": ");
	const code = separator === -1 ? error : error.slice(0, separator);
	const detail = separator === -1 ? "" : error.slice(separator + 2);
	return AppealFailureCodes.includes(code as AppealFailureCode)
		? { code: code as AppealFailureCode, detail }
		: { code: "failed", detail: error };
}
