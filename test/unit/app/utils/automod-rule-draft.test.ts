import type { AutoModerationRule } from "#shared/utils/automod-rules";
import { describe, expect, it } from "vitest";
import { ref } from "vue";
import {
	applyAutomodRuleDefaults,
	automodRuleDraftToBody,
	automodRuleToDraft,
	createAutomodRuleDraft,
	pickAutomodEscalationDefaults,
	validateAutomodRuleName,
} from "~/utils/automod-rule-draft";
import { joinDuration, splitDuration } from "~/utils/duration-units";

const rule: AutoModerationRule = {
	id: "7",
	guildId: "123456789012345678",
	name: "Caps",
	type: "Capitals",
	enabled: true,
	softAction: 0b101,
	hardAction: "Mute",
	hardActionDuration: 600_000,
	thresholdMaximum: 3,
	thresholdDuration: 60_000,
	ignoredRoles: ["234567890123456789"],
	ignoredChannels: [],
	options: { minimum: 15, maximum: 50 },
	escalation: [{ action: "Ban", duration: null }],
	escalationDuration: 86_400_000,
	response: "{user}, no shouting in {channel}.",
	logChannelId: "345678901234567890",
};

describe("auto-moderation rule draft", () => {
	it("splits the soft action bitfield into its three switches", () => {
		expect(automodRuleToDraft(rule)).toMatchObject({
			softDelete: true,
			softLog: false,
			softAlert: true,
		});
	});

	// `Rules.vue` keeps the rule being edited in a `ref`, whose nested values
	// are proxies `structuredClone` cannot copy.
	it("reads a rule held in a ref", () => {
		const edited = ref({ ...rule, type: "Words" as const, options: { words: ["spam"] } });
		const draft = automodRuleToDraft(edited.value);

		expect(draft.options).toStrictEqual({ words: ["spam"] });
		expect(draft.options).not.toBe(edited.value.options);
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

	it("sends an empty custom alert as none, and trims the one it sends", () => {
		const draft = automodRuleToDraft({ ...rule, response: null });
		expect(draft.response).toBe("");
		expect(automodRuleDraftToBody(draft).response).toBeNull();

		draft.response = "   ";
		expect(automodRuleDraftToBody(draft).response).toBeNull();

		draft.response = "  Calm down, {user}.  ";
		expect(automodRuleDraftToBody(draft).response).toBe("Calm down, {user}.");
	});

	it("keeps the moderation log channel as null", () => {
		const draft = automodRuleToDraft({ ...rule, logChannelId: null });
		expect(automodRuleDraftToBody(draft).logChannelId).toBeNull();
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

	// A value loaded into a field is written back as soon as it is shown, so
	// reading it must not round it: the largest duration allowed is not whole.
	it("keeps a duration that is not a whole number of seconds", () => {
		expect(splitDuration(1500)).toStrictEqual({ value: 1.5, unit: "seconds" });
		expect(joinDuration(splitDuration(2_147_483_647))).toBe(2_147_483_647);
	});
});

// The reset window is checked by the server whatever the steps, but its field
// shows only with steps: defaults saved with a short one, or stored before it
// was checked, would make every new rule fail on a field no one can see.
describe("escalation defaults", () => {
	it("keeps a saved reset window within the server's limits", () => {
		const draft = { ...createAutomodRuleDraft("Capitals"), escalationDuration: 30_000 };

		expect(pickAutomodEscalationDefaults(draft).escalationDuration).toBe(60_000);
		expect(
			applyAutomodRuleDefaults(createAutomodRuleDraft("Capitals"), {
				escalation: { escalation: [], escalationDuration: 30_000 },
			}).escalationDuration,
		).toBe(60_000);
	});

	// Defaults saved in the browser before `Timeout` was merged into `Mute`.
	it("loads saved defaults that hold a Timeout as a Mute", () => {
		const base = createAutomodRuleDraft("Capitals");
		const saved = {
			rule: { ...base, hardAction: "Timeout", hardActionDuration: 600_000 },
			escalation: {
				escalation: [{ action: "Timeout", duration: 60_000 }],
				escalationDuration: 3_600_000,
			},
		} as unknown as Parameters<typeof applyAutomodRuleDefaults>[1];

		const draft = applyAutomodRuleDefaults(base, saved);

		expect(draft.hardAction).toBe("Mute");
		expect(draft.hardActionDuration).toBe(600_000);
		expect(draft.escalation).toStrictEqual([{ action: "Mute", duration: 60_000 }]);
	});

	it("sends a permanent Mute with no duration", () => {
		const body = automodRuleDraftToBody({
			...createAutomodRuleDraft("Capitals"),
			name: "Caps",
			hardAction: "Mute",
			hardActionDuration: 0,
		});

		expect(body).toMatchObject({ hardAction: "Mute", hardActionDuration: null });
	});

	it("keeps a reset window already within the limits", () => {
		const draft = { ...createAutomodRuleDraft("Capitals"), escalationDuration: 3_600_000 };

		expect(pickAutomodEscalationDefaults(draft).escalationDuration).toBe(3_600_000);
	});
});
