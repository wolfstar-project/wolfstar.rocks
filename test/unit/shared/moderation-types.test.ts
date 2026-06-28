import {
	ModerationTypeCode,
	decodeModerationType,
	decodeModerationMetadata,
} from "#shared/types/moderation-types";
import { describe, expect, it } from "vitest";

describe("decodeModerationType", () => {
	it("returns 'Warning' for code 1", () => {
		expect(decodeModerationType(1)).toBe("Warning");
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

	it("covers all ModerationTypeCode entries", () => {
		for (const [name, code] of Object.entries(ModerationTypeCode)) {
			expect(decodeModerationType(code)).toBe(name);
		}
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
