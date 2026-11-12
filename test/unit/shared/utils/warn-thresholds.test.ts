import { describe, expect, it } from "vitest";
import {
	getDefaultWarnThresholds,
	readStoredWarnThresholdAction,
	MAXIMUM_WARN_THRESHOLD_SECONDS,
	parseWarnThresholdCount,
	parseWarnThresholdData,
} from "../../../../shared/utils/warn-thresholds";

describe("parseWarnThresholdData", () => {
	it("reads a mute for a day, counted over a week", () => {
		expect(
			parseWarnThresholdData({ action: "Mute", duration: 86_400, period: 604_800 }),
		).toEqual({
			data: { action: "Mute", duration: 86_400, period: 604_800 },
		});
	});

	it("reads a permanent ban, with no duration", () => {
		expect(parseWarnThresholdData({ action: "Ban", duration: null, period: 0 })).toEqual({
			data: { action: "Ban", duration: null, period: 0 },
		});
	});

	it("drops the duration of an action that does not last", () => {
		expect(parseWarnThresholdData({ action: "Kick", duration: 60, period: 0 }).data).toEqual({
			action: "Kick",
			duration: null,
			period: 0,
		});
	});

	it("refuses a Timeout as a new action: it was merged into Mute", () => {
		expect(
			parseWarnThresholdData({ action: "Timeout", duration: 3600, period: 0 }).errors,
		).toEqual(["action: Expected one of Mute, Kick, Softban, Ban, VoiceKick."]);
	});

	it("takes a permanent mute, and one longer than a Discord timeout", () => {
		expect(parseWarnThresholdData({ action: "Mute", duration: null, period: 0 }).data).toEqual({
			action: "Mute",
			duration: null,
			period: 0,
		});
		const thirtyDays = 30 * 24 * 60 * 60;
		expect(
			parseWarnThresholdData({ action: "Mute", duration: thirtyDays, period: 0 }).data,
		).toEqual({ action: "Mute", duration: thirtyDays, period: 0 });
	});

	it("refuses a warning as the action, which would count towards itself", () => {
		expect(
			parseWarnThresholdData({ action: "Warning", duration: null, period: 0 }).errors,
		).toEqual(["action: Expected one of Mute, Kick, Softban, Ban, VoiceKick."]);
	});

	it("refuses a period past a year, or that is not whole seconds", () => {
		const tooLong = {
			action: "Kick",
			duration: null,
			period: MAXIMUM_WARN_THRESHOLD_SECONDS + 1,
		};
		expect(parseWarnThresholdData(tooLong).errors).toHaveLength(1);
		expect(
			parseWarnThresholdData({ action: "Kick", duration: null, period: 1.5 }).errors,
		).toHaveLength(1);
	});

	it("refuses what is not an object", () => {
		expect(parseWarnThresholdData(null).errors?.length).toBeGreaterThan(0);
		expect(parseWarnThresholdData(["Ban"]).errors?.length).toBeGreaterThan(0);
	});
});

describe("parseWarnThresholdCount", () => {
	it("reads the numbers the command takes, from 1 to 50", () => {
		expect(parseWarnThresholdCount("1")).toBe(1);
		expect(parseWarnThresholdCount("50")).toBe(50);
	});

	it.each(["0", "51", "-3", "2.5", "3e1", "", "abc"])("refuses %j", (value) => {
		expect(parseWarnThresholdCount(value)).toBeNull();
	});

	it("refuses a missing parameter", () => {
		expect(parseWarnThresholdCount(undefined)).toBeNull();
	});
});

describe("getDefaultWarnThresholds", () => {
	it("mutes for half an hour at the third warning, kicks at five and bans at seven", () => {
		expect(getDefaultWarnThresholds()).toEqual([
			{ action: "Mute", count: 3, duration: 1800, period: 0 },
			{ action: "Kick", count: 5, duration: null, period: 0 },
			{ action: "Ban", count: 7, duration: null, period: 0 },
		]);
	});
});

describe("readStoredWarnThresholdAction", () => {
	it("reads a saved Timeout as a Mute", () => {
		expect(readStoredWarnThresholdAction("Timeout")).toBe("Mute");
	});

	it("keeps a known action and skips an unknown one", () => {
		expect(readStoredWarnThresholdAction("Ban")).toBe("Ban");
		expect(readStoredWarnThresholdAction("Warning")).toBeNull();
	});
});
