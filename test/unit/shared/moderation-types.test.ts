import {
	decodeModerationMetadata,
	decodeModerationType,
	MODERATION_ACTION_CODE,
	MODERATION_ACTIONS,
	moderationActionFromCode,
} from "#shared/types/moderation-types";
import { describe, expect, it } from "vitest";

describe("decodeModerationType", () => {
	it("keeps V6's number for an action that was only renamed", () => {
		expect(decodeModerationType(1)).toBe("AddWarning");
		expect(decodeModerationType(12)).toBe("Nickname");
	});

	it("returns 'Ban' for code 5", () => {
		expect(decodeModerationType(5)).toBe("Ban");
	});

	it("returns 'Timeout' for code 26", () => {
		expect(decodeModerationType(26)).toBe("Timeout");
	});

	it("returns 'Unknown' for unmapped code", () => {
		expect(decodeModerationType(999)).toBe("Unknown");
	});

	it("returns 'Unknown' for code 0", () => {
		expect(decodeModerationType(0)).toBe("Unknown");
	});

	it("round-trips every V7 action", () => {
		for (const action of MODERATION_ACTIONS) {
			expect(decodeModerationType(MODERATION_ACTION_CODE[action])).toBe(action);
		}
	});
});

describe("moderationActionFromCode", () => {
	it("names the action a filter code selects", () => {
		expect(moderationActionFromCode(5)).toBe("Ban");
	});

	it("returns null for a code no action uses, so it never reaches the enum", () => {
		expect(moderationActionFromCode(999)).toBeNull();
		// V6 codes with no V7 action: Mute, VoiceMute, RestrictedReaction.
		expect(moderationActionFromCode(2)).toBeNull();
		expect(moderationActionFromCode(6)).toBeNull();
		expect(moderationActionFromCode(8)).toBeNull();
	});
});

describe("MODERATION_ACTION_CODE", () => {
	it("assigns every action a distinct code", () => {
		const codes = MODERATION_ACTIONS.map((action) => MODERATION_ACTION_CODE[action]);
		expect(new Set(codes).size).toBe(codes.length);
	});
});

describe("decodeModerationMetadata", () => {
	it("decodes archived flag (0x1)", () => {
		expect(decodeModerationMetadata(0x1)).toEqual({
			archived: true,
			completed: false,
			temporary: false,
		});
	});

	it("decodes completed flag (0x2)", () => {
		expect(decodeModerationMetadata(0x2)).toEqual({
			archived: false,
			completed: true,
			temporary: false,
		});
	});

	it("decodes temporary flag (0x4)", () => {
		expect(decodeModerationMetadata(0x4)).toEqual({
			archived: false,
			completed: false,
			temporary: true,
		});
	});

	it("decodes all flags combined (0x7)", () => {
		expect(decodeModerationMetadata(0x7)).toEqual({
			archived: true,
			completed: true,
			temporary: true,
		});
	});

	it("decodes no flags (0)", () => {
		expect(decodeModerationMetadata(0)).toEqual({
			archived: false,
			completed: false,
			temporary: false,
		});
	});

	it("ignores unknown bits", () => {
		const result = decodeModerationMetadata(31);
		expect(result.archived).toBe(true);
		expect(result.completed).toBe(true);
		expect(result.temporary).toBe(true);
	});
});
