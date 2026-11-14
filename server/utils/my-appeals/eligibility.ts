import type { AppealStatus } from "#shared/utils/appeal-queue";
import type {
	AppealPageLock,
	MyAppealCaseType,
	MyAppealClosedReason,
} from "#shared/utils/my-appeals";
import type { Snowflake } from "discord-api-types/v10";
import { AppealCaseTypes } from "#shared/utils/appeal-forms";

// Ported from the bot (wolfstar-project/wolfstar, V7): `isAppealable` and
// `findAppealableCases` of `projects/bot/src/lib/moderation/appeals.ts`, and
// `getAppealFormAccess` of `projects/bot/src/lib/moderation/appealForms.ts`.
// The list of the member's appeals says what the bot would answer, without
// asking it for every server; the bot runs its own when an appeal is sent.

/** A case of the member, as far as the eligibility reads it. */
export interface EligibleCase {
	/** The number of the case in its server. */
	id: number;
	type: MyAppealCaseType;
	/** Whether it is the case that undid another (an unban, an unmute). */
	undo: boolean;
	/** Whether its time ran out, or it was undone. */
	completed: boolean;
	archived: boolean;
}

/** An appeal of the member in the server. */
export interface EligibleAppeal {
	caseId: number;
	status: AppealStatus;
	/** In milliseconds. */
	createdAt: number;
	decidedAt: number | null;
}

/** What a form says about who can use it. */
export interface EligibleForm {
	enabled: boolean;
	/** The bot's numbers of the kinds of case; every kind the settings allow when empty. */
	types: readonly number[];
	requiredRoles: readonly Snowflake[];
	restrictedRoles: readonly Snowflake[];
}

export interface AppealTypeSettings {
	appealsEnabled: boolean;
	appealsBans: boolean;
	appealsMutes: boolean;
	appealsTimeouts: boolean;
}

export interface AppealLimitSettings {
	appealsCooldownDays: number;
	appealsMaxActive: number;
}

const DAY = 86_400_000;

/** The form of a server that set none up: every kind, every member. */
const BuiltInEligibleForm: EligibleForm = {
	enabled: true,
	types: [],
	requiredRoles: [],
	restrictedRoles: [],
};

/** Whether a server takes the appeals of a kind of case: the bot's `isAppealable`. */
export function isAppealableType(settings: AppealTypeSettings, type: MyAppealCaseType): boolean {
	if (!settings.appealsEnabled) return false;
	if (type === "Ban") return settings.appealsBans;
	if (type === "Mute") return settings.appealsMutes;
	return settings.appealsTimeouts;
}

/**
 * The cases still in course: the latest of each kind, when it is not undone,
 * not ended and not archived. The bot's `findAppealableCases` without the
 * settings, which {@linkcode findAppealableCases} adds: a case the server does
 * not take is still listed, as one it takes no appeal for.
 */
export function findCasesInCourse<Case extends EligibleCase>(cases: Iterable<Case>): Case[] {
	const latest = new Map<MyAppealCaseType, Case>();
	for (const entry of cases) {
		if (entry.archived) continue;
		const known = latest.get(entry.type);
		if (known === undefined || entry.id > known.id) latest.set(entry.type, entry);
	}
	return [...latest.values()]
		.filter((entry) => !entry.undo && !entry.completed)
		.toSorted((a, b) => b.id - a.id);
}

/** The cases a member can appeal in a server: the bot's `findAppealableCases`. */
export function findAppealableCases<Case extends EligibleCase>(
	cases: Iterable<Case>,
	settings: AppealTypeSettings,
): Case[] {
	return findCasesInCourse([...cases].filter((entry) => isAppealableType(settings, entry.type)));
}

export type EligibleFormAccess<Case extends EligibleCase> =
	| { open: true; cases: Case[] }
	| { open: false; lock: Exclude<AppealPageLock, "cooldown"> }
	| { open: false; lock: "cooldown"; until: number };

