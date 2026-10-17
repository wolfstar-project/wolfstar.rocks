import {
	decodeModerationMetadata,
	decodeModerationRecord,
	MODERATION_CASE_STATUSES,
	MODERATION_CASE_TYPES,
	MODERATION_TYPE_CODE,
	MODERATION_TYPE_ENCODED_MARKER,
	moderationCaseStatus,
	moderationRecordFilter,
	moderationTypeFromCode,
} from "#shared/types/moderation-types";
import { describe, expect, it } from "vitest";

// The bot's `encodeModerationRecordMetadata(type, metadata)`.
function encode(type: (typeof MODERATION_CASE_TYPES)[number], flags = 0) {
	return MODERATION_TYPE_ENCODED_MARKER | (MODERATION_CASE_TYPES.indexOf(type) << 8) | flags;
}

describe("moderationTypeFromCode", () => {
	it("keeps the numbers V6 stored", () => {
		expect(moderationTypeFromCode(1)).toBe("Warning");
		expect(moderationTypeFromCode(2)).toBe("Mute");
		expect(moderationTypeFromCode(5)).toBe("Ban");
		expect(moderationTypeFromCode(26)).toBe("Timeout");
	});

	it("returns null for a code no type uses", () => {
		expect(moderationTypeFromCode(0)).toBeNull();
		expect(moderationTypeFromCode(999)).toBeNull();
	});

	it("assigns every case type a distinct code", () => {
		const codes = MODERATION_CASE_TYPES.map((type) => MODERATION_TYPE_CODE[type]);
		expect(new Set(codes).size).toBe(codes.length);
	});
});

describe("decodeModerationMetadata", () => {
	it("reads the bot's flags", () => {
		expect(decodeModerationMetadata(0)).toStrictEqual({
			archived: false,
			completed: false,
			temporary: false,
			undo: false,
		});
		expect(decodeModerationMetadata(1 << 0).undo).toBe(true);
		expect(decodeModerationMetadata(1 << 1).temporary).toBe(true);
		expect(decodeModerationMetadata(1 << 2).temporary).toBe(true);
		expect(decodeModerationMetadata(1 << 3).archived).toBe(true);
		expect(decodeModerationMetadata(1 << 4).completed).toBe(true);
	});
});

describe("decodeModerationRecord", () => {
	it("reads the encoded type rather than the closest action", () => {
		expect(decodeModerationRecord("AddRole", encode("Mute")).type).toBe("Mute");
		expect(decodeModerationRecord("AddRole", encode("RestrictedEmbed")).type).toBe(
			"RestrictedEmbed",
		);
		expect(decodeModerationRecord("Kick", encode("VoiceKick")).type).toBe("VoiceKick");
		expect(decodeModerationRecord("AddRole", encode("RoleAdd")).type).toBe("RoleAdd");
	});

	it("reads the flags next to the encoded type", () => {
		const decoded = decodeModerationRecord("RemoveRole", encode("Mute", 0b11));
		expect(decoded).toStrictEqual({
			metadata: { archived: false, completed: false, temporary: true, undo: true },
			type: "Mute",
		});
	});

	it("falls back to the action on a row written without the marker", () => {
		expect(decodeModerationRecord("AddWarning", 0).type).toBe("Warning");
		expect(decodeModerationRecord("Unban", 0)).toStrictEqual({
			metadata: { archived: false, completed: false, temporary: false, undo: true },
			type: "Ban",
		});
	});

	it("reports a type number the dashboard does not know", () => {
		expect(
			decodeModerationRecord("Kick", MODERATION_TYPE_ENCODED_MARKER | (200 << 8)).type,
		).toBe("Unknown");
	});
});

describe("moderationRecordFilter", () => {
	it("selects a type that shares its action with others by its encoded values only", () => {
		const { encodedMetadata, legacyActions } = moderationRecordFilter("Mute");
		expect(legacyActions).toStrictEqual([]);
		expect(encodedMetadata).toContain(encode("Mute"));
		expect(encodedMetadata).toContain(encode("Mute", 0b11111));
		expect(encodedMetadata).not.toContain(encode("RoleAdd"));
	});

	it("also selects unmarked rows through the actions that imply the type", () => {
		expect(moderationRecordFilter("Warning").legacyActions).toStrictEqual([
			"AddWarning",
			"RemoveWarning",
		]);
		expect(moderationRecordFilter("RoleAdd").legacyActions).toStrictEqual(["AddRole"]);
	});

	it("round-trips every case type", () => {
		for (const type of MODERATION_CASE_TYPES) {
			for (const metadata of moderationRecordFilter(type).encodedMetadata) {
				expect(decodeModerationRecord("Kick", metadata).type).toBe(type);
			}
		}
	});
});

