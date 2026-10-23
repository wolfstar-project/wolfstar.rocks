import type {
	ListSettingKey,
	Roles,
	SettingEntry,
	SingleSettingKey,
	ToggleSettingKey,
} from "../types/configurableData";
import type { ChoiceSettingKey, NumberSettingKey } from "./settings-choices";

/**
 * The dashboard-managed settings of the V7 contract, grouped the way the
 * dashboard's sections present them. The keys are the bot's flat `GuildData`
 * keys (`projects/bot/src/lib/database/settings/configuration.ts`); the English
 * copy here is the fallback for `settings.entries.<key>.*` in the locale files.
 */

// #region Roles

export const ConfigurableRoleToggles: SettingEntry<ToggleSettingKey>[] = [
	{
		key: "rolesRemoveInitial",
		name: "Remove Initial",
		description:
			"When enabled, claiming a public role automatically removes the initial roles.",
	},
];

export const ConfigurableRoles: Roles.Role[] = [
	{
		key: "rolesAdmin",
		name: "Administrator",
		description:
			'The administrator roles. Administrators have access to all moderation and management commands. Defaults to anyone with the "Manage Server" permission.',
		many: true,
		group: "standard",
	},
	{
		key: "rolesModerator",
		name: "Moderator",
		description:
			"The moderator roles. Moderators have access to almost all moderation commands. Defaults to anyone who can ban members",
		many: true,
		group: "standard",
	},
	{
		key: "rolesInitial",
		name: "Initial",
		description: "The initial roles are assigned to every member as soon as they join.",
		many: true,
		group: "standard",
	},
	{
		key: "rolesInitialHumans",
		name: "Initial (Humans)",
		description: "Assigned to human members as soon as they join.",
		many: true,
		group: "standard",
	},
	{
		key: "rolesInitialRobots",
		name: "Initial (Bots)",
		description: "Assigned to bots as soon as they are added to the server.",
		many: true,
		group: "standard",
	},
	{
		key: "rolesMuted",
		name: "Muted",
		description:
			"The muted role, if configured, is assigned to muted users. If no muted role is set, you are prompted to create one.",
		many: false,
		group: "standard",
	},
	{
		key: "rolesPublic",
		name: "Public Roles",
		description:
			'The public roles. These can be claimed by any user using the "roles" command.',
		many: true,
		group: "standard",
	},
	{
		key: "rolesRestrictedReaction",
		name: "Restricted Reaction",
		description: "Assigned to members whose reactions are restricted.",
		many: false,
		group: "restricted",
	},
	{
		key: "rolesRestrictedEmbed",
		name: "Restricted Embed",
		description: "Assigned to members who are restricted from embedding links.",
		many: false,
		group: "restricted",
	},
	{
		key: "rolesRestrictedAttachment",
		name: "Restricted Attachment",
		description: "Assigned to members who are restricted from uploading attachments.",
		many: false,
		group: "restricted",
	},
	{
		key: "rolesRestrictedEmoji",
		name: "Restricted Emoji",
		description: "Assigned to members who are restricted from using external emojis.",
		many: false,
		group: "restricted",
	},
	{
		key: "rolesRestrictedVoice",
		name: "Restricted Voice",
		description: "Assigned to members who are restricted from joining voice channels.",
		many: false,
		group: "restricted",
	},
];

// #endregion

// #region Moderation

export const ConfigurableModerationChannels: SettingEntry<SingleSettingKey>[] = [
	{
		key: "moderationChannel",
		name: "Moderation Logs",
		description: "Receives all moderation case logs. Required for the options below to work.",
	},
];

