import { days, hours, minutes, months, seconds, years } from "#shared/utils/times";
import { Time } from "@sapphire/time-utilities";
import { describe, expect, it } from "vitest";

describe("seconds", () => {
	it("should convert seconds to milliseconds", () => {
		expect(seconds(1)).toBe(1000);
		expect(seconds(5)).toBe(5000);
		expect(seconds(0)).toBe(0);
	});

	it("should handle fractional seconds", () => {
		expect(seconds(0.5)).toBe(500);
		expect(seconds(1.5)).toBe(1500);
	});

	describe("fromMilliseconds", () => {
		it("should convert milliseconds to seconds", () => {
			expect(seconds.fromMilliseconds(1000)).toBe(1);
			expect(seconds.fromMilliseconds(5000)).toBe(5);
			expect(seconds.fromMilliseconds(0)).toBe(0);
		});

		it("should round fractional results", () => {
			expect(seconds.fromMilliseconds(1500)).toBe(2);
		});
	});

	describe("fromMinutes", () => {
		it("should convert minutes to seconds", () => {
			expect(seconds.fromMinutes(1)).toBe(60);
			expect(seconds.fromMinutes(5)).toBe(300);
			expect(seconds.fromMinutes(0)).toBe(0);
		});
	});

	describe("fromHours", () => {
		it("should convert hours to seconds", () => {
			expect(seconds.fromHours(1)).toBe(3600);
			expect(seconds.fromHours(2)).toBe(7200);
			expect(seconds.fromHours(0)).toBe(0);
		});
	});

	describe("fromDays", () => {
		it("should convert days to seconds", () => {
			expect(seconds.fromDays(1)).toBe(86_400);
			expect(seconds.fromDays(7)).toBe(604_800);
			expect(seconds.fromDays(0)).toBe(0);
		});
	});
});

describe("minutes", () => {
	it("should convert minutes to milliseconds", () => {
		expect(minutes(1)).toBe(Time.Minute);
		expect(minutes(5)).toBe(5 * Time.Minute);
		expect(minutes(0)).toBe(0);
	});

	describe("toSeconds", () => {
		it("should convert minutes to seconds", () => {
			expect(minutes.toSeconds(1)).toBe(60);
			expect(minutes.toSeconds(5)).toBe(300);
			expect(minutes.toSeconds(0)).toBe(0);
		});
	});
});

describe("hours", () => {
	it("should convert hours to milliseconds", () => {
		expect(hours(1)).toBe(Time.Hour);
		expect(hours(24)).toBe(24 * Time.Hour);
		expect(hours(0)).toBe(0);
	});
});

describe("days", () => {
	it("should convert days to milliseconds", () => {
		expect(days(1)).toBe(Time.Day);
		expect(days(7)).toBe(7 * Time.Day);
		expect(days(0)).toBe(0);
	});
});

describe("months", () => {
	it("should convert months to milliseconds", () => {
		expect(months(1)).toBe(Time.Month);
		expect(months(12)).toBe(12 * Time.Month);
		expect(months(0)).toBe(0);
	});
});

describe("years", () => {
	it("should convert years to milliseconds", () => {
		expect(years(1)).toBe(Time.Year);
		expect(years(2)).toBe(2 * Time.Year);
		expect(years(0)).toBe(0);
	});
});
