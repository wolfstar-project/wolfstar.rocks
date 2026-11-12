import { fitsTimeout, isMuteTimeout, MUTE_TIMEOUT_DURATION } from "#shared/utils/mute";
import { describe, expect, it } from "vitest";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const withRole = { moderationMuteTimeout: true, rolesMuted: "123456789012345678" };

describe("isMuteTimeout", () => {
	it("makes a mute of 1 hour a timeout while the setting is on", () => {
		expect(isMuteTimeout(withRole, HOUR)).toBe(true);
	});

	it.each([
		["30 days", 30 * DAY],
		["no duration", null],
		["a duration of 0", 0],
	])("uses the role for a mute of %s while the setting is on", (_case, duration) => {
		expect(isMuteTimeout(withRole, duration)).toBe(false);
	});

	it.each([HOUR, 30 * DAY, null])(
		"always uses the role while the setting is off (%j)",
		(duration) => {
			expect(isMuteTimeout({ ...withRole, moderationMuteTimeout: false }, duration)).toBe(
				false,
			);
		},
	);

	// The mute needs a role the bot does not set up on its own.
	it("times out a server with no muted role, even with the setting off", () => {
		const settings = { moderationMuteTimeout: false, rolesMuted: null };

		expect(isMuteTimeout(settings, HOUR)).toBe(true);
		expect(isMuteTimeout(settings, null)).toBe(false);
	});
});

describe("fitsTimeout", () => {
	it("takes 5 seconds to 28 days", () => {
		expect(fitsTimeout(MUTE_TIMEOUT_DURATION.minimum)).toBe(true);
		expect(fitsTimeout(MUTE_TIMEOUT_DURATION.maximum)).toBe(true);
		expect(fitsTimeout(MUTE_TIMEOUT_DURATION.minimum - 1)).toBe(false);
		expect(fitsTimeout(MUTE_TIMEOUT_DURATION.maximum + 1)).toBe(false);
	});
});
