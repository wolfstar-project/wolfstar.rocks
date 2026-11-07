import { parseAppealFormPatch } from "#server/utils/appeals/validation";
import { AppealFormLimits, MaximumAppealFormRoles } from "#shared/utils/appeal-forms";
import { describe, expect, it } from "vitest";

const ROLE = "123456789012345678";
const OTHER_ROLE = "223456789012345678";

const text = {
	id: "why",
	kind: "text",
	label: "Why?",
	long: true,
	maxLength: 1000,
	required: true,
};
const choice = {
	id: "pick",
	kind: "choice",
	label: "Which?",
	options: [
		{ label: "One", value: "a" },
		{ label: "Two", value: "b" },
	],
	min: 1,
	max: 2,
	required: false,
};
const attachment = {
	id: "files",
	kind: "attachment",
	label: "Proof",
	min: 0,
	max: 2,
	imagesOnly: true,
};
const display = { id: "note", kind: "display", content: "Be honest." };

describe("parseAppealFormPatch", () => {
	it("reads only the fields that are given", () => {
		expect(parseAppealFormPatch({ enabled: false, types: [0, 15, 0] })).toStrictEqual({
			data: { enabled: false, types: [0, 15] },
		});
	});

	it("refuses a body that is not an object", () => {
		expect(parseAppealFormPatch("nope").errors).toStrictEqual(["Invalid body."]);
	});

	it("reports one message per bad field", () => {
		const { errors } = parseAppealFormPatch({
			name: "",
			description: 4,
			icon: "abc",
			enabled: "yes",
			lockReason: "x".repeat(201),
			types: [1],
			requiredRoles: ["nope"],
			restrictedRoles: Array.from({ length: MaximumAppealFormRoles + 1 }, (_, index) =>
				String(100_000_000_000_000_000n + BigInt(index)),
			),
			questions: [],
		});
		expect(errors).toHaveLength(9);
		expect(errors).toContain("name: Expected a string of 1 to 100 characters.");
		expect(errors).toContain("questions: Expected 1 to 5 questions.");
	});

	it("trims a description and a lock reason, and reads an empty one as none", () => {
		expect(
			parseAppealFormPatch({ description: "  A word  ", lockReason: "   " }).data,
		).toStrictEqual({ description: "A word", lockReason: null });
		expect(parseAppealFormPatch({ description: null, lockReason: null }).data).toStrictEqual({
			description: null,
			lockReason: null,
		});
	});

	it.each(["🐺", "🇮🇹", "1️⃣", "<:wolf:123456789012345678>", "<a:wolf:123456789012345678>"])(
		"takes %s as an icon",
		(icon) => {
			expect(parseAppealFormPatch({ icon }).data).toStrictEqual({ icon });
		},
	);

	it.each(["abc", ":smile:", "🐺 wolf", "<:wolf:12>"])("refuses %s as an icon", (icon) => {
		expect(parseAppealFormPatch({ icon }).errors).toStrictEqual([
			"icon: Expected a Unicode emoji, or a custom one written as <:name:id>.",
		]);
	});

	it("reads no icon from an empty one", () => {
		expect(parseAppealFormPatch({ icon: "  " }).data).toStrictEqual({ icon: null });
	});

	it("dedupes the roles and refuses one that is required and kept out", () => {
		expect(
			parseAppealFormPatch({ requiredRoles: [ROLE, ROLE], restrictedRoles: [OTHER_ROLE] })
				.data,
		).toStrictEqual({ requiredRoles: [ROLE], restrictedRoles: [OTHER_ROLE] });
		expect(
			parseAppealFormPatch({ requiredRoles: [ROLE], restrictedRoles: [ROLE] }).errors,
		).toStrictEqual(["restrictedRoles: A role cannot be required and kept out."]);
	});

	it("checks a role list against the one the form keeps", () => {
		expect(
			parseAppealFormPatch({ restrictedRoles: [ROLE] }, { requiredRoles: [ROLE] }).errors,
		).toStrictEqual(["restrictedRoles: A role cannot be required and kept out."]);
		expect(
			parseAppealFormPatch({ requiredRoles: [ROLE] }, { restrictedRoles: [OTHER_ROLE] }).data,
		).toStrictEqual({ requiredRoles: [ROLE] });
	});

	describe("questions", () => {
		it("reads each kind as its fields, and drops what is not one of them", () => {
			const { data } = parseAppealFormPatch({
				questions: [
					{ ...text, extra: true, placeholder: " e.g. …  ", help: "" },
					{ ...choice, help: " Pick. " },
					attachment,
					display,
				],
			});
			expect(data?.questions).toStrictEqual([
				{ ...text, placeholder: "e.g. …" },
				{ ...choice, help: "Pick." },
				attachment,
				display,
			]);
		});

		it("reports the index of a question that is wrong", () => {
			expect(
				parseAppealFormPatch({ questions: [text, { ...display, content: "" }] }).errors,
			).toStrictEqual(["questions[1]: Expected a text of 1 to 1000 characters."]);
			expect(
				parseAppealFormPatch({ questions: [{ ...text, maxLength: 5 }] }).errors,
			).toStrictEqual(["questions[0]: Expected an integer between 10 and 1000."]);
			expect(
				parseAppealFormPatch({ questions: [{ ...text, id: "no spaces" }] }).errors,
			).toStrictEqual(["questions[0]: Expected an ID."]);
			expect(
				parseAppealFormPatch({ questions: [{ ...text, kind: "date" }] }).errors,
			).toStrictEqual([
				"questions[0]: Expected a kind of text, choice, attachment or display.",
			]);
		});

		it("needs a different ID for each question, and one that asks something", () => {
			expect(
				parseAppealFormPatch({ questions: [text, { ...display, id: "why" }] }).errors,
			).toStrictEqual(["questions: Expected a different ID for each question."]);
			expect(parseAppealFormPatch({ questions: [display] }).errors).toStrictEqual([
				"questions: Expected a question that asks something.",
			]);
		});

		it("takes five questions at most", () => {
			const six = Array.from({ length: 6 }, (_, index) => ({ ...text, id: `q${index}` }));
			expect(parseAppealFormPatch({ questions: six }).errors).toStrictEqual([
				"questions: Expected 1 to 5 questions.",
			]);
			expect(
				parseAppealFormPatch({ questions: six.slice(0, 5) }).data?.questions,
			).toHaveLength(5);
		});

		it("checks the options of a choice and how many can be picked", () => {
			const errorsOf = (patch: object) =>
				parseAppealFormPatch({ questions: [{ ...choice, ...patch }] }).errors;

			expect(errorsOf({ options: [choice.options[0]] })).toStrictEqual([
				"questions[0]: Expected 2 to 10 options.",
			]);
			expect(
				errorsOf({ options: [choice.options[0], { label: "Two", value: "a" }] }),
			).toStrictEqual(["questions[0]: Expected a different value for each option."]);
			expect(
				errorsOf({ options: [choice.options[0], { label: "", value: "b" }] }),
			).toStrictEqual([
				`questions[0]: Expected a text of 1 to ${AppealFormLimits.optionLabel} characters.`,
			]);
			expect(errorsOf({ min: 0 })).toStrictEqual([
				"questions[0]: Expected an integer between 1 and 2.",
			]);
			expect(errorsOf({ min: 2, max: 1 })).toStrictEqual([
				"questions[0]: Expected an integer between 2 and 2.",
			]);
		});

		it("checks how many files an attachment takes", () => {
			const errorsOf = (patch: object) =>
				parseAppealFormPatch({ questions: [{ ...attachment, ...patch }] }).errors;

			expect(errorsOf({ min: 6 })).toStrictEqual([
				"questions[0]: Expected an integer between 0 and 5.",
			]);
			expect(errorsOf({ max: 0 })).toStrictEqual([
				"questions[0]: Expected an integer between 1 and 5.",
			]);
			expect(errorsOf({ min: 3, max: 2 })).toStrictEqual([
				"questions[0]: Expected an integer between 3 and 5.",
			]);
			expect(errorsOf({ imagesOnly: "yes" })).toStrictEqual([
				"questions[0]: Expected a boolean.",
			]);
		});
	});
});
