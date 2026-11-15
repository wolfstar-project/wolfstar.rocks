/**
 * What the member's own appeals area shares between the dashboard's server
 * and its Home: the cases of the member that a server takes appeals for, where
 * each stands, and the page of a server the bot answers when an appeal is made.
 *
 * The list is read from the database the dashboard shares with the bot; the
 * page of a server and the sending of an appeal go to the bot's own API
 * (`GET /appeals/:guild`, `POST /appeals/:guild/:form` in wolfstar-project/
 * wolfstar, V7), which decides what can be appealed, posts the appeal to the
 * staff and opens its thread.
 */
import type { AppealQuestion } from "#shared/utils/appeal-forms";
import type { AppealQueueAnswer } from "#shared/utils/appeal-queue";

/** The kinds of case a member can appeal. */
export const MyAppealCaseTypes = ["Ban", "Mute", "Timeout"] as const;
export type MyAppealCaseType = (typeof MyAppealCaseTypes)[number];

/**
 * Where a case stands for the member: it can be appealed, its appeal waits, was
 * denied or accepted, or the server takes no appeal for it.
 */
const MyAppealStatuses = ["open", "pending", "denied", "accepted", "closed"] as const;
export type MyAppealStatus = (typeof MyAppealStatuses)[number];

/** The filters of the area, the mockup's: every case, the ones that can be appealed, waiting, decided. */
export const MyAppealFilters = ["all", "open", "pending", "decided"] as const;
export type MyAppealFilter = (typeof MyAppealFilters)[number];

/** Whether a case is in a filter: `decided` holds the denied, the accepted and the closed. */
export function isInMyAppealFilter(status: MyAppealStatus, filter: MyAppealFilter): boolean {
	if (filter === "all") return true;
	if (filter === "decided")
		return status === "denied" || status === "accepted" || status === "closed";
	return status === filter;
}

/**
 * Why a server takes no appeal for a case: appeals are off, it does not take
 * this kind of case, the member is blocked from appealing, every form is
 * disabled or keeps the member out by role, the member has as many appeals
 * waiting as the server allows, or a denial is too recent (`againAt` says until
 * when).
 */
const MyAppealClosedReasons = [
	"off",
	"type",
	"blocked",
	"noForm",
	"maxActive",
	"cooldown",
] as const;
export type MyAppealClosedReason = (typeof MyAppealClosedReasons)[number];

export interface MyAppealGuild {
	id: string;
	name: string;
	/** The hash of the server's icon, `null` when it has none. */
	icon: string | null;
}

export interface MyAppealCase {
	/** The number of the case in its server. */
	id: number;
	type: MyAppealCaseType;
	reason: string | null;
	/** An ISO 8601 date. */
	createdAt: string;
	/** In milliseconds; `null` for a permanent one. */
	duration: number | null;
	/** Whether it still holds, ran out (a temporary one), or was undone. */
	state: "active" | "ended" | "lifted";
}

/** The appeal the member sent for a case. */
interface MyAppealSent {
	/** The form it was sent with, `null` for the built-in one or a deleted form. */
	formName: string | null;
	answers: AppealQueueAnswer[];
	/** ISO 8601 dates. */
	createdAt: string;
	decidedAt: string | null;
	/** What the staff wrote with the decision. */
	reason: string | null;
}

export interface MyAppealEntry {
	/** `<guild id>:<case id>`, unique in the list. */
	key: string;
	guild: MyAppealGuild;
	case: MyAppealCase;
	status: MyAppealStatus;
	appeal: MyAppealSent | null;
	/**
	 * When the member can appeal again after a denial, an ISO 8601 date: on a
	 * denied case, and on a case `closed` for the `cooldown`; `null` otherwise or
	 * once it passed.
	 */
	againAt: string | null;
	/** Why the server takes no appeal for the case, when `status` is `closed`. */
	closed: { reason: MyAppealClosedReason; detail: string | null } | null;
}

export interface MyAppealsResponse {
	/** Newest case first. */
	entries: MyAppealEntry[];
	/** How many cases can be appealed now, the badge of the area. */
	openCount: number;
}

/** Why a form of a server cannot be used now, the bot's `AppealFormLock`. */
export type AppealPageLock =
	| "disabled"
	| "missingRole"
	| "restrictedRole"
	| "noEligibleCase"
	| "cooldown"
	| "maxActive";

/** A form of the page of a server, as the bot's `GET /appeals/:guild` answers it. */
export interface AppealPageForm {
	/** `null` for the built-in form of a server that set none up. */
	id: string | null;
	name: string;
	description: string | null;
	icon: string | null;
	questions: AppealQuestion[];
	lockReason: string | null;
	lock: AppealPageLock | null;
	/** When a `cooldown` lock ends, in milliseconds. */
	until: number | null;
	/** The cases the form takes now; empty when it is locked. */
	cases: {
		id: number;
		type: string;
		reason: string | null;
		createdAt: number;
		duration: number | null;
	}[];
}

/** The page of a server for the member, as the bot answers it. */
export interface AppealPage {
	guild: { id: string; name: string; icon: string | null };
	enabled: boolean;
	block: { reason: string | null } | null;
	forms: AppealPageForm[];
	appeals: {
		caseId: number;
		formId: string | null;
		status: "pending" | "accepted" | "denied";
		reason: string | null;
		reviewerId: string | null;
		createdAt: number;
	}[];
}

/** The path segment of the built-in form, which has no ID: the bot's `BuiltInForm`. */
export const BuiltInAppealFormPath = "builtin";

/** What the member answered, by the ID of each question: the text, the values picked, the files. */
export type AppealSubmissionAnswers = Record<string, string | string[]>;

/** Why the bot refused an appeal, its `submitAppeal` errors, and `generic` for anything else. */
export const AppealSubmitErrors = [
	"disabled",
	"blocked",
	"locked",
	"notFound",
	"notAppealable",
	"invalid",
	"appealed",
	"generic",
] as const;
export type AppealSubmitError = (typeof AppealSubmitErrors)[number];
