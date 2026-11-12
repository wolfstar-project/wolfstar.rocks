import {
	AppealFormLimits,
	asksSomething,
	isAppealCaseType,
	isAppealFormIcon,
	isAppealId,
	isAppealQuestionKind,
	MaximumAppealFormRoles,
	MaximumAppealQuestions,
	type AppealAttachmentQuestion,
	type AppealChoiceQuestion,
	type AppealDisplayQuestion,
	type AppealFormData,
	type AppealQuestion,
	type AppealTextQuestion,
} from "#shared/utils/appeal-forms";
import { isSnowflake } from "#shared/utils/snowflake";
import { isObject } from "@sapphire/utilities";

// The bot trusts the dashboard with the forms, as its design note says: it
// reads the rows as they are and validates none of them. What this file lets
// through is what a member will be asked, so it checks every field of every
// kind of question against the limits of the note.

export type AppealFormPatch = Partial<AppealFormData>;

/** Thrown by a check of a field; its message is what the request reports for it. */
class FieldError extends Error {}

function fail(message: string): never {
	throw new FieldError(message);
}

function isInteger(value: unknown, minimum: number, maximum: number): value is number {
	return (
		typeof value === "number" && Number.isInteger(value) && value >= minimum && value <= maximum
	);
}

/** A text the server writes: trimmed, empty for none. */
function text(value: unknown, maximum: number): string {
	if (typeof value !== "string") fail("Expected a text.");
	const trimmed = value.trim();
	return trimmed.length <= maximum
		? trimmed
		: fail(`Expected a text of at most ${maximum} characters.`);
}

/** A text that cannot be empty: a label, a name, the content of a notice. */
function requiredText(value: unknown, maximum: number): string {
	const trimmed = text(value, maximum);
	return trimmed.length > 0 ? trimmed : fail(`Expected a text of 1 to ${maximum} characters.`);
}

/** A text that may be left out, or empty, which is the same. */
function optionalText(value: unknown, maximum: number): string | undefined {
	if (value === undefined || value === null) return undefined;
	return text(value, maximum) || undefined;
}

function boolean(value: unknown): boolean {
	return typeof value === "boolean" ? value : fail("Expected a boolean.");
}

function integer(value: unknown, minimum: number, maximum: number): number {
	return isInteger(value, minimum, maximum)
		? value
		: fail(`Expected an integer between ${minimum} and ${maximum}.`);
}

/** The fields every question that asks something has, but `kind` and `id`. */
function asking(question: Record<string, unknown>) {
	const help = optionalText(question.help, AppealFormLimits.help);
	return {
		label: requiredText(question.label, AppealFormLimits.label),
		...(help === undefined ? {} : { help }),
	};
}

function textQuestion(id: string, question: Record<string, unknown>): AppealTextQuestion {
	const placeholder = optionalText(question.placeholder, AppealFormLimits.placeholder);
	const { minimum, maximum } = AppealFormLimits.answerLength;
	return {
		id,
		kind: "text",
		...asking(question),
		...(placeholder === undefined ? {} : { placeholder }),
		long: boolean(question.long),
		maxLength: integer(question.maxLength, minimum, maximum),
		required: boolean(question.required),
	};
}

function choiceOptions(value: unknown): AppealChoiceQuestion["options"] {
	const { minimum, maximum } = AppealFormLimits.options;
	if (!Array.isArray(value) || value.length < minimum || value.length > maximum) {
		fail(`Expected ${minimum} to ${maximum} options.`);
	}
	const options = value.map((option: unknown) => {
		if (!isObject(option)) fail("Expected options with a label and a value.");
		const { label, value: optionValue } = option as Record<string, unknown>;
		if (!isAppealId(optionValue)) fail("Expected an ID as the value of each option.");
		return { label: requiredText(label, AppealFormLimits.optionLabel), value: optionValue };
	});
	if (new Set(options.map((option) => option.value)).size !== options.length) {
		fail("Expected a different value for each option.");
	}
	return options;
}

function choiceQuestion(id: string, question: Record<string, unknown>): AppealChoiceQuestion {
	const options = choiceOptions(question.options);
	const min = integer(question.min, 1, options.length);
	const max = integer(question.max, min, options.length);
	return {
		id,
		kind: "choice",
		...asking(question),
		options,
		min,
		max,
		required: boolean(question.required),
	};
}

function attachmentQuestion(
	id: string,
	question: Record<string, unknown>,
): AppealAttachmentQuestion {
	const { maximum } = AppealFormLimits.files;
	const min = integer(question.min, 0, maximum);
	const max = integer(question.max, Math.max(min, 1), maximum);
	return {
		id,
		kind: "attachment",
		...asking(question),
		min,
		max,
		imagesOnly: boolean(question.imagesOnly),
	};
}

function displayQuestion(id: string, question: Record<string, unknown>): AppealDisplayQuestion {
	return {
		id,
		kind: "display",
		content: requiredText(question.content, AppealFormLimits.content),
	};
}

/**
 * Reads a question as its kind stores it: the fields of the kind, and nothing
 * else, so a key the editor did not mean to send is not written.
 */
