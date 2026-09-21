import type { DeepReadonly } from "@sapphire/utilities";
import type { Snowflake } from "discord-api-types/v10";

export interface PermissionsNode {
	allow: readonly Snowflake[];
	deny: readonly Snowflake[];
	id: Snowflake;
}

export type CommandAutoDelete = readonly [Snowflake, number];

export interface DisabledCommandChannel {
	channel: Snowflake;
	commands: readonly Snowflake[];
}

export interface StickyRole {
	roles: readonly Snowflake[];
	user: Snowflake;
}

export interface ReactionRole {
	channel: Snowflake;
	emoji: string;
	message: Snowflake | null;
	role: Snowflake;
}

export interface UniqueRoleSet {
	name: string;
	roles: readonly Snowflake[];
}

/**
 * Guild settings payload as returned by the WolfStar bot API.
 * Hard-action durations are JSON numbers (not bigint).
 */
export interface GuildData {
	id: string;
	prefix: string;
	language: string;
	disableNaturalPrefix: boolean;
	disabledCommands: string[];
	permissionsUsers: PermissionsNode[];
	permissionsRoles: PermissionsNode[];
	channelsMediaOnly: string[];
	channelsLogsModeration: string | null;
	channelsLogsImage: string | null;
	channelsLogsMemberAdd: string | null;
	channelsLogsMemberRemove: string | null;
	channelsLogsMemberNicknameUpdate: string | null;
	channelsLogsMemberUsernameUpdate: string | null;
	channelsLogsMemberRolesUpdate: string | null;
	channelsLogsMessageDelete: string | null;
	channelsLogsMessageDeleteNsfw: string | null;
	channelsLogsMessageUpdate: string | null;
	channelsLogsMessageUpdateNsfw: string | null;
	channelsLogsPrune: string | null;
	channelsLogsReaction: string | null;
	channelsLogsRoleCreate: string | null;
	channelsLogsRoleUpdate: string | null;
	channelsLogsRoleDelete: string | null;
	channelsLogsChannelCreate: string | null;
	channelsLogsChannelUpdate: string | null;
	channelsLogsChannelDelete: string | null;
	channelsLogsEmojiCreate: string | null;
	channelsLogsEmojiUpdate: string | null;
	channelsLogsEmojiDelete: string | null;
	channelsLogsServerUpdate: string | null;
	channelsLogsVoiceChannel: string | null;
	channelsLogsCommand: string | null;
	channelsLogsSettings: string | null;
	channelsIgnoreAll: string[];
	channelsIgnoreMessageEdit: string[];
	channelsIgnoreMessageDelete: string[];
	channelsIgnoreReactionAdd: string[];
	channelsIgnoreVoiceActivity: string[];
	commandAutoDelete: CommandAutoDelete[];
	disabledChannels: string[];
	disabledCommandsChannels: DisabledCommandChannel[];
	eventsBanAdd: boolean;
	eventsBanRemove: boolean;
	eventsTwemojiReactions: boolean;
	eventsUnknownMessages: boolean;
	eventsIncludeBots: boolean;
	eventsTimeout: boolean;
	messagesIgnoreChannels: string[];
	messagesModerationDm: boolean;
	messagesModerationReasonDisplay: boolean;
	messagesModerationMessageDisplay: boolean;
	messagesModerationAutoDelete: boolean;
	messagesModeratorNameDisplay: boolean;
	messagesAutoDeleteIgnoredAll: boolean;
	messagesAutoDeleteIgnoredRoles: string[];
	messagesAutoDeleteIgnoredChannels: string[];
	messagesAutoDeleteIgnoredCommands: string[];
	stickyRoles: StickyRole[];
	reactionRoles: ReactionRole[];
	rolesAdmin: string[];
	rolesInitial: string | null;
	rolesInitialHumans: string | null;
	rolesInitialBots: string | null;
	rolesModerator: string[];
	rolesMuted: string | null;
	rolesRestrictedReaction: string | null;
	rolesRestrictedEmbed: string | null;
	rolesRestrictedEmoji: string | null;
	rolesRestrictedAttachment: string | null;
	rolesRestrictedVoice: string | null;
	rolesPublic: string[];
	rolesRemoveInitial: boolean;
	rolesUniqueRoleSets: UniqueRoleSet[];
	selfmodAttachmentsEnabled: boolean;
	selfmodAttachmentsIgnoredRoles: string[];
	selfmodAttachmentsIgnoredChannels: string[];
	selfmodAttachmentsSoftAction: number;
	selfmodAttachmentsHardAction: number;
	selfmodAttachmentsHardActionDuration: number | null;
	selfmodAttachmentsThresholdMaximum: number;
	selfmodAttachmentsThresholdDuration: number;
	selfmodCapitalsEnabled: boolean;
	selfmodCapitalsIgnoredRoles: string[];
	selfmodCapitalsIgnoredChannels: string[];
	selfmodCapitalsMinimum: number;
	selfmodCapitalsMaximum: number;
	selfmodCapitalsSoftAction: number;
	selfmodCapitalsHardAction: number;
	selfmodCapitalsHardActionDuration: number | null;
	selfmodCapitalsThresholdMaximum: number;
	selfmodCapitalsThresholdDuration: number;
	selfmodLinksEnabled: boolean;
	selfmodLinksAllowed: string[];
	selfmodLinksIgnoredRoles: string[];
	selfmodLinksIgnoredChannels: string[];
	selfmodLinksSoftAction: number;
	selfmodLinksHardAction: number;
	selfmodLinksHardActionDuration: number | null;
	selfmodLinksThresholdMaximum: number;
	selfmodLinksThresholdDuration: number;
	selfmodMessagesEnabled: boolean;
	selfmodMessagesIgnoredRoles: string[];
	selfmodMessagesIgnoredChannels: string[];
	selfmodMessagesMaximum: number;
	selfmodMessagesQueueSize: number;
	selfmodMessagesSoftAction: number;
	selfmodMessagesHardAction: number;
	selfmodMessagesHardActionDuration: number | null;
	selfmodMessagesThresholdMaximum: number;
	selfmodMessagesThresholdDuration: number;
	selfmodNewlinesEnabled: boolean;
	selfmodNewlinesIgnoredRoles: string[];
	selfmodNewlinesIgnoredChannels: string[];
	selfmodNewlinesMaximum: number;
	selfmodNewlinesSoftAction: number;
	selfmodNewlinesHardAction: number;
	selfmodNewlinesHardActionDuration: number | null;
	selfmodNewlinesThresholdMaximum: number;
	selfmodNewlinesThresholdDuration: number;
	selfmodInvitesEnabled: boolean;
	selfmodInvitesIgnoredCodes: string[];
	selfmodInvitesIgnoredGuilds: string[];
	selfmodInvitesIgnoredRoles: string[];
	selfmodInvitesIgnoredChannels: string[];
	selfmodInvitesSoftAction: number;
	selfmodInvitesHardAction: number;
	selfmodInvitesHardActionDuration: number | null;
	selfmodInvitesThresholdMaximum: number;
	selfmodInvitesThresholdDuration: number;
	selfmodFilterEnabled: boolean;
	selfmodFilterRaw: string[];
	selfmodFilterIgnoredRoles: string[];
	selfmodFilterIgnoredChannels: string[];
	selfmodFilterSoftAction: number;
	selfmodFilterHardAction: number;
	selfmodFilterHardActionDuration: number | null;
	selfmodFilterThresholdMaximum: number;
	selfmodFilterThresholdDuration: number;
	selfmodReactionsEnabled: boolean;
	selfmodReactionsIgnoredRoles: string[];
	selfmodReactionsIgnoredChannels: string[];
	selfmodReactionsMaximum: number;
	selfmodReactionsAllowed: string[];
	selfmodReactionsBlocked: string[];
	selfmodReactionsSoftAction: number;
	selfmodReactionsHardAction: number;
	selfmodReactionsHardActionDuration: number | null;
	selfmodReactionsThresholdMaximum: number;
	selfmodReactionsThresholdDuration: number;
	selfmodIgnoredChannels: string[];
	noMentionSpamEnabled: boolean;
	noMentionSpamAlerts: boolean;
	noMentionSpamMentionsAllowed: number;
	noMentionSpamTimePeriod: number;
}

export type GuildDataKey = keyof GuildData;

export type ReadonlyGuildData = DeepReadonly<GuildData>;

export interface CommandLogData {
	id: string;
	guildId: string;
	userId: string;
	commandName: string;
	commandType: string;
	commandId: string | null;
	subcommand: string | null;
	channelId: string | null;
	success: boolean;
	errorReason: string | null;
	executedAt: string;
	latencyMs: number | null;
	metadata: unknown | null;
}