export const ConfigurableModerationToggles: SettingEntry<ToggleSettingKey>[] = [
	{
		key: "moderationTrackBans",
		name: "Track Manual Bans",
		description: "Opens a moderation case when a member is banned or unbanned by hand.",
	},
	{
		key: "moderationTrackTimeouts",
		name: "Track Manual Timeouts",
		description: "Opens a moderation case when a member is timed out by hand.",
	},
	{
		key: "moderationTrackKicks",
		name: "Track Manual Kicks",
		description:
			"Opens a moderation case when a member is kicked by hand. WolfStar reads the audit log for every member who leaves, so it needs View Audit Log.",
	},
	{
		key: "moderationTrackRoles",
		name: "Track Manual Roles",
		description:
			"Mutes or restricts a member, as the commands do, when someone gives them the muted role or a restriction role by hand.",
	},
	{
		key: "moderationDehoist",
		name: "Dehoist Names",
		description:
			"Cleans the names of the members when they join or change them: what lists a name above the others goes, and fancy fonts, symbols and emojis become plain letters. Accents stay, and sticky nicknames and members who can manage nicknames are left alone.",
	},
];

export const ConfigurableModerationNumbers: SettingEntry<NumberSettingKey>[] = [
	{
		key: "moderationConfirmRecentMinutes",
		name: "Confirm a Second Action",
		description:
			"Asks before acting on a member who got a case within these minutes, so two moderators do not punish twice. 0 never asks.",
	},
];

// #endregion

// #region Auto-moderation

export const ConfigurableAutomodChannels: SettingEntry<SingleSettingKey>[] = [
	{
		key: "automodChannel",
		name: "Auto-moderation Logs",
		description: "Receives a log message when an auto-moderation rule acts on a message.",
	},
];

export const ConfigurableAutomodToggles: SettingEntry<ToggleSettingKey>[] = [
	{
		key: "automodTrackNative",
		name: "Track Discord AutoMod",
		description: "Also logs the actions taken by Discord's own AutoMod rules.",
	},
];

// #endregion

// #region Logs

export const ConfigurableLoggingChannels: SettingEntry<SingleSettingKey>[] = [
	{
		key: "logsMemberAdd",
		name: "Member Add Logs",
		description: "Receives a log message when a member joins the server.",
	},
	{
		key: "logsMemberRemove",
		name: "Member Remove Logs",
		description: "Receives a log message when a member leaves, is kicked, or is banned.",
	},
	{
		key: "logsMemberNicknameUpdate",
		name: "Member Nickname Update Logs",
		description: "Receives a log message when a member changes their nickname.",
	},
	{
		key: "logsMemberUsernameUpdate",
		name: "Member Username Update Logs",
		description: "Receives a log message when a member changes their username.",
	},
	{
		key: "logsBoosts",
		name: "Boost Logs",
		description:
			"Receives a log message when a member starts boosting the server and when they stop, with how long they boosted for.",
	},
	{
		key: "logsMessageDelete",
		name: "Message Delete Logs",
		description: "Receives a log message when a message is deleted.",
	},
	{
		key: "logsMessageDeleteNsfw",
		name: "NSFW Message Delete Logs",
		description: "Receives a log message when a message from an NSFW channel is deleted.",
	},
	{
		key: "logsMessageUpdate",
		name: "Message Update Logs",
		description: "Receives a log message when a message is edited.",
	},
	{
		key: "logsMessageUpdateNsfw",
		name: "NSFW Message Update Logs",
		description: "Receives a log message when a message from an NSFW channel is edited.",
	},
	{
		key: "logsImage",
		name: "Image Logs",
		description: "Receives re-uploaded copies of images posted in the server.",
	},
	{
		key: "logsPrune",
		name: "Prune Logs",
		description: "Receives a log message when messages are bulk-deleted (pruned).",
	},
	{
		key: "logsReactionEmojiAdd",
		name: "Reaction Add Logs",
		description: "Receives a log message when a reaction is added to a message.",
	},
	{
		key: "logsReactionEmojiRemove",
		name: "Reaction Remove Logs",
		description: "Receives a log message when a reaction is removed from a message.",
	},
	{
		key: "logsChannelCreate",
		name: "Channel Create Logs",
		description: "Receives a log message when a new channel is created.",
	},
	{
		key: "logsChannelUpdate",
		name: "Channel Update Logs",
		description:
			"Receives a log message when any channel is updated, including the changes made.",
	},
	{
		key: "logsChannelDelete",
		name: "Channel Delete Logs",
		description: "Receives a log message when a channel is deleted.",
	},
	{
		key: "logsEmojiCreate",
		name: "Emoji Create Logs",
		description: "Receives a log message when a new emoji is created.",
	},
	{
		key: "logsEmojiUpdate",
		name: "Emoji Update Logs",
		description: "Receives a log message when an emoji is updated, including the changes made.",
	},
	{
		key: "logsEmojiDelete",
		name: "Emoji Delete Logs",
		description: "Receives a log message when an emoji is deleted.",
	},
	{
		key: "logsRoleCreate",
		name: "Role Create Logs",
		description: "Receives a log message when a new role is created.",
	},
	{
		key: "logsRoleUpdate",
		name: "Role Update Logs",
		description: "Receives a log message when a role is updated, including the changes made.",
	},
	{
		key: "logsRoleDelete",
		name: "Role Delete Logs",
		description: "Receives a log message when a role is deleted.",
	},
	{
		key: "logsServerUpdate",
		name: "Server Update Logs",
		description:
			"Receives a log message when the server settings are updated, including the changes made.",
	},
	{
		key: "logsInvites",
		name: "Invite Logs",
		description: "Receives a log message when an invite is created or deleted.",
	},
	{
		key: "logsThreads",
		name: "Thread Logs",
		description:
			"Receives a log message when a thread is created, deleted, renamed, archived or locked.",
	},
	{
		key: "logsEvents",
		name: "Event Logs",
		description:
			"Receives a log message when a scheduled event is created, changed, started, ended or deleted.",
	},
	{
		key: "logsExpressions",
		name: "Sticker and Sound Logs",
		description:
			"Receives a log message when a sticker or a soundboard sound is created, changed or deleted.",
	},
	{
		key: "logsIntegrations",
		name: "App and Webhook Logs",
		description:
			"Receives a log message when an app is added or removed, and when the webhooks of a channel change.",
	},
];

