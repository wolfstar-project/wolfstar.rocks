import { describe, expect, it } from "vitest";
import {
	AutoModerationRuleOptionLimits,
	AutoModerationRuleTypes,
	getDefaultAutoModerationRule,
	getDefaultAutoModerationRuleOptions,
	isAutoModerationRuleType,
	MaximumAutoModerationRuleEscalationSteps,
	normalizeAutoModerationRuleEscalation,
	normalizeAutoModerationRuleOptions,
	resolveAutoModerationRulePunishment,
} from "../../../../shared/utils/automod-rules";

describe("auto-moderation rule model", () => {
	it("has default options for every rule type the contract's enum lists", () => {
		for (const type of AutoModerationRuleTypes) {
			expect(isAutoModerationRuleType(type)).toBe(true);
			expect(getDefaultAutoModerationRuleOptions(type)).toBeTypeOf("object");
			expect(getDefaultAutoModerationRule(type).type).toBe(type);
		}
		expect(isAutoModerationRuleType("Reactions")).toBe(false);
	});

	it("hands out a fresh copy of the defaults each time", () => {
		const first = getDefaultAutoModerationRuleOptions("Words");
		first.words.push("mutated");
		expect(getDefaultAutoModerationRuleOptions("Words").words).toStrictEqual([]);
	});

	describe("normalizeAutoModerationRuleOptions", () => {
		it("falls back to the defaults for missing or mistyped values", () => {
			expect(normalizeAutoModerationRuleOptions("Capitals", { minimum: "10" })).toStrictEqual(
				getDefaultAutoModerationRuleOptions("Capitals"),
			);
			expect(normalizeAutoModerationRuleOptions("Newlines", null)).toStrictEqual(
				getDefaultAutoModerationRuleOptions("Newlines"),
			);
		});

		it("brings numbers within their limits", () => {
			const { maximum } = AutoModerationRuleOptionLimits.Newlines;
			expect(normalizeAutoModerationRuleOptions("Newlines", { maximum: 9999 })).toStrictEqual(
				{
					maximum: maximum.maximum,
				},
			);
			expect(normalizeAutoModerationRuleOptions("Newlines", { maximum: -3 })).toStrictEqual({
				maximum: maximum.minimum,
			});
		});

		it("lowercases, trims and dedupes word lists, dropping words of the wrong length", () => {
			expect(
				normalizeAutoModerationRuleOptions("Words", {
					words: [" Spam ", "spam", "x", 42, "a".repeat(40), "eggs"],
				}),
			).toStrictEqual({ words: ["spam", "eggs"] });
		});

		it("keeps the case of invite codes, which are case-sensitive", () => {
			expect(
				normalizeAutoModerationRuleOptions("Invites", { allowedCodes: [" AbCd "] }),
			).toMatchObject({ allowedCodes: ["AbCd"] });
		});

		it("drops keys the type does not have", () => {
			expect(normalizeAutoModerationRuleOptions("Attachments", { maximum: 3 })).toStrictEqual(
				{},
			);
		});
	});

	describe("normalizeAutoModerationRuleEscalation", () => {
		it("drops what is not a step and makes a bad duration permanent", () => {
			expect(
				normalizeAutoModerationRuleEscalation([
					{ action: "Timeout", duration: 60_000 },
					{ action: "Nuke", duration: 1 },
					"nope",
					{ action: "Ban", duration: -5 },
				]),
			).toStrictEqual([
				{ action: "Timeout", duration: 60_000 },
				{ action: "Ban", duration: null },
			]);
			expect(normalizeAutoModerationRuleEscalation("nope")).toStrictEqual([]);
		});

		it("cuts the steps past the maximum", () => {
			const steps = Array.from(
				{ length: MaximumAutoModerationRuleEscalationSteps + 3 },
				() => ({
					action: "Kick",
					duration: null,
				}),
			);
			expect(normalizeAutoModerationRuleEscalation(steps)).toHaveLength(
				MaximumAutoModerationRuleEscalationSteps,
			);
		});
	});

	describe("resolveAutoModerationRulePunishment", () => {
		const rule = {
			hardAction: "Warning",
			hardActionDuration: null,
			escalation: [
				{ action: "Timeout", duration: 60_000 },
				{ action: "Ban", duration: null },
			],
		} as const;

		it("takes the rule's own action the first time", () => {
			expect(
				resolveAutoModerationRulePunishment(
					{ ...rule, escalation: [...rule.escalation] },
					0,
				),
			).toStrictEqual({
				action: "Warning",
				duration: null,
			});
		});

		it("walks the escalation and repeats its last step", () => {
			const mutable = { ...rule, escalation: [...rule.escalation] };
			expect(resolveAutoModerationRulePunishment(mutable, 1).action).toBe("Timeout");
			expect(resolveAutoModerationRulePunishment(mutable, 2).action).toBe("Ban");
			expect(resolveAutoModerationRulePunishment(mutable, 9).action).toBe("Ban");
		});

		it("keeps the rule's own action when there is no escalation", () => {
			expect(resolveAutoModerationRulePunishment({ ...rule, escalation: [] }, 4).action).toBe(
				"Warning",
			);
		});
	});
});
