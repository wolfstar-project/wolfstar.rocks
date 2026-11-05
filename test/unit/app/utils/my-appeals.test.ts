import type { AppealQuestion } from "#shared/utils/appeal-forms";
import type { AppealPage, AppealPageForm } from "#shared/utils/my-appeals";
import { describe, expect, it } from "vitest";
import {
	buildSubmission,
	caseEndsAt,
	formatRelative,
	formatSpan,
	formNeedsFiles,
	formsForCase,
	guildInitials,
	missingAnswers,
	missingChoices,
} from "~/utils/my-appeals";

const NOW = new Date("2026-11-04T12:00:00Z");
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const WHY: AppealQuestion = {
	id: "why",
	kind: "text",
	label: "Why?",
	long: true,
	maxLength: 1000,
	required: true,
};
const NOTE: AppealQuestion = {
	id: "note",
	kind: "text",
	label: "Anything else?",
	long: false,
	maxLength: 100,
	required: false,
};
const RULES: AppealQuestion = {
	id: "rules",
	kind: "choice",
	label: "Did you read the rules?",
	max: 1,
	min: 1,
	options: [
		{ label: "Yes", value: "yes" },
		{ label: "Not yet", value: "no" },
	],
	required: true,
};
const SHOTS: AppealQuestion = {
	id: "shots",
	kind: "attachment",
	label: "Screenshots",
	imagesOnly: true,
	max: 3,
	min: 0,
};
const INFO: AppealQuestion = { id: "info", kind: "display", content: "Be honest." };
const CHANGES = {
	id: "changes",
	kind: "choice",
	label: "What will you do differently?",
	max: 4,
	min: 2,
	options: [
		{ label: "Read the rules", value: "rules" },
		{ label: "Take a break", value: "break" },
		{ label: "Ask the staff", value: "ask" },
		{ label: "Mute the channel", value: "mute" },
	],
	required: false,
} satisfies AppealQuestion;

function form(overrides: Partial<AppealPageForm>): AppealPageForm {
	return {
		cases: [],
		description: null,
		icon: null,
		id: "form",
		lock: null,
		lockReason: null,
		name: "Ban appeal",
		questions: [WHY],
		until: null,
		...overrides,
	};
}

const CASE = { createdAt: 0, duration: null, id: 212, reason: null, type: "Ban" };

describe("formatRelative", () => {
	it("says how long ago a past date was, in its largest whole unit", () => {
		expect(formatRelative(new Date(NOW.getTime() - 3 * DAY), NOW, "en-US")).toBe("3 days ago");
	});

	it("says how far a future date is", () => {
		expect(formatRelative(NOW.getTime() + 22 * HOUR, NOW, "en-US")).toBe("in 22 hours");
	});

	it("reads anything under a minute as one minute", () => {
		expect(formatRelative(NOW, NOW, "en-US")).toBe("in 1 minute");
	});
});

describe("formatSpan", () => {
	it("spells a duration in its largest whole unit", () => {
		expect(formatSpan(30 * DAY, "en-US")).toBe("1 month");
		expect(formatSpan(2 * DAY, "en-US")).toBe("2 days");
	});
});

describe("caseEndsAt", () => {
	it("adds the duration to when the case was made", () => {
		expect(caseEndsAt({ createdAt: NOW.toISOString(), duration: HOUR })?.getTime()).toBe(
			NOW.getTime() + HOUR,
		);
	});

	it("is null for a permanent case", () => {
		expect(caseEndsAt({ createdAt: NOW.toISOString(), duration: null })).toBeNull();
	});
});

describe("guildInitials", () => {
	it("takes the first letter of the first two words, upper case", () => {
		expect(guildInitials("pixel parlor club")).toBe("PP");
		expect(guildInitials("  Dev  ")).toBe("D");
	});
});

describe("formsForCase", () => {
	it("offers the open forms that take the case and the locked ones, not the ones about other cases", () => {
		const page: AppealPage = {
			appeals: [],
			block: null,
			enabled: true,
			forms: [
				form({ cases: [CASE], id: "takes" }),
				form({ cases: [{ ...CASE, id: 1 }], id: "other" }),
				form({ id: "cooldown", lock: "cooldown" }),
				form({ id: "none", lock: "noEligibleCase" }),
			],
			guild: { icon: null, id: "1", name: "Pixel Parlor" },
		};
		expect(formsForCase(page, 212).map((entry) => entry.id)).toEqual(["takes", "cooldown"]);
	});
});

describe("formNeedsFiles", () => {
	it("is true only when a question asks for at least one file", () => {
		expect(formNeedsFiles({ questions: [WHY, SHOTS] })).toBe(false);
		expect(formNeedsFiles({ questions: [{ ...SHOTS, min: 1 }] })).toBe(true);
	});
});

describe("missingAnswers", () => {
	const questions = [WHY, NOTE, RULES, SHOTS, INFO];

	it("lists the required questions left empty, blank text included", () => {
		expect(missingAnswers({ questions }, { rules: [], why: "   " })).toEqual(["why", "rules"]);
	});

	it("is empty once every required question is answered", () => {
		expect(missingAnswers({ questions }, { rules: ["yes"], why: "I was wrong" })).toEqual([]);
	});

	it("lists a choice with fewer options picked than it asks for, required or not", () => {
		const choices = [CHANGES, { ...CHANGES, id: "must", required: true }];

		expect(
			missingAnswers({ questions: choices }, { changes: ["rules"], must: ["ask"] }),
		).toEqual(["changes", "must"]);
		expect(missingAnswers({ questions: choices }, { must: ["ask", "break"] })).toEqual([]);
	});
});

describe("missingChoices", () => {
	it("says how many more options a choice needs", () => {
		expect(missingChoices(CHANGES, ["rules"])).toBe(1);
		expect(missingChoices({ ...CHANGES, min: 3 }, ["rules"])).toBe(2);
		expect(missingChoices(CHANGES, ["rules", "break"])).toBe(0);
	});

	it("needs nothing of an optional choice left empty, and its minimum of a required one", () => {
		expect(missingChoices(CHANGES, [])).toBe(0);
		expect(missingChoices(CHANGES, undefined)).toBe(0);
		expect(missingChoices({ ...CHANGES, required: true }, [])).toBe(2);
	});
});

describe("buildSubmission", () => {
	it("trims the texts, keeps the values picked, and leaves out empty answers", () => {
		expect(
			buildSubmission(
				{ questions: [WHY, NOTE, RULES, INFO] },
				{ info: "x", note: "  ", rules: ["yes"], why: " Sorry. " },
			),
		).toEqual({ rules: ["yes"], why: "Sorry." });
	});
});
