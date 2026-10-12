/**
 * The moderation actions V7 stores, as its `ModerationActionType` native enum
 * spells them. The enum is narrower than the bot's case types, so the bot writes
 * the closest action here and encodes the real type in `metadata`.
 */
export const MODERATION_ACTIONS = [
	"AddRole",
	"RemoveRole",
	"Nickname",
	"AddWarning",
	"RemoveWarning",
	"Timeout",
	"TimeoutEnd",
	"Kick",
	"Softban",
	"Ban",
	"Unban",
] as const;

export type ModerationActionName = (typeof MODERATION_ACTIONS)[number];

/**
 * The case types the bot knows, in the order of its `TypeVariation` enum
 * (`projects/bot/src/lib/utilities/moderationConstants.ts`): the index of a name
 * is the number the bot encodes for it, so the order must follow the bot's.
 */
export const MODERATION_CASE_TYPES = [
	"Ban",
	"Kick",
	"Mute",
	"Softban",
	"VoiceKick",
	"VoiceMute",
	"Warning",
	"RestrictedReaction",
	"RestrictedEmbed",
	"RestrictedAttachment",
	"RestrictedVoice",
	"SetNickname",
	"RoleAdd",
	"RoleRemove",
	"RestrictedEmoji",
	"Timeout",
] as const;

export type ModerationTypeName = (typeof MODERATION_CASE_TYPES)[number];

/**
 * Filter key per case type: the numeric `typeCode` the dashboard's query string
 * carries. They are the numbers V6 stored, so the warnings tab (`typeCode=1`)
 * and older links keep selecting the same cases. A dashboard-local key, not
 * part of the bot's contract.
 */
export const MODERATION_TYPE_CODE = {
	Warning: 1,
	Mute: 2,
	Kick: 3,
	Softban: 4,
	Ban: 5,
	VoiceMute: 6,
	VoiceKick: 7,
	RestrictedReaction: 8,
	RestrictedEmbed: 9,
	RestrictedAttachment: 10,
	RestrictedVoice: 11,
	SetNickname: 12,
	RoleAdd: 13,
	RoleRemove: 14,
	RestrictedEmoji: 15,
	Timeout: 26,
} as const satisfies Record<ModerationTypeName, number>;

const CODE_TO_TYPE = new Map<number, ModerationTypeName>(
	(Object.entries(MODERATION_TYPE_CODE) as [ModerationTypeName, number][]).map(([name, code]) => [
		code,
		name,
	]),
);

/** Names the case type a filter code selects, or `null` when no type uses it. */
export function moderationTypeFromCode(code: number): ModerationTypeName | null {
	return CODE_TO_TYPE.get(code) ?? null;
}

export interface ModerationMetadata {
	archived: boolean;
	completed: boolean;
	temporary: boolean;
	/** The case reverses an earlier one: an unban, an unmute, a removed warning. */
	undo: boolean;
}

// The bot's `TypeMetadata` flags, held in the low byte of `metadata`.
const FLAG_UNDO = 1 << 0;
const FLAG_TEMPORARY = 1 << 1;
// Deprecated by the bot in favour of `Temporary`, still set on older cases.
const FLAG_FAST = 1 << 2;
const FLAG_ARCHIVED = 1 << 3;
const FLAG_COMPLETED = 1 << 4;
const FLAG_COMBINATIONS = 1 << 5;

// Layout of the `metadata` column, from the bot's `ModerationRecord.ts`: the
// flags in the first byte, the case type in the second, and a marker bit that
// tells the type is encoded. A row without the marker was not written by that
// encoder, and its `action` is then the only source for the type.
const METADATA_MASK = 0xFF;
const TYPE_SHIFT = 8;
const TYPE_MASK = 0xFF << TYPE_SHIFT;
export const MODERATION_TYPE_ENCODED_MARKER = 1 << 16;

const ACTION_TO_TYPE = {
	AddRole: ["RoleAdd", 0],
	RemoveRole: ["RoleRemove", 0],
	Nickname: ["SetNickname", 0],
	AddWarning: ["Warning", 0],
	RemoveWarning: ["Warning", FLAG_UNDO],
	Timeout: ["Timeout", 0],
	TimeoutEnd: ["Timeout", FLAG_UNDO],
	Kick: ["Kick", 0],
	Softban: ["Softban", 0],
	Ban: ["Ban", 0],
	Unban: ["Ban", FLAG_UNDO],
} as const satisfies Record<ModerationActionName, readonly [ModerationTypeName, number]>;

export function decodeModerationMetadata(meta: number): ModerationMetadata {
	return {
		archived: (meta & FLAG_ARCHIVED) !== 0,
		completed: (meta & FLAG_COMPLETED) !== 0,
		temporary: (meta & (FLAG_TEMPORARY | FLAG_FAST)) !== 0,
		undo: (meta & FLAG_UNDO) !== 0,
	};
}

/**
 * Reads the case type and flags of a `ModerationAction` row the way the bot
 * does: from `metadata` when the marker is set, from `action` otherwise.
 */
export function decodeModerationRecord(
	action: ModerationActionName,
	metadata: number,
): { type: ModerationTypeName | "Unknown"; metadata: ModerationMetadata } {
	if ((metadata & MODERATION_TYPE_ENCODED_MARKER) === MODERATION_TYPE_ENCODED_MARKER) {
		return {
			metadata: decodeModerationMetadata(metadata & METADATA_MASK),
			type: MODERATION_CASE_TYPES[(metadata & TYPE_MASK) >> TYPE_SHIFT] ?? "Unknown",
		};
	}

	const [type, implied] = ACTION_TO_TYPE[action];
	return { metadata: decodeModerationMetadata((metadata & METADATA_MASK) | implied), type };
}

/**
 * What selects the rows of one case type without decoding in SQL: every
 * `metadata` value the encoder can produce for it, and the actions that imply
 * it on a row written without the marker.
 */
export function moderationRecordFilter(type: ModerationTypeName): {
	encodedMetadata: number[];
	legacyActions: ModerationActionName[];
} {
	const encodedType =
		MODERATION_TYPE_ENCODED_MARKER | (MODERATION_CASE_TYPES.indexOf(type) << TYPE_SHIFT);

	return {
		encodedMetadata: Array.from(
			{ length: FLAG_COMBINATIONS },
			(_, flags) => encodedType | flags,
		),
		legacyActions: MODERATION_ACTIONS.filter((action) => ACTION_TO_TYPE[action][0] === type),
	};
}

export const MODERATION_TYPE_FILTER_VALUES: { value: number; label: string }[] =
	MODERATION_CASE_TYPES.map((label) => ({ value: MODERATION_TYPE_CODE[label], label }));
