import type { LogsPillTone } from "~/components/guild/logs/Pill.vue";

// Punishments that hold until someone lifts them when no duration was given.
const OPEN_ENDED_TYPES = new Set<string>([
	"Ban",
	"Mute",
	"VoiceMute",
	"RestrictedReaction",
	"RestrictedEmbed",
	"RestrictedAttachment",
	"RestrictedVoice",
	"RestrictedEmoji",
]);

/**
 * How long a case lasts: its compact duration, "permanent" for a punishment
 * given without one, or nothing for an action that has no length (a kick, a
 * warning, an undo).
 */
export function moderationCaseDuration(
	entry: Pick<ModerationLogEntry, "duration" | "metadata" | "typeName">,
): { kind: "timed"; label: string } | { kind: "permanent" } | { kind: "none" } {
	// The table stores seconds, and `0` for a case that is not temporary.
	if (entry.duration > 0) {
		return { kind: "timed", label: formatCompactDuration(entry.duration * 1000) };
	}
	return !entry.metadata.undo && OPEN_ENDED_TYPES.has(entry.typeName)
		? { kind: "permanent" }
		: { kind: "none" };
}

/** The pill tone of each state: an open case stands out, a closed one recedes. */
export const MODERATION_CASE_STATUS_TONE = {
	archived: "neutral",
	completed: "success",
	open: "primary",
} as const satisfies Record<ModerationCaseStatus, LogsPillTone>;

/** The i18n key of each state's name. */
export const MODERATION_CASE_STATUS_KEY = {
	archived: "guild_logs.case_status.archived",
	completed: "guild_logs.case_status.completed",
	open: "guild_logs.case_status.open",
} as const satisfies Record<ModerationCaseStatus, string>;

/** The pill tone of a case's action: an undo reads as a relief, a ban as a danger. */
export function moderationCaseTone(entry: Pick<ModerationLogEntry, "metadata" | "typeName">) {
	return (
		entry.metadata.undo ? "success" : moderationActionVariant(entry.typeName)
	) as LogsPillTone;
}

/** The i18n key of each case type's name, so the bot's identifiers never reach the page. */
const MODERATION_CASE_TYPE_KEY = {
	Ban: "guild_logs.case_types.ban",
	Kick: "guild_logs.case_types.kick",
	Mute: "guild_logs.case_types.mute",
	Softban: "guild_logs.case_types.softban",
	VoiceKick: "guild_logs.case_types.voice_kick",
	VoiceMute: "guild_logs.case_types.voice_mute",
	Warning: "guild_logs.case_types.warning",
	RestrictedReaction: "guild_logs.case_types.restricted_reaction",
	RestrictedEmbed: "guild_logs.case_types.restricted_embed",
	RestrictedAttachment: "guild_logs.case_types.restricted_attachment",
	RestrictedVoice: "guild_logs.case_types.restricted_voice",
	SetNickname: "guild_logs.case_types.set_nickname",
	RoleAdd: "guild_logs.case_types.role_add",
	RoleRemove: "guild_logs.case_types.role_remove",
	RestrictedEmoji: "guild_logs.case_types.restricted_emoji",
	Timeout: "guild_logs.case_types.timeout",
} as const satisfies Record<ModerationTypeName, string>;

/** The i18n key of a case type's name, `null` for a type the dashboard does not know. */
export function moderationCaseTypeKey(typeName: string): string | null {
	return Object.hasOwn(MODERATION_CASE_TYPE_KEY, typeName)
		? MODERATION_CASE_TYPE_KEY[typeName as ModerationTypeName]
		: null;
}
