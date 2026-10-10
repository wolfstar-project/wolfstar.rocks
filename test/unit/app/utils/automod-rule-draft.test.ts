import type { AutoModerationRule } from "#shared/utils/automod-rules";
import { beforeAll, describe, expect, it } from "vitest";
import { toRaw } from "vue";
import {
	automodRuleDraftToBody,
	automodRuleToDraft,
	createAutomodRuleDraft,
	validateAutomodRuleName,
} from "~/utils/automod-rule-draft";
import { joinDuration, splitDuration } from "~/utils/duration-units";

// The module under test calls Nuxt's auto-imported `toRaw`, which this
// plain-node project doesn't provide.
beforeAll(() => {
	Object.assign(globalThis, { toRaw });
});

const rule: AutoModerationRule = {
	id: "7",
	guildId: "123456789012345678",
	name: "Caps",
	type: "Capitals",
	enabled: true,
	softAction: 0b101,
	hardAction: "Timeout",
	hardActionDuration: 600_000,
	thresholdMaximum: 3,
	thresholdDuration: 60_000,
	ignoredRoles: ["234567890123456789"],
	ignoredChannels: [],
	options: { minimum: 15, maximum: 50 },
	escalation: [{ action: "Ban", duration: null }],
	escalationDuration: 86_400_000,
};

describe("auto-moderation rule draft", () => {
	it("splits the soft action bitfield into its three switches", () => {
		expect(automodRuleToDraft(rule)).toMatchObject({
			softDelete: true,
			softLog: false,
			softAlert: true,
		});
	});

	it("round-trips a rule through the form unchanged", () => {
		const { id: _id, guildId: _guildId, ...fields } = rule;
		expect(automodRuleDraftToBody(automodRuleToDraft(rule))).toStrictEqual(fields);
	});

	it("turns a permanent duration into 0 for the form and back into null", () => {
		const draft = automodRuleToDraft({ ...rule, hardActionDuration: null });
		expect(draft.hardActionDuration).toBe(0);
		expect(draft.escalation[0]?.duration).toBe(0);

		const body = automodRuleDraftToBody(draft);
		expect(body.hardActionDuration).toBeNull();
		expect(body.escalation?.[0]?.duration).toBeNull();
	});

	it("starts a new rule from the bot's defaults for its type", () => {
		expect(createAutomodRuleDraft("Newlines")).toMatchObject({
			name: "",
			type: "Newlines",
			enabled: true,
			hardAction: "Warning",
			options: { maximum: 20 },
		});
	});

	it("does not share option lists between the draft and the rule", () => {
		const words: AutoModerationRule = { ...rule, type: "Words", options: { words: ["spam"] } };
		const draft = automodRuleToDraft(words);
		(draft.options.words as string[]).push("eggs");
		expect(words.options).toStrictEqual({ words: ["spam"] });
	});

	it("trims the name it sends", () => {
		const draft = automodRuleToDraft({ ...rule, name: "  Caps  " });
		expect(automodRuleDraftToBody(draft).name).toBe("Caps");
	});

	it("validates a name by the server's rules", () => {
		expect(validateAutomodRuleName("  ")).toBe("empty");
		expect(validateAutomodRuleName("a".repeat(51))).toBe("tooLong");
		expect(validateAutomodRuleName("12345")).toBe("digitsOnly");
		expect(validateAutomodRuleName("Rule 1")).toBeNull();
	});
});

describe("duration units", () => {
	it("reads milliseconds in the largest whole unit", () => {
		expect(splitDuration(86_400_000)).toStrictEqual({ value: 1, unit: "days" });
		expect(splitDuration(5_400_000)).toStrictEqual({ value: 90, unit: "minutes" });
		expect(splitDuration(45_000)).toStrictEqual({ value: 45, unit: "seconds" });
	});

	it("keeps the unit asked for when there is nothing to split", () => {
		expect(splitDuration(0, "hours")).toStrictEqual({ value: 0, unit: "hours" });
		expect(splitDuration(Number.NaN)).toStrictEqual({ value: 0, unit: "minutes" });
	});

	it("joins a value and unit back into milliseconds", () => {
		expect(joinDuration({ value: 2, unit: "hours" })).toBe(7_200_000);
		expect(joinDuration({ value: -1, unit: "hours" })).toBe(0);
		expect(joinDuration(splitDuration(600_000))).toBe(600_000);
	});
});
