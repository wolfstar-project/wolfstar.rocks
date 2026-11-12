import { describe, expect, it } from "vitest";
import {
	ACTIVITY_BUSIEST_FILL,
	ACTIVITY_QUIET_FILL,
	bucketModerationActivity,
	moderationActivityChart,
	moderationActivityFill,
	moderationActivityMax,
	moderationActivityStart,
} from "~/utils/moderation-activity";

// Wednesday, midday, so no entry sits on a day boundary.
const NOW = new Date(2026, 9, 14, 12, 0, 0);

function at(day: number, hour = 9) {
	return { createdAt: new Date(2026, 9, day, hour).toISOString() };
}

describe("moderationActivityStart", () => {
	it("is midnight of the first day of the window", () => {
		const start = moderationActivityStart(NOW, 7);

		expect(start.getFullYear()).toBe(2026);
		expect(start.getMonth()).toBe(9);
		expect(start.getDate()).toBe(8);
		expect(start.getHours()).toBe(0);
	});

	it("crosses month boundaries", () => {
		const start = moderationActivityStart(new Date(2026, 10, 2, 8), 7);

		expect(start.getMonth()).toBe(9);
		expect(start.getDate()).toBe(27);
	});
});

describe("bucketModerationActivity", () => {
	it("returns one bucket per day, oldest first, ending today", () => {
		const days = bucketModerationActivity([], { days: 7, locale: "en-US", now: NOW });

		expect(days.map((day) => day.key)).toStrictEqual([
			"2026-10-08",
			"2026-10-09",
			"2026-10-10",
			"2026-10-11",
			"2026-10-12",
			"2026-10-13",
			"2026-10-14",
		]);
		expect(days.map((day) => day.label)).toStrictEqual([
			"Thu",
			"Fri",
			"Sat",
			"Sun",
			"Mon",
			"Tue",
			"Wed",
		]);
	});

	it("counts entries on the day they happened", () => {
		const days = bucketModerationActivity([at(14), at(14, 20), at(12), at(8)], {
			days: 7,
			locale: "en-US",
			now: NOW,
		});

		expect(days.map((day) => day.count)).toStrictEqual([1, 0, 0, 0, 1, 0, 2]);
	});

	it("ignores entries outside the window and entries without a date", () => {
		const days = bucketModerationActivity(
			[at(7), at(15), { createdAt: null }, { createdAt: "not a date" }],
			{ days: 7, locale: "en-US", now: NOW },
		);

		expect(days.every((day) => day.count === 0)).toBe(true);
	});
});

describe("moderation activity chart", () => {
	const week = [0, 3, 5, 5, 1, 0, 2].map((count, index) => ({
		count,
		key: `2026-10-${8 + index}`,
		label: `d${index}`,
	}));
	const quiet = week.map((day) => ({ ...day, count: 0 }));

	it("draws the busiest days in the full colour and the others in a tint", () => {
		const fill = moderationActivityFill(week);

		expect(week.map((day) => fill(day))).toStrictEqual([
			ACTIVITY_QUIET_FILL,
			ACTIVITY_QUIET_FILL,
			ACTIVITY_BUSIEST_FILL,
			ACTIVITY_BUSIEST_FILL,
			ACTIVITY_QUIET_FILL,
			ACTIVITY_QUIET_FILL,
			ACTIVITY_QUIET_FILL,
		]);
	});

	it("highlights no day of a quiet week", () => {
		const fill = moderationActivityFill(quiet);

		expect(quiet.map((day) => fill(day))).toStrictEqual(quiet.map(() => ACTIVITY_QUIET_FILL));
	});

	it("leaves room over the busiest bar, and never collapses the axis to [0, 0]", () => {
		expect(moderationActivityMax(week)).toBeCloseTo(6);
		expect(moderationActivityMax(quiet)).toBe(1);
		expect(moderationActivityMax([])).toBe(1);
	});

	it("is a chart of a bar, a count and a baseline mark, with no y axis", () => {
		const chart = moderationActivityChart(week, String);

		expect(chart.marks).toHaveLength(3);
		expect(chart.scales?.y?.axis).toBe(false);
	});
});