export const ConfigurableIgnoreChannels: SettingEntry<ListSettingKey>[] = [
	{
		key: "logsIgnoreAll",
		name: "All logs",
		description: "Channels excluded from all types of logging.",
	},
	{
		key: "logsIgnoreMessages",
		name: "Message logs",
		description: "Channels excluded from deleted-message and edited-message logging.",
	},
	{
		key: "logsIgnoreReactions",
		name: "Reaction logs",
		description: "Channels excluded from reaction logging.",
	},
];

export const ConfigurableLogToggles: SettingEntry<ToggleSettingKey>[] = [
	{
		key: "logsReactionEmojiIncludeTwemoji",
		name: "Twemoji Reactions",
		description:
			"When a member reacts with a Twemoji, the reaction is sent to the reaction log channels.",
	},
];

/** How the logs reach their channels, whatever the event. */
export const ConfigurableLogDeliveryToggles: SettingEntry<ToggleSettingKey>[] = [
	{
		key: "logsWebhooks",
		name: "Send Through Webhooks",
		description:
			"WolfStar creates a webhook in each log channel, whose name and avatar you can change. Without Manage Webhooks a channel gets the logs as before; the moderation log and the reports are always WolfStar's own messages.",
	},
];

export const ConfigurableLogChoices: SettingEntry<Extract<ChoiceSettingKey, `logs${string}`>>[] = [
	{
		key: "logsMessageUpdateStyle",
		name: "Edited Messages",
		description: "How the log of an edited message shows what changed.",
	},
];

// #endregion

// #region Commands

export const ConfigurableCommandChannels: SettingEntry<ListSettingKey>[] = [
	{
		key: "commandsDisabledChannels",
		name: "Disabled Channels",
		description: "Channels where members cannot use any WolfStar command.",
	},
];

// #endregion

// #region Reports

