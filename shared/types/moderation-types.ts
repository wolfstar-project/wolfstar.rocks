/**
 * The moderation actions V7 stores, as its `ModerationActionType` native enum
 * spells them. This is the identity the database holds; the numeric codes below
 * exist only so the dashboard can keep filtering by a scalar.
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

export type ModerationAction = (typeof MODERATION_ACTIONS)[number];

/**
 * Filter key per action, and the only bridge between V7's enum and the numeric
 * `typeCode` the dashboard's query string carries.
 *
 * Where an action is a V6 type under a new name it keeps that type's number, so
 * existing links and the warnings tab keep working (`AddWarning` is V6's
 * `Warning` = 1, `Nickname` is `SetNickname` = 12). The three actions V6 had no
 * type for get numbers that were free in that range. Nothing reads these from
 * the database any more — V7 stores the name — so they are a dashboard-local
 * key, not part of the bot's contract.
 */
export const MODERATION_ACTION_CODE = {
	AddRole: 13,
	RemoveRole: 14,
	Nickname: 12,
	AddWarning: 1,
	RemoveWarning: 15,
	Timeout: 26,
	TimeoutEnd: 27,
	Kick: 3,
	Softban: 4,
	Ban: 5,
	Unban: 16,
} as const satisfies Record<ModerationAction, number>;

export type ModerationTypeName = ModerationAction;

const CODE_TO_ACTION = new Map<number, ModerationAction>(
	(Object.entries(MODERATION_ACTION_CODE) as [ModerationAction, number][]).map(([name, code]) => [
		code,
		name,
	]),
);

/** Names the action a filter code selects, or `null` when no action uses it. */
export function moderationActionFromCode(code: number): ModerationAction | null {
	return CODE_TO_ACTION.get(code) ?? null;
}

export function decodeModerationType(code: number): ModerationAction | "Unknown" {
	return CODE_TO_ACTION.get(code) ?? "Unknown";
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

export const MODERATION_TYPE_FILTER_VALUES: { value: number; label: string }[] =
	MODERATION_ACTIONS.map((label) => ({ value: MODERATION_ACTION_CODE[label], label }));
