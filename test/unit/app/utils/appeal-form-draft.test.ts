import type { AppealForm, AppealQuestion } from "#shared/utils/appeal-forms";
import { describe, expect, it } from "vitest";
import { ref } from "vue";
import {
	appealFormDraftToBody,
	appealFormToDraft,
	appealQuestionProblems,
	createAppealFormDraft,
	moveAppealQuestion,
	nextAppealId,
	validateAppealFormDraft,
} from "~/utils/appeal-form-draft";

const ROLE = "234567890123456789";
const OTHER_ROLE = "345678901234567890";

const text: AppealQuestion = {
	id: "why",
	kind: "text",
	label: "Why?",
	placeholder: "Be honest",
	long: true,
	maxLength: 500,
	required: true,
};

const choice: AppealQuestion = {
	id: "which",
	kind: "choice",
	label: "Which rule?",
	help: "Pick one",
	options: [
		{ label: "Spam", value: "a" },
		{ label: "Insults", value: "b" },
	],
	min: 1,
	max: 1,
	required: true,
};

const form: AppealForm = {
	id: "7",
	guildId: "123456789012345678",
	name: "Ban appeal",
	description: "For bans only.",
	icon: "🔨",
	enabled: false,
	lockReason: "Closed for the week.",
	types: [0],
	requiredRoles: [],
	restrictedRoles: [ROLE],
	questions: [text, choice],
	position: 2,
};

