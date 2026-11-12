import {
	MaximumAutoModerationRuleIgnored,
	parseAutoModerationRulePatch,
} from "#server/utils/automod/validation";
import {
	MaximumAutoModerationRuleListLength,
	MaximumAutoModerationRuleResponseLength,
	resolveAutoModerationRulePunishment,
} from "#shared/utils/automod-rules";
import { describe, expect, it } from "vitest";

const ROLE = "123456789012345678";

describe("parseAutoModerationRulePatch", () => {
	it("reads only the fields that are given", () => {
		const result = parseAutoModerationRulePatch("Words", { enabled: false, softAction: 3 });
		expect(result).toStrictEqual({ data: { enabled: false, softAction: 3 } });
	});

	it("refuses a body that is not an object", () => {
		expect(parseAutoModerationRulePatch("Words", "nope").errors).toStrictEqual([
			"Invalid body.",
		]);
	});

	it("reports one message per bad field", () => {
		const { errors } = parseAutoModerationRulePatch("Words", {
			name: "",
			enabled: "yes",
			softAction: 8,
			hardAction: "Nuke",
			thresholdMaximum: -1,
			ignoredRoles: ["nope"],
			options: 4,
		});
		expect(errors).toHaveLength(7);
	});

	it("treats a zero or null duration as a permanent action", () => {
		expect(parseAutoModerationRulePatch("Words", { hardActionDuration: 0 }).data).toStrictEqual(
			{ hardActionDuration: null },
		);
		expect(
			parseAutoModerationRulePatch("Words", { hardActionDuration: null }).data,
		).toStrictEqual({ hardActionDuration: null });
	});

	it("dedupes ignored ids and caps how many a rule takes", () => {
		expect(
			parseAutoModerationRulePatch("Words", { ignoredRoles: [ROLE, ROLE] }).data,
		).toStrictEqual({ ignoredRoles: [ROLE] });

		const tooMany = Array.from({ length: MaximumAutoModerationRuleIgnored + 1 }, (_, index) =>
			String(100_000_000_000_000_000n + BigInt(index)),
		);
		expect(
			parseAutoModerationRulePatch("Words", { ignoredChannels: tooMany }).errors,
		).toHaveLength(1);
	});

	it("merges options on the ones the rule already has", () => {
		const result = parseAutoModerationRulePatch(
			"Capitals",
			{ options: { maximum: 80 } },
			{ options: { minimum: 30, maximum: 50 } },
		);
		expect(result.data).toStrictEqual({ options: { minimum: 30, maximum: 80 } });
	});

	// Stored the way the bot matches messages: lowercase, no look-alikes.
	it("normalizes the words of a Words rule", () => {
		const result = parseAutoModerationRulePatch("Words", { options: { words: [" SpAm "] } });
		expect(result.data).toStrictEqual({ options: { words: ["spam"] } });
	});

	it("lets an over-long list stay but not grow", () => {
		const existing = Array.from(
			{ length: MaximumAutoModerationRuleListLength + 5 },
			(_, index) => `domain${index}.example`,
		);

		expect(
			parseAutoModerationRulePatch(
				"Links",
				{ options: { allowed: existing } },
				{ options: { allowed: existing } },
			).errors,
		).toBeUndefined();
		expect(
			parseAutoModerationRulePatch(
				"Links",
				{ options: { allowed: [...existing, "one-more.example"] } },
				{ options: { allowed: existing } },
			).errors,
		).toHaveLength(1);
	});

	// `Timeout` was merged into `Mute`: a mute is a timeout when the server
	// asks for it and the duration fits, so the action is no longer written.
	it("refuses a Timeout as a new hard action", () => {
		const { errors } = parseAutoModerationRulePatch("Words", {
			hardAction: "Timeout",
			hardActionDuration: 60_000,
		});
		expect(errors).toHaveLength(1);
		expect(errors?.[0]).toMatch(/^hardAction: /);
	});

	it("takes a Mute with a duration and a permanent one", () => {
		expect(
			parseAutoModerationRulePatch("Words", {
				hardAction: "Mute",
				hardActionDuration: 60_000,
			}).data,
		).toStrictEqual({ hardAction: "Mute", hardActionDuration: 60_000 });
		expect(
			parseAutoModerationRulePatch("Words", {
				hardAction: "Mute",
				hardActionDuration: null,
			}).data,
		).toStrictEqual({ hardAction: "Mute", hardActionDuration: null });
	});

	it("refuses a Timeout step in the escalation and takes a permanent Mute", () => {
		expect(
			parseAutoModerationRulePatch("Words", {
				escalation: [{ action: "Timeout", duration: 60_000 }],
			}).errors,
		).toHaveLength(1);
		expect(
			parseAutoModerationRulePatch("Words", {
				escalation: [
					{ action: "Mute", duration: null },
					{ action: "Ban", duration: null },
				],
			}).data,
		).toStrictEqual({
			escalation: [
				{ action: "Mute", duration: null },
				{ action: "Ban", duration: null },
			],
		});
	});

	it("takes no hard action, but no step of an escalation that takes none", () => {
		expect(parseAutoModerationRulePatch("Words", { hardAction: "None" }).data).toStrictEqual({
			hardAction: "None",
		});
		expect(
			parseAutoModerationRulePatch("Words", {
				escalation: [{ action: "None", duration: null }],
			}).errors,
		).toHaveLength(1);
	});

	it("reads a custom alert trimmed, and an empty one as none", () => {
		expect(
			parseAutoModerationRulePatch("Words", { response: "  {user}, mind {rule}.  " }).data,
		).toStrictEqual({ response: "{user}, mind {rule}." });
		expect(parseAutoModerationRulePatch("Words", { response: "   " }).data).toStrictEqual({
			response: null,
		});
		expect(parseAutoModerationRulePatch("Words", { response: null }).data).toStrictEqual({
			response: null,
		});
	});

	it("refuses a custom alert that is too long or not a text", () => {
		const long = "a".repeat(MaximumAutoModerationRuleResponseLength + 1);
		expect(parseAutoModerationRulePatch("Words", { response: long }).errors).toHaveLength(1);
		expect(parseAutoModerationRulePatch("Words", { response: 4 }).errors).toHaveLength(1);
	});

	it("reads a log channel as an ID or null", () => {
		expect(parseAutoModerationRulePatch("Words", { logChannelId: ROLE }).data).toStrictEqual({
			logChannelId: ROLE,
		});
		expect(parseAutoModerationRulePatch("Words", { logChannelId: null }).data).toStrictEqual({
			logChannelId: null,
		});
		expect(
			parseAutoModerationRulePatch("Words", { logChannelId: "general" }).errors,
		).toHaveLength(1);
	});

	it("reads the options of an identical messages rule within their limits", () => {
		expect(
			parseAutoModerationRulePatch("MessageDuplicates", {
				options: { maximum: 1, queueSize: 500 },
			}).data,
		).toStrictEqual({ options: { maximum: 2, queueSize: 100 } });
	});
});

describe("resolveAutoModerationRulePunishment", () => {
	it("takes no action for a rule without one, whatever steps it kept", () => {
		expect(
			resolveAutoModerationRulePunishment(
				{
					hardAction: "None",
					hardActionDuration: 60_000,
					escalation: [{ action: "Ban", duration: null }],
				},
				2,
			),
		).toStrictEqual({ action: "None", duration: null });
	});
});
