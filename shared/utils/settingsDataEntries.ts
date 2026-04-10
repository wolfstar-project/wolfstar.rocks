import type { Channels, Events, Moderation, Roles } from "../types/configurableData";

export const ConfigurableRemoveInitialRole: Roles.Role = {
	key: "rolesRemoveInitial",
	name: "Remove Initial",
	tooltip: "When enabled, claiming a public role automatically removes the initial role.",
};

export const ConfigurableRoles: Roles.Role[] = [
	{
		key: "rolesAdmin",
		name: "Administrator",
		tooltip:
			'The administrator roles. Administrators have access to all moderation and management commands. Defaults to anyone with the "Manage Server" permission.',
	},
	{
		key: "rolesInitial",
		name: "Initial",
		tooltip: "The initial role, if configured, is assigned to users as soon as they join.",
	},
	{
		key: "rolesModerator",
		name: "Moderator",
		tooltip:
			"The moderator roles. Moderators have access to almost all moderation commands. Defaults to anyone who can ban members",
	},
	{
		key: "rolesMuted",
		name: "Muted",
		tooltip:
			"The muted role, if configured, is assigned to muted users. If no muted role is set, you are prompted to create one.",
	},
	{
		key: "rolesRestrictedReaction",
		name: "Restricted Reaction",
		tooltip: "The role that is used for the restrictReaction moderation command.",
	},
	{
		key: "rolesRestrictedEmbed",
		name: "Restricted Embed",
		tooltip: "The role that is used for the restrictEmbed moderation command.",
	},
	{
		key: "rolesRestrictedAttachment",
		name: "Restricted Attachment",
		tooltip: "The role that is used for the restrictAttachment moderation command.",
	},
	{
		key: "rolesRestrictedEmoji",
		name: "Restricted Emoji",
		tooltip: "The role that is used for the restrictEmoji moderation command.",
	},
	{
		key: "rolesRestrictedVoice",
		name: "Restricted Voice",
		tooltip: "The role that is used for the restrictVoice moderation command.",
	},
	{
		key: "rolesPublic",
		name: "Public Roles",
		tooltip: 'The public roles. These can be claimed by any user using the "roles" command.',
	},
];

export const ConfigurableModerationKeys: Moderation.Message[] = [
	{
		description: "Deletes the command message to keep the moderator anonymous.",
		key: "messagesModerationAutoDelete",
		name: "Hide Message",
	},
	{
		description: "Sends the punished member a DM with the reason and duration.",
		key: "messagesModerationDm",
		name: "Message User",
	},
	{
		description: "Posts a confirmation message after a punishment is applied.",
		key: "messagesModerationMessageDisplay",
		name: "Send Punishment Response",
	},
	{
		description: "Includes the reason in the punishment response message.",
		key: "messagesModerationReasonDisplay",
		name: "Show Reason",
	},
	{
		description: "Includes the moderator's name in the DM sent to the punished member.",
		key: "messagesModeratorNameDisplay",
		name: "Show Mod Name",
	},
];

export const ConfigurableModerationEvents: Events.Event[] = [
	{
		description: "An anonymous moderation log is posted when a member is banned.",
		key: "eventsBanAdd",
		title: "Ban Added",
	},
	{
		description: "An anonymous moderation log is posted when a member is unbanned.",
		key: "eventsBanRemove",
		title: "Ban Revoked",
	},
];

export const ConfigurableMessageEvents: Events.Event[] = [
	{
		description:
			"When a member reacts with a Twemoji, the reaction is sent to the Reaction Logs channel.",
		key: "eventsTwemojiReactions",
		title: "Twemoji Reactions",
	},
];

