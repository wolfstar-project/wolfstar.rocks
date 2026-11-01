import { describe, expect, it } from "vitest";
import { bucketModerationActivity, moderationActivityStart } from "~/utils/moderation-activity";

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
