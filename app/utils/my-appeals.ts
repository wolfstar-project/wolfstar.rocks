import type { AppealChoiceQuestion, AppealQuestion } from "#shared/utils/appeal-forms";
import type {
	AppealPage,
	AppealPageForm,
	AppealSubmissionAnswers,
	MyAppealCase,
} from "#shared/utils/my-appeals";

const UNITS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
	["year", 365 * 86_400_000],
	["month", 30 * 86_400_000],
	["week", 7 * 86_400_000],
	["day", 86_400_000],
	["hour", 3_600_000],
	["minute", 60_000],
];

/** The largest whole unit of a span of time, at least a minute. */
function wholeUnit(milliseconds: number): { amount: number; unit: Intl.RelativeTimeFormatUnit } {
	const absolute = Math.abs(milliseconds);
	for (const [unit, size] of UNITS) {
		if (absolute >= size) return { amount: Math.round(absolute / size), unit };
	}
	return { amount: 1, unit: "minute" };
}

/** When something was or will be, from `now`: "3 days ago", "in 22 hours". */
export function formatRelative(date: string | number | Date, now: Date, locale: string): string {
	const delta = new Date(date).getTime() - now.getTime();
	const { amount, unit } = wholeUnit(delta);
	return new Intl.RelativeTimeFormat(locale, { numeric: "always" }).format(
		delta < 0 ? -amount : amount,
		unit,
	);
}

/** How long a case lasts, in words: "30 days", "1 hour". */
export function formatSpan(milliseconds: number, locale: string): string {
	const { amount, unit } = wholeUnit(milliseconds);
	return new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay: "long" }).format(
		amount,
	);
}

/** When a temporary case ends, `null` for a permanent one. */
export function caseEndsAt(entry: Pick<MyAppealCase, "createdAt" | "duration">): Date | null {
	return entry.duration === null ? null : new Date(Date.parse(entry.createdAt) + entry.duration);
}

/** The letters a server without an icon shows: the first of its first two words. */
export function guildInitials(name: string): string {
	const words = name.trim().split(/\s+/u).filter(Boolean);
	return words
		.slice(0, 2)
		.map((word) => Array.from(word)[0]?.toLocaleUpperCase() ?? "")
		.join("");
}

/** What the member answered so far, by question: the text, or the values picked. */
export type AppealDraftAnswers = Record<string, string | string[]>;

/**
 * The forms of a server's page a dialog offers for a case: the ones that take
 * it, and the locked ones, which it lists dimmed with why. A form locked
 * because it takes none of the member's cases is about another case and is
 * left out.
 */
export function formsForCase(page: AppealPage, caseId: number): AppealPageForm[] {
	return page.forms.filter((form) =>
		form.lock === null
			? form.cases.some((entry) => entry.id === caseId)
			: form.lock !== "noEligibleCase",
	);
}

/** Whether a form can be sent from the website: none of its questions asks for files it cannot take. */
export function formNeedsFiles(form: Pick<AppealPageForm, "questions">): boolean {
	return form.questions.some((question) => question.kind === "attachment" && question.min > 0);
}

/**
 * How many more options a choice question needs picked before the bot takes
 * it: none once it has its `min`, or when it may be left empty and is. A
 * question picked at all needs its `min`, required or not.
 */
export function missingChoices(
	question: Pick<AppealChoiceQuestion, "min" | "required">,
	answer: string | string[] | undefined,
): number {
	const picked = Array.isArray(answer) ? answer.length : 0;
	if (picked === 0 && !question.required) return 0;
	return Math.max(Math.max(question.min, 1) - picked, 0);
}

function isMissing(question: AppealQuestion, answer: string | string[] | undefined): boolean {
	if (question.kind === "text") {
		return question.required && !(typeof answer === "string" && answer.trim().length > 0);
	}
	if (question.kind === "choice") return missingChoices(question, answer) > 0;
	return false;
}

/**
 * The questions whose answer is missing or too short to send, by their ID:
 * a required one left empty, and a choice with fewer options picked than it
 * asks for.
 */
export function missingAnswers(
	form: Pick<AppealPageForm, "questions">,
	answers: AppealDraftAnswers,
): string[] {
	return form.questions.flatMap((question) =>
		isMissing(question, answers[question.id]) ? [question.id] : [],
	);
}

/**
 * What a form is sent with: the texts trimmed, the values picked, and nothing
 * for a question left empty, which the bot reads as unanswered.
 */
export function buildSubmission(
	form: Pick<AppealPageForm, "questions">,
	answers: AppealDraftAnswers,
): AppealSubmissionAnswers {
	const out: AppealSubmissionAnswers = {};
	for (const question of form.questions) {
		const answer = answers[question.id];
		if (question.kind === "text" && typeof answer === "string" && answer.trim()) {
			out[question.id] = answer.trim();
		} else if (question.kind === "choice" && Array.isArray(answer) && answer.length > 0) {
			out[question.id] = [...answer];
		}
	}
	return out;
}
