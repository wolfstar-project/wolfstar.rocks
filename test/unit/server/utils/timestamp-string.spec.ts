import {
	asTimestampString,
	timestampStringToDate,
	timestampStringToUtcIso,
} from "#server/utils/timestamp-string";
import { describe, expect, it } from "vitest";

describe("timestamp-string", () => {
	describe("asTimestampString", () => {
		it("returns the value unchanged", () => {
			expect(asTimestampString("2026-10-09T21:02:50.123Z")).toBe("2026-10-09T21:02:50.123Z");
		});
	});

	describe("timestampStringToUtcIso", () => {
		// The regression this guards: `timestamp(3)` text carries no zone, so a
		// bare `new Date()` resolves it against the runner's local zone. The
		// expectation below is the same in every zone only if UTC is assumed.
		it("reads zoneless PostgreSQL text as UTC", () => {
			expect(timestampStringToUtcIso("2026-10-09 21:02:50.123")).toBe(
				"2026-10-09T21:02:50.123Z",
			);
		});

		it("reads zoneless ISO text as UTC", () => {
			expect(timestampStringToUtcIso("2026-10-09T21:02:50.123")).toBe(
				"2026-10-09T21:02:50.123Z",
			);
		});

		it("handles text without fractional seconds", () => {
			expect(timestampStringToUtcIso("2026-10-09 21:02:50")).toBe("2026-10-09T21:02:50.000Z");
		});

		it("keeps an explicit UTC designator", () => {
			expect(timestampStringToUtcIso("2026-10-09T21:02:50.123Z")).toBe(
				"2026-10-09T21:02:50.123Z",
			);
		});

		it("honours an explicit numeric offset instead of appending Z", () => {
			expect(timestampStringToUtcIso("2026-10-09T21:02:50.123+02:00")).toBe(
				"2026-10-09T19:02:50.123Z",
			);
		});

		// The day in `2026-10-09` would read as a `-09` offset if the zone were
		// looked for anywhere but the time component.
		it("does not mistake a date's day for an offset", () => {
			expect(timestampStringToUtcIso("2026-10-09")).toBe("2026-10-09T00:00:00.000Z");
		});
	});

	describe("timestampStringToDate", () => {
		it("returns the UTC instant the column stores", () => {
			expect(timestampStringToDate("2026-10-09 21:02:50.123").getTime()).toBe(
				Date.UTC(2026, 9, 9, 21, 2, 50, 123),
			);
		});

		it("throws on text that is not a timestamp", () => {
			expect(() => timestampStringToDate("not-a-timestamp")).toThrow(TypeError);
		});
	});
});
