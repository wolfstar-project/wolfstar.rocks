import type { GuildData } from "#server/database";
import type { GuildModuleEntry } from "#shared/utils/guild-modules";
import { GUILD_MODULES } from "#shared/utils/guild-modules";

/** The steps of a server's first setup, in order. */
export const SETUP_STEPS = ["modules", "channels", "roles", "language", "review"] as const;
export type SetupStep = (typeof SETUP_STEPS)[number];

type ModuleKey = GuildModuleEntry["key"];

/** The modules setup offers switched on; the others stay a choice. */
export const SETUP_RECOMMENDED_MODULES: readonly ModuleKey[] = [
	"modulesAutomod",
	"modulesModeration",
];

/**
 * The event logs the one "event log" channel of setup covers: the events most
 * servers want first. The rest, and a channel for each, are set in Events.
 */
export const SETUP_EVENT_LOG_KEYS = [
	"logsMemberAdd",
	"logsMemberRemove",
	"logsMessageDelete",
	"logsMessageUpdate",
	"logsRoleCreate",
	"logsRoleUpdate",
	"logsRoleDelete",
	"logsChannelCreate",
	"logsChannelDelete",
	"logsServerUpdate",
] as const satisfies readonly (keyof GuildData)[];

/** What an admin has chosen so far, kept until setup is finished or left. */
export interface SetupDraft {
	/** The step on screen, from 1. */
	step: number;
	/** The furthest step reached, from 1: steps up to it can be revisited. */
	reached: number;
	modules: Record<ModuleKey, boolean>;
	moderationChannel: string | null;
	automodChannel: string | null;
	eventsChannel: string | null;
	admin: string[];
	moderator: string[];
	muted: string | null;
	/** The language WolfStar speaks in the server, as the bot stores it. */
	language: string;
}

export function createSetupDraft(language: string): SetupDraft {
	return {
		admin: [],
		automodChannel: null,
		eventsChannel: null,
		language,
		moderationChannel: null,
		moderator: [],
		modules: Object.fromEntries(
			GUILD_MODULES.map((module) => [
				module.key,
				SETUP_RECOMMENDED_MODULES.includes(module.key),
			]),
		) as Record<ModuleKey, boolean>,
		muted: null,
		reached: 1,
		step: 1,
	};
}

/** The channels the chosen modules post to, so the step asks for those only. */
export function setupChannelFields(draft: SetupDraft) {
	return {
		automod: draft.modules.modulesAutomod,
		// The logs are not a module, so setup always offers their channel:
		events: true,
		moderation: draft.modules.modulesModeration,
	};
}

/**
 * The settings a finished setup writes. A channel is only written for a module
 * that is on, and an empty choice writes nothing, so it keeps its default.
 */
export function setupChanges(draft: SetupDraft): Partial<GuildData> {
	const changes: Partial<GuildData> = { language: draft.language };

	for (const module of GUILD_MODULES) {
		changes[module.key] = draft.modules[module.key];
	}
	if (draft.modules.modulesModeration && draft.moderationChannel) {
		changes.moderationChannel = draft.moderationChannel;
	}
	if (draft.modules.modulesAutomod && draft.automodChannel) {
		changes.automodChannel = draft.automodChannel;
	}
	if (draft.eventsChannel) {
		for (const key of SETUP_EVENT_LOG_KEYS) {
			changes[key] = draft.eventsChannel;
		}
	}
	if (draft.admin.length > 0) changes.rolesAdmin = draft.admin;
	if (draft.moderator.length > 0) changes.rolesModerator = draft.moderator;
	if (draft.muted) changes.rolesMuted = draft.muted;

	return changes;
}

/** The step before or after `step`, kept inside the steps there are. */
export function clampSetupStep(step: number): number {
	return Math.min(SETUP_STEPS.length, Math.max(1, Math.trunc(step)));
}