function question(value: unknown): AppealQuestion {
	if (!isObject(value)) fail("Expected a question.");
	const fields = value as Record<string, unknown>;
	const { id, kind } = fields;
	if (!isAppealId(id)) fail("Expected an ID.");
	if (!isAppealQuestionKind(kind))
		fail("Expected a kind of text, choice, attachment or display.");

	switch (kind) {
		case "text":
			return textQuestion(id, fields);
		case "choice":
			return choiceQuestion(id, fields);
		case "attachment":
			return attachmentQuestion(id, fields);
		case "display":
			return displayQuestion(id, fields);
	}
}

/**
 * Reads the questions of a form: one to five, each with an ID of its own, and
 * one at least that asks something, or the form could never be answered.
 */
function questions(value: unknown, errors: string[]): AppealQuestion[] | null {
	if (!Array.isArray(value) || value.length === 0 || value.length > MaximumAppealQuestions) {
		errors.push(`questions: Expected 1 to ${MaximumAppealQuestions} questions.`);
		return null;
	}

	const read: AppealQuestion[] = [];
	value.forEach((entry: unknown, index) => {
		try {
			read.push(question(entry));
		} catch (error) {
			if (!(error instanceof FieldError)) throw error;
			errors.push(`questions[${index}]: ${error.message}`);
		}
	});
	if (read.length !== value.length) return null;

	if (new Set(read.map((entry) => entry.id)).size !== read.length) {
		errors.push("questions: Expected a different ID for each question.");
		return null;
	}
	if (!read.some((entry) => asksSomething(entry))) {
		errors.push("questions: Expected a question that asks something.");
		return null;
	}
	return read;
}

function roles(value: unknown): string[] {
	if (!Array.isArray(value) || !value.every((entry: unknown) => isSnowflake(entry))) {
		fail("Expected an array of IDs.");
	}
	const ids = [...new Set(value as string[])];
	return ids.length <= MaximumAppealFormRoles
		? ids
		: fail(`Expected at most ${MaximumAppealFormRoles} IDs.`);
}

function caseTypes(value: unknown): AppealFormData["types"] {
	if (!Array.isArray(value) || !value.every((entry: unknown) => isAppealCaseType(entry))) {
		fail("Expected an array of kinds of case: 0 (ban), 2 (mute) or 15 (timeout).");
	}
	return [...new Set(value as AppealFormData["types"])];
}

/** A text that may be `null`, which an empty one becomes. */
function nullableText(value: unknown, maximum: number): string | null {
	if (value === null) return null;
	return text(value, maximum) || null;
}

function icon(value: unknown): string | null {
	const read = nullableText(value, AppealFormLimits.icon);
	if (read === null || isAppealFormIcon(read)) return read;
	return fail("Expected a Unicode emoji, or a custom one written as <:name:id>.");
}

type Reader = (value: unknown) => unknown;

/** How each field of a form is read, by the key of the request. */
const FIELDS: Record<Exclude<keyof AppealFormData, "questions">, Reader> = {
	name: (value) => {
		const length = typeof value === "string" ? value.trim().length : 0;
		return length > 0 && length <= AppealFormLimits.name
			? value
			: fail(`Expected a string of 1 to ${AppealFormLimits.name} characters.`);
	},
	description: (value) => nullableText(value, AppealFormLimits.description),
	icon,
	enabled: boolean,
	lockReason: (value) => nullableText(value, AppealFormLimits.lockReason),
	types: caseTypes,
	requiredRoles: roles,
	restrictedRoles: roles,
};

/**
 * Reads what a form is created or edited with from data that is not trusted,
 * the body of a request.
 *
 * @remarks Only the fields that are given are read, so the result is a patch.
 * The questions are read whole: a request that changes one sends them all.
 *
 * @param input - The data to read.
 * @param current - The roles the form has, when it exists, so a request that
 * changes one list is still refused a role that the other list keeps.
 * @returns The patch, or what is wrong with the data, one message per field.
 */
export function parseAppealFormPatch(
	input: unknown,
	current: Partial<Pick<AppealFormData, "requiredRoles" | "restrictedRoles">> = {},
): { data: AppealFormPatch; errors?: undefined } | { data?: undefined; errors: string[] } {
	if (!isObject(input)) return { errors: ["Invalid body."] };

	const body = input as Record<string, unknown>;
	const data: AppealFormPatch = {};
	const errors: string[] = [];

	for (const [key, read] of Object.entries(FIELDS) as [keyof typeof FIELDS, Reader][]) {
		if (body[key] === undefined) continue;
		try {
			Object.assign(data, { [key]: read(body[key]) });
		} catch (error) {
			if (!(error instanceof FieldError)) throw error;
			errors.push(`${key}: ${error.message}`);
		}
	}

	// A role the form requires cannot keep members out at the same time:
	const required = data.requiredRoles ?? current.requiredRoles ?? [];
	const restricted = data.restrictedRoles ?? current.restrictedRoles ?? [];
	if (
		(data.requiredRoles !== undefined || data.restrictedRoles !== undefined) &&
		required.some((role) => restricted.includes(role))
	) {
		errors.push("restrictedRoles: A role cannot be required and kept out.");
	}

	if (body.questions !== undefined) {
		const read = questions(body.questions, errors);
		if (read !== null) data.questions = read;
	}

	return errors.length === 0 ? { data } : { errors };
}