// The bot's `TypeMetadata` flags.
const UNDO = 1 << 0;
const TEMPORARY = 1 << 1;
const ARCHIVED = 1 << 3;
const COMPLETED = 1 << 4;

describe("moderationCaseStatus", () => {
	const status = (flags: number) => moderationCaseStatus(decodeModerationMetadata(flags));

	it("reads a case that is neither archived nor completed as open", () => {
		expect(status(0)).toBe("open");
		expect(status(TEMPORARY)).toBe("open");
		expect(status(UNDO)).toBe("open");
	});

	it("reads the completed flag", () => {
		expect(status(COMPLETED)).toBe("completed");
		expect(status(COMPLETED | TEMPORARY)).toBe("completed");
	});

	// `/case archive` sets the flag on any case, a completed one included.
	it("puts archived before completed", () => {
		expect(status(ARCHIVED)).toBe("archived");
		expect(status(ARCHIVED | COMPLETED)).toBe("archived");
	});

	it("names the states the query string accepts", () => {
		expect(MODERATION_CASE_STATUSES).toStrictEqual(["open", "completed", "archived"]);
	});
});

describe("moderationRecordFilter with a status", () => {
	it("selects every type in the state when no type is asked for", () => {
		const { encodedMetadata, legacyActions, legacyMetadata } = moderationRecordFilter(
			undefined,
			"archived",
		);

		expect(legacyActions).toBeNull();
		expect(encodedMetadata).toContain(encode("Ban", ARCHIVED));
		expect(encodedMetadata).toContain(encode("Timeout", ARCHIVED | COMPLETED));
		expect(encodedMetadata).not.toContain(encode("Ban", COMPLETED));
		expect(legacyMetadata).toContain(ARCHIVED | TEMPORARY);
		expect(legacyMetadata).not.toContain(0);
	});

	it("selects one type in one state", () => {
		const { encodedMetadata, legacyActions, legacyMetadata } = moderationRecordFilter(
			"Warning",
			"open",
		);

		expect(legacyActions).toStrictEqual(["AddWarning", "RemoveWarning"]);
		expect(encodedMetadata).toContain(encode("Warning"));
		expect(encodedMetadata).toContain(encode("Warning", TEMPORARY | UNDO));
		expect(encodedMetadata).not.toContain(encode("Warning", COMPLETED));
		expect(encodedMetadata).not.toContain(encode("Ban"));
		expect(legacyMetadata).toContain(0);
		expect(legacyMetadata).not.toContain(COMPLETED);
	});

	it("leaves any value below the marker when no state is asked for", () => {
		expect(moderationRecordFilter("Ban").legacyMetadata).toBeNull();
	});

	// Every value it selects decodes to the type and the state it was asked for.
	it("round-trips every type and state", () => {
		for (const status of MODERATION_CASE_STATUSES) {
			const { encodedMetadata, legacyMetadata } = moderationRecordFilter(undefined, status);
			for (const metadata of encodedMetadata) {
				expect(
					moderationCaseStatus(decodeModerationRecord("Kick", metadata).metadata),
				).toBe(status);
			}
			for (const metadata of legacyMetadata ?? []) {
				expect(
					moderationCaseStatus(decodeModerationRecord("Kick", metadata).metadata),
				).toBe(status);
			}
		}
	});

	// The three states split the cases: no value is in two of them, none is in none.
	it("partitions every encoded value", () => {
		const all = moderationRecordFilter(undefined).encodedMetadata;
		const split = MODERATION_CASE_STATUSES.flatMap(
			(status) => moderationRecordFilter(undefined, status).encodedMetadata,
		);
		expect(split.toSorted((a, b) => a - b)).toStrictEqual(all.toSorted((a, b) => a - b));
	});
});