export const ConfigurableReportChannels: SettingEntry<SingleSettingKey>[] = [
	{
		key: "reportsChannel",
		name: "Reports Channel",
		description: "Receives the reports members file. Reports are off until a channel is set.",
	},
];

export const ConfigurableReportRoles: SettingEntry<SingleSettingKey>[] = [
	{
		key: "reportsRole",
		name: "Notified Role",
		description: "Mentioned in the reports channel when a new report comes in.",
	},
];

export const ConfigurableReportToggles: SettingEntry<ToggleSettingKey>[] = [
	{
		key: "reportsAnonymous",
		name: "Anonymous Reports",
		description: "Hides who filed a report from the moderators reading it.",
	},
	{
		key: "reportsNotify",
		name: "Notify Reporter",
		description: "Tells the reporter when a moderator acts on or dismisses their report.",
	},
];

// #endregion

// #region Honeypot

/**
 * The honeypot settings only `/honeypot` in Discord changes: the bot posts,
 * rewrites or takes down the warning in the channel as they change, and checks
 * its permissions there. The dashboard shows them.
 */
export const BotManagedHoneypotSettings = {
	honeypotAction: {
		key: "honeypotAction",
		name: "Honeypot Action",
		description: "What WolfStar does to who writes in the honeypot channel.",
	},
	honeypotChannel: {
		key: "honeypotChannel",
		name: "Honeypot Channel",
		description: "Nobody is caught while it is not set.",
	},
	honeypotWarning: {
		key: "honeypotWarning",
		name: "Honeypot Warning",
		description:
			"Without it the channel says nothing, which is harder for a bot to learn to avoid, and for a member too.",
	},
} as const satisfies {
	[Key in "honeypotAction" | "honeypotChannel" | "honeypotWarning"]: SettingEntry<Key>;
};

export const ConfigurableHoneypotChannels: SettingEntry<SingleSettingKey>[] = [
	{
		key: "honeypotLogChannel",
		name: "Honeypot Catches Channel",
		description:
			"Every member it caught, with what they sent. The case still goes to the moderation logs.",
	},
];

export const ConfigurableHoneypotToggles: SettingEntry<ToggleSettingKey>[] = [
	{
		key: "honeypotDirectMessage",
		name: "Tell Caught Members Why",
		description:
			"Tells the member it caught why, in a direct message. A hacked account that is softbanned can come back once its owner has it again.",
	},
	{
		key: "honeypotRandomName",
		name: "Rename Honeypot Daily",
		description: "The bots cannot avoid the channel by its name.",
	},
	{
		key: "honeypotKeepActive",
		name: "Keep Honeypot Active",
		description:
			"WolfStar sends a message there every day, so the channel does not look abandoned.",
	},
];

// #endregion

// #region Appeals

/** The switch of the appeals, shown as the module's own. */
export const ConfigurableAppealSwitch: SettingEntry<ToggleSettingKey>[] = [
	{
		key: "appealsEnabled",
		name: "Appeals",
		description: "Lets the members appeal their bans, mutes and timeouts.",
	},
];

export const ConfigurableAppealChannels: SettingEntry<SingleSettingKey>[] = [
	{
		key: "appealsChannel",
		name: "Appeals Channel",
		description:
			"Where the moderators accept or deny them. An appeal sent while it is not set never reaches them.",
	},
];

export const ConfigurableAppealToggles: SettingEntry<ToggleSettingKey>[] = [
	{
		key: "appealsBans",
		name: "Appealable Bans",
		description: "Banned members can appeal; they do not need to be in the server.",
	},
	{
		key: "appealsMutes",
		name: "Appealable Mutes",
		description: "Muted members can appeal their mute.",
	},
	{
		key: "appealsTimeouts",
		name: "Appealable Timeouts",
		description: "Members can appeal a timeout while it lasts.",
	},
];

export const ConfigurableAppealQuestions: SettingEntry<ListSettingKey>[] = [
	{
		key: "appealsQuestions",
		name: "Appeal Form Questions",
		description: "One question per field of the form. WolfStar asks the first five.",
	},
];

// #endregion
