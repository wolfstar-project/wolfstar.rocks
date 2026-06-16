export const ModerationTypeCode = {
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
	AddRole: 13,
	RemoveRole: 14,
	Timeout: 26,
} as const;

export type ModerationTypeName = keyof typeof ModerationTypeCode;

// Reverse map: SmallInt -> canonical name
const CODE_TO_NAME = new Map<number, ModerationTypeName>(
	(Object.entries(ModerationTypeCode) as [ModerationTypeName, number][]).map(([k, v]) => [v, k]),
);

export function decodeModerationType(code: number): ModerationTypeName | "Unknown" {
	return CODE_TO_NAME.get(code) ?? "Unknown";
}

export interface ModerationMetadata {
	archived: boolean;
	completed: boolean;
	temporary: boolean;
}

// Bit flag layout: 0x1=archived, 0x2=completed, 0x4=temporary.
// These values match the Skyra/WolfStar common convention and must be verified against
// the WolfStar bot's Moderation.ts before the first production deploy (OQ#1/OQ#3).
// If the bot repo is inaccessible, treat `metadata` as opaque and render its raw integer value
// in the UI tooltip rather than decoding flags — this avoids silent misreporting.
const FLAG_ARCHIVED = 0x1;
const FLAG_COMPLETED = 0x2;
const FLAG_TEMPORARY = 0x4;

export function decodeModerationMetadata(meta: number): ModerationMetadata {
	return {
		archived: (meta & FLAG_ARCHIVED) !== 0,
		completed: (meta & FLAG_COMPLETED) !== 0,
		temporary: (meta & FLAG_TEMPORARY) !== 0,
	};
}

export const MODERATION_TYPE_FILTER_VALUES: { value: number; label: string }[] = (
	Object.entries(ModerationTypeCode) as [ModerationTypeName, number][]
).map(([label, value]) => ({ value, label }));