describe("appeal form draft", () => {
	it("starts a new form with one long text question", () => {
		const draft = createAppealFormDraft();

		expect(draft.name).toBe("");
		expect(draft.questions).toHaveLength(1);
		expect(draft.questions[0]).toMatchObject({ kind: "text", long: true, required: true });
	});

	it("round-trips a form through the editor unchanged", () => {
		const { id: _id, guildId: _guildId, position: _position, ...fields } = form;
		expect(appealFormDraftToBody(appealFormToDraft(form))).toStrictEqual(fields);
	});

	// `Forms.vue` keeps the form being edited in a `ref`, whose nested values
	// are proxies `structuredClone` cannot copy.
	it("reads a form held in a ref, as its own copy", () => {
		const edited = ref(form);
		const draft = appealFormToDraft(edited.value);

		expect(draft.questions).toStrictEqual([text, choice]);
		expect(draft.questions[0]).not.toBe(edited.value.questions[0]);
	});

	it("shows a text that can be nothing as empty, and sends it back as null", () => {
		const draft = appealFormToDraft({
			...form,
			description: null,
			icon: null,
			lockReason: null,
		});
		expect(draft).toMatchObject({ description: "", icon: "", lockReason: "" });

		const body = appealFormDraftToBody({ ...draft, description: "  ", icon: " " });
		expect(body).toMatchObject({ description: null, icon: null, lockReason: null });
	});

	it("trims every text and leaves out a blank placeholder or help", () => {
		const draft = appealFormToDraft(form);
		draft.name = "  Ban appeal  ";
		draft.questions = [
			{ ...text, label: " Why? ", placeholder: "  ", help: " Hint " },
			{
				...choice,
				help: "",
				options: [
					{ label: " Spam ", value: "a" },
					{ label: "B", value: "b" },
				],
			},
			{ id: "note", kind: "display", content: "  Read the rules.  " },
		];

		const body = appealFormDraftToBody(draft);
		expect(body.name).toBe("Ban appeal");
		const { placeholder: _placeholder, ...textWithoutPlaceholder } = text;
		expect(body.questions?.[0]).toStrictEqual({ ...textWithoutPlaceholder, help: "Hint" });
		const picked = body.questions![1] as Extract<AppealQuestion, { kind: "choice" }>;
		expect(picked).not.toHaveProperty("help");
		expect(picked.options[0]?.label).toBe("Spam");
		expect(body.questions?.[2]).toStrictEqual({
			id: "note",
			kind: "display",
			content: "Read the rules.",
		});
	});

	it("accepts a form the server would", () => {
		expect(validateAppealFormDraft(appealFormToDraft(form))).toStrictEqual({});
	});

	it("names what is wrong with the form itself", () => {
		const draft = appealFormToDraft(form);

		expect(validateAppealFormDraft({ ...draft, name: " " }).name).toBe("required");
		expect(validateAppealFormDraft({ ...draft, name: "a".repeat(101) }).name).toBe("tooLong");
		expect(validateAppealFormDraft({ ...draft, name: "123" }).name).toBe("digitsOnly");
		expect(validateAppealFormDraft({ ...draft, icon: "abc" }).icon).toBe("invalidIcon");
		expect(
			validateAppealFormDraft({ ...draft, icon: "<:wolf:123456789012345678>" }).icon,
		).toBeUndefined();
		expect(
			validateAppealFormDraft({ ...draft, description: "d".repeat(501) }).description,
		).toBe("tooLong");
		expect(validateAppealFormDraft({ ...draft, lockReason: "l".repeat(201) }).lockReason).toBe(
			"tooLong",
		);
		expect(
			validateAppealFormDraft({
				...draft,
				requiredRoles: [ROLE, OTHER_ROLE],
				restrictedRoles: [ROLE],
			}).roles,
		).toBe("overlap");
		expect(
			validateAppealFormDraft({
				...draft,
				requiredRoles: Array.from({ length: 26 }, (_, index) =>
					String(100000000000000000 + index),
				),
			}).roles,
		).toBe("tooManyRoles");
	});

	it("needs one to five questions, one of which asks something", () => {
		const draft = appealFormToDraft(form);
		const display: AppealQuestion = { id: "note", kind: "display", content: "Hi" };

		expect(validateAppealFormDraft({ ...draft, questions: [] }).questions).toBe("noQuestion");
		expect(validateAppealFormDraft({ ...draft, questions: [display] }).questions).toBe(
			"noQuestion",
		);
		expect(
			validateAppealFormDraft({ ...draft, questions: [text, text, text, text, text, text] })
				.questions,
		).toBe("tooMany");
	});

	it("names what is wrong with each question, by its index", () => {
		const draft = appealFormToDraft(form);
		const problems = validateAppealFormDraft({
			...draft,
			questions: [
				{ ...text, label: "", maxLength: 5 },
				{ ...choice, options: [{ label: "Only", value: "a" }], min: 1, max: 1 },
				{
					...choice,
					id: "blank",
					options: [
						{ label: "", value: "a" },
						{ label: "B", value: "b" },
					],
					max: 3,
				},
				{
					id: "files",
					kind: "attachment",
					label: "Proof",
					min: 3,
					max: 2,
					imagesOnly: true,
				},
				{ id: "note", kind: "display", content: " " },
			],
		});

		expect(problems).toStrictEqual({
			"questions.0.label": "required",
			"questions.0.range": "badRange",
			"questions.1.options": "tooFewOptions",
			"questions.2.options": "required",
			"questions.2.range": "badRange",
			"questions.3.range": "badRange",
			"questions.4.content": "required",
		});
		expect(appealQuestionProblems(problems, 2)).toStrictEqual({
			options: "required",
			range: "badRange",
		});
	});

	it("moves a question within the list and leaves it alone past its ends", () => {
		const questions = ["a", "b", "c"];
		expect(moveAppealQuestion(questions, 0, 2)).toStrictEqual(["b", "c", "a"]);
		expect(moveAppealQuestion(questions, 2, 1)).toStrictEqual(["a", "c", "b"]);
		expect(moveAppealQuestion(questions, 0, -1)).toStrictEqual(questions);
		expect(moveAppealQuestion(questions, 2, 3)).toStrictEqual(questions);
	});

	it("generates IDs the server takes", () => {
		expect(nextAppealId()).toMatch(/^[\w-]{1,36}$/u);
		expect(nextAppealId()).not.toBe(nextAppealId());
	});
});
