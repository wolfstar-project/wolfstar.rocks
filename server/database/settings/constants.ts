import type { ReadonlyGuildData } from "#server/database/settings/types";

let cachedDefaultGuildSettings: DefaultGuildData | null = null;

/**
 * The settings a guild has before anything is written for it. The values
 * mirror the column defaults of the Prisma 8 contract, and the bot's own
 * `getDefaultGuildSettings()`.
 */
export function getDefaultGuildSettings(): DefaultGuildData {
	const defaults: DefaultGuildData = (cachedDefaultGuildSettings ??= Object.assign(
		Object.create(null),
		{
			language: "en-US",
			modulesAutomod: true,
			modulesModeration: true,
			modulesLogs: true,
			modulesCommands: true,
			modulesRoles: true,
			automodChannel: null,
			automodTrackNative: false,
			commandsDisabled: [],
			commandsDisabledChannels: [],
			logsMemberAdd: null,
			logsMemberRemove: null,
			logsMemberNicknameUpdate: null,
			logsMemberUsernameUpdate: null,
			logsMessageDelete: null,
			logsMessageDeleteNsfw: null,
			logsMessageUpdate: null,
			logsMessageUpdateNsfw: null,
			logsPrune: null,
			logsReactionEmojiAdd: null,
			logsReactionEmojiRemove: null,
			logsReactionEmojiIncludeTwemoji: false,
			logsImage: null,
			logsRoleCreate: null,
			logsRoleUpdate: null,
			logsRoleDelete: null,
			logsChannelCreate: null,
			logsChannelUpdate: null,
			logsChannelDelete: null,
			logsEmojiCreate: null,
			logsEmojiUpdate: null,
			logsEmojiDelete: null,
			logsServerUpdate: null,
			logsCommand: null,
			logsSettings: null,
			logsIgnoreAll: [],
			logsIgnoreMessages: [],
			logsIgnoreReactions: [],
			moderationChannel: null,
			moderationTrackBans: false,
			moderationTrackTimeouts: false,
			permissionsUsers: [],
			permissionsRoles: [],
			reportsChannel: null,
			reportsRole: null,
			reportsAnonymous: false,
			reportsNotify: true,
			reportsBlockedUsers: [],
			rolesInitial: [],
			rolesInitialHumans: [],
			rolesInitialRobots: [],
			rolesAdmin: [],
			rolesModerator: [],
			rolesMuted: null,
			rolesPublic: [],
			rolesRemoveInitial: false,
			rolesUniqueRoleSets: [],
			rolesRestrictedReaction: null,
			rolesRestrictedEmbed: null,
			rolesRestrictedEmoji: null,
			rolesRestrictedAttachment: null,
			rolesRestrictedVoice: null,
			stickyRoles: [],
		} as const satisfies DefaultGuildData,
	) as DefaultGuildData);

	return defaults;
}

export type DefaultGuildData = Omit<ReadonlyGuildData, "id">;
