import {
	AppealFormLimits,
	createAppealQuestion,
	isAppealCaseType,
	isAppealFormIcon,
	isAppealId,
} from "#shared/utils/appeal-forms";
import { describe, expect, it } from "vitest";

describe("isAppealFormIcon", () => {
	it.each([
		"🐺",
		"🇮🇹",
		"1️⃣",
		"#⃣",
		"👨‍👩‍👧",
		"<:wolf:123456789012345678>",
		"<a:wolf:123456789012345678>",
	])("takes %s", (icon) => {
		expect(isAppealFormIcon(icon)).toBe(true);
	});

	it.each(["", "a", "wolf", ":wolf:", "🐺 wolf", "1", "<:wolf:12>", "<:w:123456789012345678>"])(
		"refuses %s",
		(icon) => {
			expect(isAppealFormIcon(icon)).toBe(false);
		},
	);

	it("refuses a run of emoji longer than the limit", () => {
		expect(isAppealFormIcon("🐺".repeat(AppealFormLimits.icon))).toBe(false);
	});
});

describe("isAppealId", () => {
	it("takes what a form field can be named with", () => {
		expect(isAppealId("why")).toBe(true);
		expect(isAppealId("q_1-a")).toBe(true);
		expect(isAppealId("5c0d6ab2-4a8e-4b86-8c5d-2a1f3f8e9d0c")).toBe(true);
	});

	it("refuses an empty, spaced, over-long or non-text one", () => {
		expect(isAppealId("")).toBe(false);
		expect(isAppealId("no spaces")).toBe(false);
		expect(isAppealId("a".repeat(37))).toBe(false);
		expect(isAppealId(5)).toBe(false);
	});
});

describe("isAppealCaseType", () => {
	it("knows a ban, a mute and a timeout, and nothing else", () => {
		expect([0, 2, 15].every((type) => isAppealCaseType(type))).toBe(true);
		expect([1, 3, "0", null].some((type) => isAppealCaseType(type))).toBe(false);
	});
});

describe("createAppealQuestion", () => {
	function ids() {
		let next = 0;
		return () => `id${next++}`;
	}

	it("starts a text question as a required paragraph", () => {
		expect(createAppealQuestion("text", ids())).toStrictEqual({
			id: "id0",
			kind: "text",
			label: "",
			long: true,
			maxLength: AppealFormLimits.answerLength.maximum,
			required: true,
		});
	});

	it("starts a choice with the two options it needs, one to pick", () => {
		expect(createAppealQuestion("choice", ids())).toStrictEqual({
			id: "id0",
			kind: "choice",
			label: "",
			options: [
				{ label: "", value: "id1" },
				{ label: "", value: "id2" },
			],
			min: 1,
			max: 1,
			required: true,
		});
	});

	it("starts an attachment as one optional file of any kind", () => {
		expect(createAppealQuestion("attachment", ids())).toStrictEqual({
			id: "id0",
			kind: "attachment",
			label: "",
			min: 0,
			max: 1,
			imagesOnly: false,
		});
	});

	it("starts a notice empty", () => {
		expect(createAppealQuestion("display", ids())).toStrictEqual({
			id: "id0",
			kind: "display",
			content: "",
		});
	});
});
