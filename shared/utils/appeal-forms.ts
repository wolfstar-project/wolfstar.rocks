/**
 * The appeal form model of the V7 contract: one `AppealForm` row per form,
 * with its questions stored as JSON.
 *
 * Ported from `projects/database/src/settings/appeals/types.ts` in the bot
 * (wolfstar-project/wolfstar, V7), with the limits its design note gives the
 * dashboard (`docs/superpowers/specs/2026-11-01-appeal-system-design.md`): the
 * forms are built here and the bot reads them as they are, so what this file
 * allows is what a member will be asked. It lives in `shared/` because the
 * form editor needs the types, limits and defaults in the browser, and nothing
 * here touches the database.
 */
import type { Snowflake } from "discord-api-types/v10";

/** The most forms a guild has. */
export const MaximumAppealForms = 10;

/** The most questions a form has. It needs one that asks something. */
export const MaximumAppealQuestions = 5;

/** The most roles a form requires, and the most it keeps out. */
export const MaximumAppealFormRoles = 25;

/** The longest texts of a form and of its questions, in characters. */
export const AppealFormLimits = {
	name: 100,
	description: 500,
	lockReason: 200,
	icon: 64,
	label: 100,
	placeholder: 100,
	help: 200,
	/** The text of a `display` question. */
	content: 1000,
	optionLabel: 100,
	/** How many options a `choice` question offers. */
	options: { minimum: 2, maximum: 10 },
	/** The `maxLength` a `text` question can ask for, the bot's `MaximumAppealAnswerLength` at most. */
	answerLength: { minimum: 10, maximum: 1000 },
	/** The most files an `attachment` question takes, the bot's `MaximumAppealFiles`. */
	files: { maximum: 5 },
} as const;

/**
 * The kinds of case a member can appeal, as the bot's `TypeVariation` numbers
 * them (its `AppealableTypes`). A form takes a subset of them, or every one the
 * settings allow when its list is empty.
 */
export const AppealCaseTypes = { Ban: 0, Mute: 2, Timeout: 15 } as const;
export type AppealCaseTypeName = keyof typeof AppealCaseTypes;
export type AppealCaseType = (typeof AppealCaseTypes)[AppealCaseTypeName];

/** The names of {@link AppealCaseTypes}, in the order the settings list them. */
export const AppealCaseTypeNames = [
	"Ban",
	"Mute",
	"Timeout",
] as const satisfies readonly AppealCaseTypeName[];

export function isAppealCaseType(value: unknown): value is AppealCaseType {
	return AppealCaseTypeNames.some((name) => AppealCaseTypes[name] === value);
}

/** What a question asks for, as the `kind` of its JSON says. */
export const AppealQuestionKinds = ["text", "choice", "attachment", "display"] as const;
export type AppealQuestionKind = (typeof AppealQuestionKinds)[number];

export function isAppealQuestionKind(value: unknown): value is AppealQuestionKind {
	return AppealQuestionKinds.includes(value as AppealQuestionKind);
}

interface AppealQuestionBase {
	/** Generated, and kept when the question is edited, so the answers keep their question. */
	id: string;
}

/** A question answered with text. */
export interface AppealTextQuestion extends AppealQuestionBase {
	kind: "text";
	label: string;
	placeholder?: string;
	help?: string;
	/** Whether it is a paragraph, not a line. */
	long: boolean;
	maxLength: number;
	required: boolean;
}

/** A question answered by picking among fixed options, between `min` and `max` of them. */
export interface AppealChoiceQuestion extends AppealQuestionBase {
	kind: "choice";
	label: string;
	help?: string;
	options: { label: string; value: string }[];
	min: number;
	max: number;
	required: boolean;
}

/** A question answered with files, between `min` and `max` of them, which the website keeps. */
export interface AppealAttachmentQuestion extends AppealQuestionBase {
	kind: "attachment";
	label: string;
	help?: string;
	min: number;
	max: number;
	imagesOnly: boolean;
}

/** A block of text that asks nothing. */
export interface AppealDisplayQuestion extends AppealQuestionBase {
	kind: "display";
	content: string;
}

