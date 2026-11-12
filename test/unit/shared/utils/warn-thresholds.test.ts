import { describe, expect, it } from "vitest";
import {
	getDefaultWarnThresholds,
	MAXIMUM_TIMEOUT_SECONDS,
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

	it("refuses a timeout without a duration, or longer than Discord gives", () => {
		expect(
			parseWarnThresholdData({ action: "Timeout", duration: null, period: 0 }).errors,
		).toEqual(["duration: A timeout needs a duration."]);
		expect(
			parseWarnThresholdData({
				action: "Timeout",
				duration: MAXIMUM_TIMEOUT_SECONDS + 1,
				period: 0,
			}).errors,
		).toHaveLength(1);
	});

	it("refuses a warning as the action, which would count towards itself", () => {
		expect(
			parseWarnThresholdData({ action: "Warning", duration: null, period: 0 }).errors,
		).toEqual(["action: Expected one of Timeout, Mute, Kick, Softban, Ban, VoiceKick."]);
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
	it("mutes at the third warning when the server has a muted role", () => {
		expect(getDefaultWarnThresholds(true)[0]).toEqual({
			action: "Mute",
			count: 3,
			duration: 1800,
			period: 0,
		});
	});

	it("times out instead when it has none, then kicks at five and bans at seven", () => {
		expect(getDefaultWarnThresholds(false).map(({ action, count }) => [count, action])).toEqual(
			[
				[3, "Timeout"],
				[5, "Kick"],
				[7, "Ban"],
			],
		);
	});
});
