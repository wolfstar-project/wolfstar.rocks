import type { AppealFormCreate } from "~/composables/useAppealForms";
import {
	AppealFormLimits,
	asksSomething,
	createAppealQuestion,
	getDefaultAppealForm,
	isAppealFormIcon,
	MaximumAppealFormRoles,
	MaximumAppealQuestions,
	type AppealCaseType,
	type AppealForm,
	type AppealQuestion,
} from "#shared/utils/appeal-forms";
import { toRaw } from "vue";

/**
 * A form as the editor holds it. It differs from the stored form where a
 * control needs it to: a text that can be nothing is an empty string, which a
 * text field can show.
 */
export interface AppealFormDraft {
	name: string;
	description: string;
	icon: string;
	enabled: boolean;
	lockReason: string;
	types: AppealCaseType[];
	requiredRoles: string[];
	restrictedRoles: string[];
	questions: AppealQuestion[];
}

/** The ID of a new question or option: the characters a form field can be named with. */
export function nextAppealId(): string {
	return crypto.randomUUID();
}

type FormFields = Omit<AppealForm, "id" | "guildId" | "position">;

// A form held in a `ref` hands out reactive proxies at every depth, the
// options of a choice included, which `structuredClone` refuses to copy;
// questions are plain JSON, which survives a round trip through it.
function cloneQuestions(questions: readonly AppealQuestion[]): AppealQuestion[] {
	return JSON.parse(JSON.stringify(toRaw(questions))) as AppealQuestion[];
}

function toDraft(form: FormFields): AppealFormDraft {
	return {
		name: form.name,
		description: form.description ?? "",
		icon: form.icon ?? "",
		enabled: form.enabled,
		lockReason: form.lockReason ?? "",
		types: [...form.types],
		requiredRoles: [...form.requiredRoles],
		restrictedRoles: [...form.restrictedRoles],
		questions: cloneQuestions(form.questions),
	};
}

/** The form a new one starts with: one long text question, as the bot's built-in form asks. */
export function createAppealFormDraft(): AppealFormDraft {
	return toDraft({
		...getDefaultAppealForm(),
		questions: [createAppealQuestion("text", nextAppealId)],
	});
}

/** The form an existing one is edited in. */
export function appealFormToDraft(form: AppealForm): AppealFormDraft {
	return toDraft(form);
}

function trimmedOrNull(value: string): string | null {
	const trimmed = value.trim();
	return trimmed.length === 0 ? null : trimmed;
}

/** An optional text of a question under `key`: trimmed, and left out when it is blank. */
function optionalText<Key extends string>(
	key: Key,
	value: string | undefined,
): Partial<Record<Key, string>> {
	const trimmed = trimmedOrNull(value ?? "");
	return trimmed === null ? {} : ({ [key]: trimmed } as Record<Key, string>);
}

function cleanQuestion(question: AppealQuestion): AppealQuestion {
	switch (question.kind) {
		case "text": {
			const { placeholder, help, ...rest } = question;
			return {
				...rest,
				label: question.label.trim(),
				...optionalText("placeholder", placeholder),
				...optionalText("help", help),
			};
		}
		case "choice": {
			const { help, ...rest } = question;
			return {
				...rest,
				label: question.label.trim(),
				...optionalText("help", help),
				options: question.options.map((option) => ({
					label: option.label.trim(),
					value: option.value,
				})),
			};
		}
		case "attachment": {
			const { help, ...rest } = question;
			return { ...rest, label: question.label.trim(), ...optionalText("help", help) };
		}
		case "display":
			return { ...question, content: question.content.trim() };
	}
}

/**
 * The request body a draft is saved with: the texts are trimmed, and a blank
 * one that can be nothing becomes `null`, or is left out of its question.
 */
export function appealFormDraftToBody(draft: AppealFormDraft): AppealFormCreate {
	return {
		name: draft.name.trim(),
		description: trimmedOrNull(draft.description),
		icon: trimmedOrNull(draft.icon),
		enabled: draft.enabled,
		lockReason: trimmedOrNull(draft.lockReason),
		types: [...draft.types],
		requiredRoles: [...draft.requiredRoles],
		restrictedRoles: [...draft.restrictedRoles],
		questions: cloneQuestions(draft.questions).map((question) => cleanQuestion(question)),
	};
}

export type AppealFormProblem =
	| "required"
	| "tooLong"
	| "digitsOnly"
	| "invalidIcon"
	| "overlap"
	| "tooManyRoles"
	| "noQuestion"
	| "tooMany"
	| "tooFewOptions"
	| "tooManyOptions"
	| "badRange";

/**
 * What is wrong with a draft, by the path of the field it is about: `name`,
 * `icon`, `roles`, `questions`, or `questions.<index>.<label|options|range|content>`.
 */