export type AppealQuestion =
	| AppealTextQuestion
	| AppealChoiceQuestion
	| AppealAttachmentQuestion
	| AppealDisplayQuestion;

/** A question a member answers: every kind but `display`. */
export type AppealAskingQuestion = Exclude<AppealQuestion, AppealDisplayQuestion>;

export function asksSomething(question: AppealQuestion): question is AppealAskingQuestion {
	return question.kind !== "display";
}

/** A form of the appeals of a guild, as the dashboard reads and writes it. */
export interface AppealForm {
	id: string;
	guildId: Snowflake;
	name: string;
	description: string | null;
	/** A Unicode emoji, or the `<:name:id>` of a custom one. */
	icon: string | null;
	enabled: boolean;
	/** What the page says of a disabled form, besides that it is. */
	lockReason: string | null;
	/** The kinds of case it takes, every one the settings allow when empty. */
	types: AppealCaseType[];
	/** The member needs one of them; none needed when empty. A banned member has no role. */
	requiredRoles: Snowflake[];
	/** A member who has one cannot use the form. */
	restrictedRoles: Snowflake[];
	questions: AppealQuestion[];
	/** The order on the page, lowest first. */
	position: number;
}

/** What a form is made of: the fields a request creates or edits. */
export type AppealFormData = Omit<AppealForm, "id" | "guildId" | "position">;

/**
 * The ID of a question, or the value of an option: short, and made of the
 * characters a form field can be named with. The dashboard generates them; a
 * request that gives one keeps it, so an edited question keeps its answers.
 */
const APPEAL_ID_PATTERN = /^[\w-]{1,36}$/u;

export function isAppealId(value: unknown): value is string {
	return typeof value === "string" && APPEAL_ID_PATTERN.test(value);
}

/** The `<:name:id>` (or `<a:name:id>`) a custom emoji is written as. */
const CUSTOM_EMOJI_PATTERN = /^<a?:\w{2,32}:\d{17,20}>$/u;
/** A keycap, such as `1️⃣`: a digit, `#` or `*` with the combining keycap. */
const KEYCAP_PATTERN = /^[\d#*]️?⃣$/u;

/**
 * Whether a text can be the icon of a form: one custom emoji, or Unicode
 * emoji (a flag, a keycap and a sequence included) with no letter, digit or
 * space among them.
 */
export function isAppealFormIcon(value: string): boolean {
	if (CUSTOM_EMOJI_PATTERN.test(value) || KEYCAP_PATTERN.test(value)) return true;
	if (value.length === 0 || value.length > AppealFormLimits.icon) return false;
	return (
		!/[\p{L}\p{N}\s]/u.test(value) &&
		/\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(value)
	);
}

/** The form a new one starts from: open to every case, every role, nobody kept out, and no question yet. */
export function getDefaultAppealForm(): AppealFormData {
	return {
		name: "",
		description: null,
		icon: null,
		enabled: true,
		lockReason: null,
		types: [],
		requiredRoles: [],
		restrictedRoles: [],
		questions: [],
	};
}

/**
 * A question of `kind` as the editor adds it, with the defaults a server
 * changes least: a text one asks for a paragraph, as the bot's built-in form
 * does.
 *
 * @param kind - What the question asks for.
 * @param nextId - Gives the IDs the question and its options need.
 */
export function createAppealQuestion(
	kind: AppealQuestionKind,
	nextId: () => string,
): AppealQuestion {
	const id = nextId();
	switch (kind) {
		case "text":
			return {
				id,
				kind,
				label: "",
				long: true,
				maxLength: AppealFormLimits.answerLength.maximum,
				required: true,
			};
		case "choice":
			return {
				id,
				kind,
				label: "",
				options: [
					{ label: "", value: nextId() },
					{ label: "", value: nextId() },
				],
				min: 1,
				max: 1,
				required: true,
			};
		case "attachment":
			return { id, kind, label: "", min: 0, max: 1, imagesOnly: false };
		case "display":
			return { id, kind, content: "" };
	}
}
