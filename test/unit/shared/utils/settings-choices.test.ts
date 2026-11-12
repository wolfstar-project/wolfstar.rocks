import { safeParse } from "valibot";
import { describe, expect, it } from "vitest";
import { buildSettingsFormSchema } from "../../../../shared/schemas/settings-form";
import {
	clampSettingNumber,
	SETTING_CHOICES,
	SETTING_NUMBER_RANGES,
} from "../../../../shared/utils/settings-choices";

describe("settings choices", () => {
	it("offers the honeypot actions mildest first, as the bot's enum orders them", () => {
		expect(SETTING_CHOICES.honeypotAction).toStrictEqual(["Kick", "Softban", "Ban"]);
	});

	it("takes the confirm window of a recent case in minutes, from 0 to 60", () => {
		expect(SETTING_NUMBER_RANGES.moderationConfirmRecentMinutes).toStrictEqual({
			maximum: 60,
			minimum: 0,
		});
	});
});

describe("clampSettingNumber", () => {
	it("keeps a whole number of the range", () => {
		expect(clampSettingNumber("moderationConfirmRecentMinutes", 5)).toBe(5);
		expect(clampSettingNumber("moderationConfirmRecentMinutes", 0)).toBe(0);
		expect(clampSettingNumber("moderationConfirmRecentMinutes", 60)).toBe(60);
	});

	it("holds a number past either end to that end", () => {
		expect(clampSettingNumber("moderationConfirmRecentMinutes", 99)).toBe(60);
		expect(clampSettingNumber("moderationConfirmRecentMinutes", -3)).toBe(0);
	});

	it("rounds a fraction to the nearest whole number", () => {
		expect(clampSettingNumber("moderationConfirmRecentMinutes", 4.6)).toBe(5);
	});

	it("reads a cleared or broken value as the smallest of the range", () => {
		expect(clampSettingNumber("moderationConfirmRecentMinutes", null)).toBe(0);
		expect(clampSettingNumber("moderationConfirmRecentMinutes", undefined)).toBe(0);
		expect(clampSettingNumber("moderationConfirmRecentMinutes", Number.NaN)).toBe(0);
	});
});

describe("buildSettingsFormSchema", () => {
	const schema = buildSettingsFormSchema({
		choices: ["logsMessageUpdateStyle"],
		numbers: ["moderationConfirmRecentMinutes"],
	});

	it("accepts a number of the range and a word of the set", () => {
		const result = safeParse(schema, {
			logsMessageUpdateStyle: "Separate",
			moderationConfirmRecentMinutes: 15,
		});

		expect(result.success).toBe(true);
	});

	it.each([
		[
			"past the range",
			{ logsMessageUpdateStyle: "Separate", moderationConfirmRecentMinutes: 61 },
		],
		["a fraction", { logsMessageUpdateStyle: "Separate", moderationConfirmRecentMinutes: 1.5 }],
		[
			"a word of no set",
			{ logsMessageUpdateStyle: "Inline", moderationConfirmRecentMinutes: 5 },
		],
	])("refuses %s", (_case, state) => {
		expect(safeParse(schema, state).success).toBe(false);
	});
});