export type AppealFormProblems = Partial<Record<string, AppealFormProblem>>;

function checkText(
	problems: AppealFormProblems,
	path: string,
	value: string,
	maximum: number,
	required: boolean,
) {
	const trimmed = value.trim();
	if (required && trimmed.length === 0) problems[path] = "required";
	else if (trimmed.length > maximum) problems[path] = "tooLong";
}

function checkQuestion(problems: AppealFormProblems, question: AppealQuestion, index: number) {
	const at = (field: string) => `questions.${index}.${field}`;
	if (question.kind === "display") {
		checkText(problems, at("content"), question.content, AppealFormLimits.content, true);
		return;
	}

	checkText(problems, at("label"), question.label, AppealFormLimits.label, true);
	if (question.help !== undefined && question.help.trim().length > AppealFormLimits.help) {
		problems[at("help")] = "tooLong";
	}

	switch (question.kind) {
		case "text": {
			const { minimum, maximum } = AppealFormLimits.answerLength;
			if (
				question.placeholder &&
				question.placeholder.trim().length > AppealFormLimits.placeholder
			)
				problems[at("placeholder")] = "tooLong";
			if (question.maxLength < minimum || question.maxLength > maximum)
				problems[at("range")] = "badRange";
			break;
		}
		case "choice": {
			const { minimum, maximum } = AppealFormLimits.options;
			if (question.options.length < minimum) problems[at("options")] = "tooFewOptions";
			else if (question.options.length > maximum) problems[at("options")] = "tooManyOptions";
			else if (question.options.some((option) => option.label.trim().length === 0))
				problems[at("options")] = "required";
			else if (
				question.options.some(
					(option) => option.label.trim().length > AppealFormLimits.optionLabel,
				)
			)
				problems[at("options")] = "tooLong";
			if (
				question.min < 1 ||
				question.max < question.min ||
				question.max > question.options.length
			)
				problems[at("range")] = "badRange";
			break;
		}
		case "attachment": {
			const { maximum } = AppealFormLimits.files;
			if (
				question.min < 0 ||
				question.max < 1 ||
				question.max < question.min ||
				question.max > maximum
			)
				problems[at("range")] = "badRange";
			break;
		}
	}
}

/**
 * What is wrong with a draft, by the rules the server applies: nothing is
 * missing or too long, the icon is an emoji, no role is both required and kept
 * out, and the questions are one to five with one that asks something.
 */
export function validateAppealFormDraft(draft: AppealFormDraft): AppealFormProblems {
	const problems: AppealFormProblems = {};

	const name = draft.name.trim();
	if (name.length === 0) problems.name = "required";
	else if (name.length > AppealFormLimits.name) problems.name = "tooLong";
	// A name made of digits could be taken for the ID of another form:
	else if (/^\d+$/u.test(name)) problems.name = "digitsOnly";

	checkText(problems, "description", draft.description, AppealFormLimits.description, false);
	checkText(problems, "lockReason", draft.lockReason, AppealFormLimits.lockReason, false);
	const icon = draft.icon.trim();
	if (icon.length > 0 && !isAppealFormIcon(icon)) problems.icon = "invalidIcon";

	if (
		draft.requiredRoles.length > MaximumAppealFormRoles ||
		draft.restrictedRoles.length > MaximumAppealFormRoles
	) {
		problems.roles = "tooManyRoles";
	} else if (draft.requiredRoles.some((role) => draft.restrictedRoles.includes(role))) {
		problems.roles = "overlap";
	}

	if (draft.questions.length > MaximumAppealQuestions) problems.questions = "tooMany";
	else if (!draft.questions.some((question) => asksSomething(question)))
		problems.questions = "noQuestion";
	draft.questions.forEach((question, index) => checkQuestion(problems, question, index));

	return problems;
}

/** The problems of one question of the draft, by the field they are about. */
export function appealQuestionProblems(
	problems: AppealFormProblems,
	index: number,
): Partial<
	Record<"label" | "placeholder" | "help" | "options" | "range" | "content", AppealFormProblem>
> {
	const prefix = `questions.${index}.`;
	return Object.fromEntries(
		Object.entries(problems)
			.filter(([path]) => path.startsWith(prefix))
			.map(([path, problem]) => [path.slice(prefix.length), problem]),
	);
}

/** The questions with the one at `from` moved to `to`; the list itself when either is out of it. */
export function moveAppealQuestion<T>(questions: readonly T[], from: number, to: number): T[] {
	if (from < 0 || from >= questions.length || to < 0 || to >= questions.length) {
		return [...questions];
	}
	const moved = [...questions];
	const [question] = moved.splice(from, 1);
	moved.splice(to, 0, question!);
	return moved;
}