export const ConfigurableLoggingChannels: Channels.Channel[] = [
	{
		description: "Receives a log message when a member joins the server.",
		key: "channelsLogsMemberAdd",
		name: "Member Add Logs",
	},
	{
		description: "Receives a log message when a member leaves, is kicked, or is banned.",
		key: "channelsLogsMemberRemove",
		name: "Member Remove Logs",
	},
	{
		description: "Receives a log message when a member changes their nickname.",
		key: "channelsLogsMemberNicknameUpdate",
		name: "Member Nickname Update Logs",
	},
	{
		description: "Receives a log message when a member changes their username.",
		key: "channelsLogsMemberUsernameUpdate",
		name: "Member Username Update Logs",
	},
	{
		description: "Receives a log message when a member gains or loses a role.",
		key: "channelsLogsMemberRolesUpdate",
		name: "Member Role Logs",
	},
	{
		description: "Receives a log message when a message is deleted.",
		key: "channelsLogsMessageDelete",
		name: "Message Delete Logs",
	},
	{
		description: "Receives a log message when a message from an NSFW channel is deleted.",
		key: "channelsLogsMessageDeleteNsfw",
		name: "NSFW Message Delete Logs",
	},
	{
		description: "Receives a log message when a message is edited.",
		key: "channelsLogsMessageUpdate",
		name: "Message Update Logs",
	},
	{
		description: "Receives a log message when a message from an NSFW channel is edited.",
		key: "channelsLogsMessageUpdateNsfw",
		name: "NSFW Message Update Logs",
	},
	{
		description: "Receives all moderation case logs. Required for moderation events to work.",
		key: "channelsLogsModeration",
		name: "Moderation Logs",
	},
	{
		description: "Receives re-uploaded copies of images posted in the server.",
		key: "channelsLogsImage",
		name: "Image Logs",
	},
	{
		description: "Receives a log message when messages are bulk-deleted (pruned).",
		key: "channelsLogsPrune",
		name: "Prune Logs",
	},
	{
		description: "Receives a log message when a reaction is added to a message.",
		key: "channelsLogsReaction",
		name: "Reaction Logs",
	},
	{
		description: "Receives a log message when a new channel is created.",
		key: "channelsLogsChannelCreate",
		name: "Channel Create Logs",
	},
	{
		description:
			"Receives a log message when any channel is updated, including the changes made.",
		key: "channelsLogsChannelUpdate",
		name: "Channel Update Logs",
	},
	{
		description: "Receives a log message when a channel is deleted.",
		key: "channelsLogsChannelDelete",
		name: "Channel Delete Logs",
	},
	{
		description: "Receives a log message when a new emoji is created.",
		key: "channelsLogsEmojiCreate",
		name: "Emoji Create Logs",
	},
	{
		description: "Receives a log message when an emoji is updated, including the changes made.",
		key: "channelsLogsEmojiUpdate",
		name: "Emoji Update Logs",
	},
	{
		description: "Receives a log message when an emoji is deleted.",
		key: "channelsLogsEmojiDelete",
		name: "Emoji Delete Logs",
	},
	{
		description: "Receives a log message when a new role is created.",
		key: "channelsLogsRoleCreate",
		name: "Role Create Logs",
	},
	{
		description: "Receives a log message when a role is updated, including the changes made.",
		key: "channelsLogsRoleUpdate",
		name: "Role Update Logs",
	},
	{
		description: "Receives a log message when a role is deleted.",
		key: "channelsLogsRoleDelete",
		name: "Role Delete Logs",
	},
	{
		description:
			"Receives a log message when the server settings are updated, including the changes made.",
		key: "channelsLogsServerUpdate",
		name: "Server Update Logs",
	},
];
export const ConfigurableIgnoreChannels: Channels.IgnoreChannel[] = [
	{
		description: "Channels excluded from all types of logging.",
		key: "channelsIgnoreAll",
		name: "All logs",
	},
	{
		description: "Channels excluded from deleted-message logging.",
		key: "channelsIgnoreMessageDelete",
		name: "Message delete logs",
	},
	{
		description: "Channels excluded from edited-message logging.",
		key: "channelsIgnoreMessageEdit",
		name: "Message edit logs",
	},
	{
		description: "Channels excluded from reaction logging.",
		key: "channelsIgnoreReactionAdd",
		name: "Reaction add logs",
	},
	{
		description:
			"Channels excluded from message-delete, message-edit, and reaction-add logging.",
		key: "messagesIgnoreChannels",
		name: "Message Delete, Edit and Reaction Add logs",
	},
];