/** Whether a member can send a form now, and with which cases: the bot's `getAppealFormAccess`. */
export function getAppealFormAccess<Case extends EligibleCase>(input: {
	form: EligibleForm;
	settings: AppealLimitSettings;
	/** The roles of the member, `null` for a user who is not one: a banned one is not. */
	roles: readonly Snowflake[] | null;
	/** The cases the server takes appeals for, see {@linkcode findAppealableCases}. */
	cases: readonly Case[];
	appeals: readonly EligibleAppeal[];
	/** In milliseconds. */
	now: number;
}): EligibleFormAccess<Case> {
	const { form, settings, roles, appeals } = input;
	if (!form.enabled) return { open: false, lock: "disabled" };

	if (roles !== null && form.restrictedRoles.some((role) => roles.includes(role))) {
		return { open: false, lock: "restrictedRole" };
	}
	if (
		form.requiredRoles.length > 0 &&
		!form.requiredRoles.some((role) => roles?.includes(role))
	) {
		return { open: false, lock: "missingRole" };
	}

	const appealed = new Set(appeals.map((appeal) => appeal.caseId));
	const cases = input.cases.filter(
		(entry) =>
			!appealed.has(entry.id) &&
			(form.types.length === 0 || form.types.includes(AppealCaseTypes[entry.type])),
	);
	if (cases.length === 0) return { open: false, lock: "noEligibleCase" };

	const until = cooldownEnd(appeals, settings);
	if (until !== null && input.now < until) return { open: false, lock: "cooldown", until };

	const pending = appeals.filter((appeal) => appeal.status === "pending").length;
	if (pending >= settings.appealsMaxActive) return { open: false, lock: "maxActive" };

	return { open: true, cases };
}

/**
 * When the member can appeal again after their latest denial in the server,
 * in milliseconds; `null` when nothing was denied or the server has no cooldown.
 */
export function cooldownEnd(
	appeals: readonly EligibleAppeal[],
	settings: AppealLimitSettings,
): number | null {
	const denied = Math.max(
		0,
		...appeals
			.filter((appeal) => appeal.status === "denied")
			.map((appeal) => appeal.decidedAt ?? appeal.createdAt),
	);
	if (denied === 0 || settings.appealsCooldownDays <= 0) return null;
	return denied + settings.appealsCooldownDays * DAY;
}

/** Where a case without an appeal stands: it can be appealed, or why it cannot. */
export type CaseOpening =
	| { status: "open" }
	| {
			status: "closed";
			reason: MyAppealClosedReason;
			detail: string | null;
			againAt: number | null;
	  };

/**
 * Whether a case with no appeal can be appealed now, and if not, why: the
 * member is blocked, appeals are off, the server does not take the kind, or
 * every form is closed to it. A form that would take the case but for the
 * member's waiting appeals or a recent denial says so; anything else (disabled,
 * roles) reads as no form.
 */
export function decideCaseOpening<Case extends EligibleCase>(input: {
	entry: Case;
	settings: AppealTypeSettings & AppealLimitSettings;
	block: { reason: string | null } | null;
	/** The forms of the server; the built-in one is used when it has none. */
	forms: readonly EligibleForm[];
	roles: readonly Snowflake[] | null;
	/** Every case of the member in the server. */
	cases: readonly Case[];
	appeals: readonly EligibleAppeal[];
	now: number;
}): CaseOpening {
	const { entry, settings, block } = input;
	const closed = (
		reason: MyAppealClosedReason,
		detail: string | null = null,
		againAt: number | null = null,
	): CaseOpening => ({ status: "closed", reason, detail, againAt });

	if (block !== null) return closed("blocked", block.reason);
	if (!settings.appealsEnabled) return closed("off");
	if (!isAppealableType(settings, entry.type)) return closed("type");

	const cases = findAppealableCases(input.cases, settings);
	const forms = input.forms.length === 0 ? [BuiltInEligibleForm] : input.forms;
	// Only the forms that take this kind of case can say why it cannot be sent:
	const takers = forms
		.filter(
			(form) => form.types.length === 0 || form.types.includes(AppealCaseTypes[entry.type]),
		)
		.map((form) =>
			getAppealFormAccess({
				form,
				settings,
				roles: input.roles,
				cases,
				appeals: input.appeals,
				now: input.now,
			}),
		);
	if (takers.some((access) => access.open && access.cases.some((item) => item.id === entry.id))) {
		return { status: "open" };
	}

	for (const access of takers) {
		if (!access.open && access.lock === "cooldown")
			return closed("cooldown", null, access.until);
	}
	if (takers.some((access) => !access.open && access.lock === "maxActive"))
		return closed("maxActive");
	return closed("noForm");
}
