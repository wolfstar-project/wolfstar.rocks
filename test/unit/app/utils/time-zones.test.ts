import { describe, expect, it } from "vitest";
import { DEFAULT_TIME_ZONE, timeInZone, timeZoneOffset, timeZoneOptions } from "~/utils/time-zones";

// A summer instant, so a zone with daylight saving time is on it.
const SUMMER = new Date("2026-07-01T12:00:00Z");

describe("timeZoneOptions", () => {
	const options = timeZoneOptions(SUMMER);

	it("lists UTC first, outside every region", () => {
		expect(options[0]).toStrictEqual({
			group: undefined,
			label: "UTC",
			note: "GMT",
			value: DEFAULT_TIME_ZONE,
		});
		expect(options.filter((option) => option.value === DEFAULT_TIME_ZONE)).toHaveLength(1);
	});

	it("files each zone under its region, with its offset at that time", () => {
		expect(options.find((option) => option.value === "Europe/Rome")).toStrictEqual({
			group: "Europe",
			label: "Europe/Rome",
			note: "GMT+2",
			value: "Europe/Rome",
		});
	});

	it("writes the spaces of a zone's name as spaces", () => {
		expect(options.find((option) => option.value === "America/New_York")?.label).toBe(
			"America/New York",
		);
	});
});

describe("timeZoneOffset", () => {
	it("reads the offset a zone has at the given time", () => {
		expect(timeZoneOffset("Asia/Kolkata", SUMMER)).toBe("GMT+5:30");
		expect(timeZoneOffset("UTC", SUMMER)).toBe("GMT");
	});
});

describe("timeInZone", () => {
	it("tells the day and the time in the zone, in the given locale", () => {
		expect(timeInZone("Europe/Rome", SUMMER, "en-GB-u-hc-h23")).toBe("Wed 14:00");
		expect(timeInZone("America/New_York", SUMMER, "en-US-u-hc-h12")).toBe("Wed 8:00 AM");
	});

	it("gives nothing for a zone the browser does not know", () => {
		expect(timeInZone("Mars/Olympus", SUMMER, "en-GB")).toBeNull();
	});
});
