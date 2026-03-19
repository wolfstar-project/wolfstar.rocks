import type { Channels, Events, Moderation, Roles } from "../types/configurableData";

export const ConfigurableRemoveInitialRole: Roles.Role = {
	key: "rolesRemoveInitial",
	name: "Remove Initial",
	tooltip: "Whether claiming a public role should remove the initial role at the same time.",
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
		tooltip: "The initial role, if configured, I will give it to users as soon as they join.",
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
			"The muted role, if configured, I will give new muted users this role. Otherwise I will prompt you the creation of one.",
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
		description: "Will delete your message to hide the mod.",
		key: "messagesModerationAutoDelete",
		name: "Hide Message",
	},
	{
		description: "DM's the punished person with the reason/duration.",
		key: "messagesModerationDm",
		name: "Message User",
	},
	{
		description: "Responds to the punishment command.",
		key: "messagesModerationMessageDisplay",
		name: "Send Punishment Response",
	},
	{
		description: "Whether to show the reason in the response.",
		key: "messagesModerationReasonDisplay",
		name: "Show Reason",
	},
	{
		description: "Whether to show the moderators name in the DM.",
		key: "messagesModeratorNameDisplay",
		name: "Show Mod Name",
	},
];

export const ConfigurableModerationEvents: Events.Event[] = [
	{
		description: "This event posts anonymous moderation logs when a user gets banned.",
		key: "eventsBanAdd",
		title: "Ban Added",
	},
	{
		description: "This event posts anonymous moderation logs when a user gets unbanned",
		key: "eventsBanRemove",
		title: "Ban Revoked",
	},
];

export const ConfigurableMessageEvents: Events.Event[] = [
	{
		description:
			"This event posts messages whenever a member reacts to a message with a twemoji, they will be send to the Reaction Logs channel",
		key: "eventsTwemojiReactions",
		title: "Twemoji Reactions",
	},
];

export const ConfigurableLoggingChannels: Channels.Channel[] = [
	{
		description: "The channel I will send a message to when a member joins.",
		key: "channelsLogsMemberAdd",
		name: "Member Add Logs",
	},
	{
		description:
			"The channel I will send a message to when a member leaves, is kicked, or is banned.",
		key: "channelsLogsMemberRemove",
		name: "Member Remove Logs",
	},
	{
		description: "The channel I will send a message to when a member changes their nickname.",
		key: "channelsLogsMemberNicknameUpdate",
		name: "Member Nickname Update Logs",
	},
	{
		description: "The channel I will send a message to when a member changes their username.",
		key: "channelsLogsMemberUsernameUpdate",
		name: "Member Username Update Logs",
	},
	{
		description: "The channel I will send a message to when a member gets or loses a role.",
		key: "channelsLogsMemberRolesUpdate",
		name: "Member Role Logs",
	},
	{
		description: "The channel I will send a message to when a message has been deleted.",
		key: "channelsLogsMessageDelete",
		name: "Message Delete Logs",
	},
	{
		description:
			"The channel I will send a message to when a message from an NSFW channel has been deleted.",
		key: "channelsLogsMessageDeleteNsfw",
		name: "NSFW Message Delete Logs",
	},
	{
		description: "The channel I will send a message to when a message has been updated.",
		key: "channelsLogsMessageUpdate",
		name: "Message Update Logs",
	},
	{
		description:
			"The channel I will send a message to when a message from an NSFW channel has been updated.",
		key: "channelsLogsMessageUpdateNsfw",
		name: "NSFW Message Update Logs",
	},
	{
		description:
			"The channel for moderation logs, once enabled, I will post all my moderation cases there.",
		key: "channelsLogsModeration",
		name: "Moderation Logs",
	},
	{
		description: "The channel I will use to re-upload all images I see.",
		key: "channelsLogsImage",
		name: "Image Logs",
	},
	{
		description:
			"The channel for prune logs, same requirement as normal message logs, but will only send prune messages.",
		key: "channelsLogsPrune",
		name: "Prune Logs",
	},
	{
		description:
			"The channel for the reaction logs, same requirement as normal message logs, but will only send message reactions",
		key: "channelsLogsReaction",
		name: "Reaction Logs",
	},
	{
		description:
			"The channel for channel creation logs, if set, I will send a message when another channel is created.",
		key: "channelsLogsChannelCreate",
		name: "Channel Create Logs",
	},
	{
		description:
			"The channel for channel update logs, if set, I will send a message to this channel when any channel (including this one) gets updated in any way. This message will contain the changes made to the channel.",
		key: "channelsLogsChannelUpdate",
		name: "Channel Update Logs",
	},
	{
		description:
			"The channel for channel deletion logs, if set, I will send a message to this channel when another channel is deleted.",
		key: "channelsLogsChannelDelete",
		name: "Channel Delete Logs",
	},
	{
		description:
			"The channel for emoji creation logs, if set, I will send a message when an emoji has been created.",
		key: "channelsLogsEmojiCreate",
		name: "Emoji Create Logs",
	},
	{
		description:
			"The channel for emoji update logs, if set, I send a message when an emoji is updated in any way. This message will contain the changes made to the emoji.",
		key: "channelsLogsEmojiUpdate",
		name: "Emoji Update Logs",
	},
	{
		description:
			"The channel for emoji deletion logs, if set, I will send a message when an emoji is deleted.",
		key: "channelsLogsEmojiDelete",
		name: "Emoji Delete Logs",
	},
	{
		description:
			"The channel for role creation logs, if set, I send a message when a new role is craeted.",
		key: "channelsLogsRoleCreate",
		name: "Role Create Logs",
	},
	{
		description:
			"The channel for role update logs, if set, I send a message when a role is updated in any way. This message will contain the changes made to the role.",
		key: "channelsLogsRoleUpdate",
		name: "Role Update Logs",
	},
	{
		description:
			"The channel for role deletion logs, if set, I send a message when a role is deleted.",
		key: "channelsLogsRoleDelete",
		name: "Role Delete Logs",
	},
	{
		description:
			"The channel for server update logs, if set, I send a message when the server is updated in any way. This message will contain the changes made to the server.",
		key: "channelsLogsServerUpdate",
		name: "Server Update Logs",
	},
];
export const ConfigurableIgnoreChannels: Channels.IgnoreChannel[] = [
	{
		description: "Channels I should ignore for all types of logging.",
		key: "channelsIgnoreAll",
		name: "All logs",
	},
	{
		description: "Channels I should ignore when checking for deleted messages to log.",
		key: "channelsIgnoreMessageDelete",
		name: "Message delete logs",
	},
	{
		description: "Channels I should ignore when checking for edited messages to log.",
		key: "channelsIgnoreMessageEdit",
		name: "Message edit logs",
	},
	{
		description: "Channels I should ignore when checking for added reactions.",
		key: "channelsIgnoreReactionAdd",
		name: "Reaction add logs",
	},
	{
		description:
			"Channels I should ignore for all three of deleted messages to log, checking for editing messages to log, and checking for added reactions.",
		key: "messagesIgnoreChannels",
		name: "Message Delete, Edit and Reaction Add logs",
	},
];
