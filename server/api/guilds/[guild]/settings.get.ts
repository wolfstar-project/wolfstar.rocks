import { readSettings, serializeSettings } from "#server/database";
import { useLogger } from "evlog";

defineRouteMeta({
	openAPI: {
		description:
			"Retrieves the bot configuration and settings for a specific guild. Requires the user to have management permissions for the guild.",
		operationId: "getGuildSettings",
		parameters: [
			{
				description: "The Discord snowflake ID of the guild",
				in: "path",
				name: "guild",
				required: true,
				schema: { example: "123456789012345678", type: "string" },
			},
			{
				description: "Whether to serialize the settings data for API response (default: false)",
				in: "query",
				name: "shouldSerialize",
				required: false,
				schema: { default: false, type: "boolean" },
			},
		],
		responses: {
			200: {
				content: {
					"application/json": {
						example: {
							channelsLogsMemberAdd: "1148456123727532032",
							channelsLogsModeration: "1148456089539821608",
							disableNaturalPrefix: false,
							disabledCommands: [],
							eventsBanAdd: true,
							eventsBanRemove: true,
							id: "1148456012054360168",
							language: "en-US",
							messagesModerationDm: true,
							messagesModerationReasonDisplay: true,
							noMentionSpamEnabled: true,
							noMentionSpamMentionsAllowed: 10,
							noMentionSpamTimePeriod: 8,
							permissionsRoles: [],
							permissionsUsers: [],
							prefix: "!",
							rolesAdmin: ["1148456187816517632"],
							rolesModerator: ["1148456234285346816"],
							rolesMuted: "1148456278430363648",
							selfmodLinksAllowed: ["discord.com", "github.com"],
							selfmodLinksEnabled: true,
							selfmodLinksSoftAction: 1,
							selfmodLinksThresholdDuration: 60_000,
							selfmodLinksThresholdMaximum: 5,
						},
						schema: {
							description: "Guild model representing the settings and configuration",
							properties: {
								// Base configuration
								id: { description: "Guild snowflake ID (primary key)", type: "string" },
								prefix: { description: "Bot command prefix", type: "string" },
								language: { description: "Guild language locale", type: "string" },
								disableNaturalPrefix: { description: "Disable natural language prefix", type: "boolean" },
								disabledCommands: { description: "List of disabled command names", items: { type: "string" }, type: "array" },

								// Permissions
								permissionsUsers: {
									description: "PermissionNodeEntries - User permission overrides",
									items: { type: "object" },
									type: "array",
								},
								permissionsRoles: {
									description: "PermissionNodeEntries - Role permission overrides",
									items: { type: "object" },
									type: "array",
								},

								// Channel configurations
								channelsMediaOnly: { description: "Channels that only allow media", items: { type: "string" }, type: "array" },
								channelsLogsModeration: { description: "Moderation log channel ID", type: ["string", "null"] },
								channelsLogsImage: { description: "Image log channel ID", type: ["string", "null"] },
								channelsLogsMemberAdd: { description: "Member join log channel ID", type: ["string", "null"] },
								channelsLogsMemberRemove: { description: "Member leave log channel ID", type: ["string", "null"] },
								channelsLogsMemberNicknameUpdate: { description: "Nickname update log channel ID", type: ["string", "null"] },
								channelsLogsMemberUsernameUpdate: { description: "Username update log channel ID", type: ["string", "null"] },
								channelsLogsMemberRolesUpdate: { description: "Role update log channel ID", type: ["string", "null"] },
								channelsLogsMessageDelete: { description: "Message delete log channel ID", type: ["string", "null"] },
								channelsLogsMessageDeleteNsfw: { description: "NSFW message delete log channel ID", type: ["string", "null"] },
								channelsLogsMessageUpdate: { description: "Message edit log channel ID", type: ["string", "null"] },
								channelsLogsMessageUpdateNsfw: { description: "NSFW message edit log channel ID", type: ["string", "null"] },
								channelsLogsPrune: { description: "Prune log channel ID", type: ["string", "null"] },
								channelsLogsReaction: { description: "Reaction log channel ID", type: ["string", "null"] },
								channelsLogsRoleCreate: { description: "Role create log channel ID", type: ["string", "null"] },
								channelsLogsRoleUpdate: { description: "Role update log channel ID", type: ["string", "null"] },
								channelsLogsRoleDelete: { description: "Role delete log channel ID", type: ["string", "null"] },
								channelsLogsChannelCreate: { description: "Channel create log channel ID", type: ["string", "null"] },
								channelsLogsChannelUpdate: { description: "Channel update log channel ID", type: ["string", "null"] },
								channelsLogsChannelDelete: { description: "Channel delete log channel ID", type: ["string", "null"] },
								channelsLogsEmojiCreate: { description: "Emoji create log channel ID", type: ["string", "null"] },
								channelsLogsEmojiUpdate: { description: "Emoji update log channel ID", type: ["string", "null"] },
								channelsLogsEmojiDelete: { description: "Emoji delete log channel ID", type: ["string", "null"] },
								channelsLogsServerUpdate: { description: "Server update log channel ID", type: ["string", "null"] },
								channelsLogsVoiceChannel: { description: "Voice activity log channel ID", type: ["string", "null"] },
								channelsIgnoreAll: { description: "Channels ignored for all logging", items: { type: "string" }, type: "array" },
								channelsIgnoreMessageEdit: {
									description: "Channels ignored for message edit logging",
									items: { type: "string" },
									type: "array",
								},
								channelsIgnoreMessageDelete: {
									description: "Channels ignored for message delete logging",
									items: { type: "string" },
									type: "array",
								},
								channelsIgnoreReactionAdd: {
									description: "Channels ignored for reaction logging",
									items: { type: "string" },
									type: "array",
								},
								channelsIgnoreVoiceActivity: {
									description: "Channels ignored for voice activity logging",
									items: { type: "string" },
									type: "array",
								},

								// Command settings
								commandAutoDelete: {
									description: "CommandAutoDeleteEntries - Auto-delete command responses",
									items: { type: "object" },
									type: "array",
								},
								disabledChannels: { description: "Channels where bot is disabled", items: { type: "string" }, type: "array" },
								disabledCommandsChannels: {
									description: "DisabledCommandChannelEntries - Per-channel disabled commands",
									items: { type: "object" },
									type: "array",
								},

								// Events
								eventsBanAdd: { description: "Log ban add events", type: "boolean" },
								eventsBanRemove: { description: "Log ban remove events", type: "boolean" },
								eventsTwemojiReactions: { description: "Enable twemoji reactions", type: "boolean" },
								eventsUnknownMessages: { description: "Log unknown message events", type: "boolean" },
								eventsIncludeBots: { description: "Include bots in event logging", type: "boolean" },
								eventsTimeout: { description: "Log timeout events", type: "boolean" },

								// Message settings
								messagesIgnoreChannels: {
									description: "Channels ignored for message logging",
									items: { type: "string" },
									type: "array",
								},
								messagesModerationDm: { description: "DM users on moderation action", type: "boolean" },
								messagesModerationReasonDisplay: { description: "Display moderation reason", type: "boolean" },
								messagesModerationMessageDisplay: { description: "Display moderation message", type: "boolean" },
								messagesModerationAutoDelete: { description: "Auto-delete moderation messages", type: "boolean" },
								messagesModeratorNameDisplay: { description: "Display moderator name", type: "boolean" },
								messagesAutoDeleteIgnoredAll: { description: "Ignore all auto-delete", type: "boolean" },
								messagesAutoDeleteIgnoredRoles: {
									description: "Roles ignored for auto-delete",
									items: { type: "string" },
									type: "array",
								},
								messagesAutoDeleteIgnoredChannels: {
									description: "Channels ignored for auto-delete",
									items: { type: "string" },
									type: "array",
								},
								messagesAutoDeleteIgnoredCommands: {
									description: "Commands ignored for auto-delete",
									items: { type: "string" },
									type: "array",
								},

								// Roles
								stickyRoles: {
									description: "StickyRoleEntries - Roles that persist after rejoin",
									items: { type: "object" },
									type: "array",
								},
								reactionRoles: {
									description: "ReactionRoleEntries - Reaction role configurations",
									items: { type: "object" },
									type: "array",
								},
								rolesAdmin: { description: "Admin role IDs", items: { type: "string" }, type: "array" },
								rolesInitial: { description: "Initial role for all members", type: "string" },
								rolesInitialHumans: { description: "Initial role for human members", type: "string" },
								rolesInitialBots: { description: "Initial role for bot members", type: "string" },
								rolesModerator: { description: "Moderator role IDs", items: { type: "string" }, type: "array" },
								rolesMuted: { description: "Muted role ID", type: "string" },
								rolesRestrictedReaction: { description: "Reaction restricted role ID", type: "string" },
								rolesRestrictedEmbed: { description: "Embed restricted role ID", type: "string" },
								rolesRestrictedEmoji: { description: "Emoji restricted role ID", type: "string" },
								rolesRestrictedAttachment: { description: "Attachment restricted role ID", type: "string" },
								rolesRestrictedVoice: { description: "Voice restricted role ID", type: "string" },
								rolesPublic: { description: "Public self-assignable role IDs", items: { type: "string" }, type: "array" },
								rolesRemoveInitial: { description: "Remove initial role when other roles are assigned", type: "boolean" },
								rolesUniqueRoleSets: {
									description: "UniqueRoleSetEntries - Mutually exclusive role sets",
									items: { type: "object" },
									type: "array",
								},

								// Self-moderation: Attachments
								selfmodAttachmentsEnabled: { description: "Enable attachment spam protection", type: "boolean" },
								selfmodAttachmentsIgnoredRoles: {
									description: "Roles ignored for attachment filter",
									items: { type: "string" },
									type: "array",
								},
								selfmodAttachmentsIgnoredChannels: {
									description: "Channels ignored for attachment filter",
									items: { type: "string" },
									type: "array",
								},
								selfmodAttachmentsSoftAction: { description: "Soft action for attachments (bitmask)", type: "integer" },
								selfmodAttachmentsHardAction: { description: "Hard action for attachments (bitmask)", type: "integer" },
								selfmodAttachmentsHardActionDuration: { description: "Duration for hard action in ms", type: "integer" },
								selfmodAttachmentsThresholdMaximum: { description: "Maximum attachments before action", type: "integer" },
								selfmodAttachmentsThresholdDuration: { description: "Time window for threshold in ms", type: "integer" },

								// Self-moderation: Capitals
								selfmodCapitalsEnabled: { description: "Enable capitals spam protection", type: "boolean" },
								selfmodCapitalsIgnoredRoles: {
									description: "Roles ignored for capitals filter",
									items: { type: "string" },
									type: "array",
								},
								selfmodCapitalsIgnoredChannels: {
									description: "Channels ignored for capitals filter",
									items: { type: "string" },
									type: "array",
								},
								selfmodCapitalsMinimum: { description: "Minimum message length to check", type: "integer" },
								selfmodCapitalsMaximum: { description: "Maximum percentage of capitals allowed", type: "integer" },
								selfmodCapitalsSoftAction: { description: "Soft action for capitals (bitmask)", type: "integer" },
								selfmodCapitalsHardAction: { description: "Hard action for capitals (bitmask)", type: "integer" },
								selfmodCapitalsHardActionDuration: { description: "Duration for hard action in ms", type: "integer" },
								selfmodCapitalsThresholdMaximum: { description: "Maximum violations before action", type: "integer" },
								selfmodCapitalsThresholdDuration: { description: "Time window for threshold in ms", type: "integer" },

								// Self-moderation: Links
								selfmodLinksEnabled: { description: "Enable link spam protection", type: "boolean" },
								selfmodLinksAllowed: { description: "Allowed link domains", items: { type: "string" }, type: "array" },
								selfmodLinksIgnoredRoles: { description: "Roles ignored for link filter", items: { type: "string" }, type: "array" },
								selfmodLinksIgnoredChannels: {
									description: "Channels ignored for link filter",
									items: { type: "string" },
									type: "array",
								},
								selfmodLinksSoftAction: { description: "Soft action for links (bitmask)", type: "integer" },
								selfmodLinksHardAction: { description: "Hard action for links (bitmask)", type: "integer" },
								selfmodLinksHardActionDuration: { description: "Duration for hard action in ms", type: "integer" },
								selfmodLinksThresholdMaximum: { description: "Maximum links before action", type: "integer" },
								selfmodLinksThresholdDuration: { description: "Time window for threshold in ms", type: "integer" },

								// Self-moderation: Messages (duplicate detection)
								selfmodMessagesEnabled: { description: "Enable duplicate message protection", type: "boolean" },
								selfmodMessagesIgnoredRoles: {
									description: "Roles ignored for message filter",
									items: { type: "string" },
									type: "array",
								},
								selfmodMessagesIgnoredChannels: {
									description: "Channels ignored for message filter",
									items: { type: "string" },
									type: "array",
								},
								selfmodMessagesMaximum: { description: "Maximum duplicate messages allowed", type: "integer" },
								selfmodMessagesQueueSize: { description: "Message queue size for comparison", type: "integer" },
								selfmodMessagesSoftAction: { description: "Soft action for duplicates (bitmask)", type: "integer" },
								selfmodMessagesHardAction: { description: "Hard action for duplicates (bitmask)", type: "integer" },
								selfmodMessagesHardActionDuration: { description: "Duration for hard action in ms", type: "integer" },
								selfmodMessagesThresholdMaximum: { description: "Maximum violations before action", type: "integer" },
								selfmodMessagesThresholdDuration: { description: "Time window for threshold in ms", type: "integer" },

								// Self-moderation: Newlines
								selfmodNewlinesEnabled: { description: "Enable newline spam protection", type: "boolean" },
								selfmodNewlinesIgnoredRoles: {
									description: "Roles ignored for newline filter",
									items: { type: "string" },
									type: "array",
								},
								selfmodNewlinesIgnoredChannels: {
									description: "Channels ignored for newline filter",
									items: { type: "string" },
									type: "array",
								},
								selfmodNewlinesMaximum: { description: "Maximum newlines allowed per message", type: "integer" },
								selfmodNewlinesSoftAction: { description: "Soft action for newlines (bitmask)", type: "integer" },
								selfmodNewlinesHardAction: { description: "Hard action for newlines (bitmask)", type: "integer" },
								selfmodNewlinesHardActionDuration: { description: "Duration for hard action in ms", type: "integer" },
								selfmodNewlinesThresholdMaximum: { description: "Maximum violations before action", type: "integer" },
								selfmodNewlinesThresholdDuration: { description: "Time window for threshold in ms", type: "integer" },

								// Self-moderation: Invites
								selfmodInvitesEnabled: { description: "Enable invite link protection", type: "boolean" },
								selfmodInvitesIgnoredCodes: { description: "Allowed invite codes", items: { type: "string" }, type: "array" },
								selfmodInvitesIgnoredGuilds: {
									description: "Allowed guild IDs for invites",
									items: { type: "string" },
									type: "array",
								},
								selfmodInvitesIgnoredRoles: {
									description: "Roles ignored for invite filter",
									items: { type: "string" },
									type: "array",
								},
								selfmodInvitesIgnoredChannels: {
									description: "Channels ignored for invite filter",
									items: { type: "string" },
									type: "array",
								},
								selfmodInvitesSoftAction: { description: "Soft action for invites (bitmask)", type: "integer" },
								selfmodInvitesHardAction: { description: "Hard action for invites (bitmask)", type: "integer" },
								selfmodInvitesHardActionDuration: { description: "Duration for hard action in ms", type: "integer" },
								selfmodInvitesThresholdMaximum: { description: "Maximum invites before action", type: "integer" },
								selfmodInvitesThresholdDuration: { description: "Time window for threshold in ms", type: "integer" },

								// Self-moderation: Word Filter
								selfmodFilterEnabled: { description: "Enable word filter protection", type: "boolean" },
								selfmodFilterRaw: { description: "Filtered words list", items: { type: "string" }, type: "array" },
								selfmodFilterIgnoredRoles: { description: "Roles ignored for word filter", items: { type: "string" }, type: "array" },
								selfmodFilterIgnoredChannels: {
									description: "Channels ignored for word filter",
									items: { type: "string" },
									type: "array",
								},
								selfmodFilterSoftAction: { description: "Soft action for filter (bitmask)", type: "integer" },
								selfmodFilterHardAction: { description: "Hard action for filter (bitmask)", type: "integer" },
								selfmodFilterHardActionDuration: { description: "Duration for hard action in ms", type: "integer" },
								selfmodFilterThresholdMaximum: { description: "Maximum filter hits before action", type: "integer" },
								selfmodFilterThresholdDuration: { description: "Time window for threshold in ms", type: "integer" },

								// Self-moderation: Reactions
								selfmodReactionsEnabled: { description: "Enable reaction spam protection", type: "boolean" },
								selfmodReactionsIgnoredRoles: {
									description: "Roles ignored for reaction filter",
									items: { type: "string" },
									type: "array",
								},
								selfmodReactionsIgnoredChannels: {
									description: "Channels ignored for reaction filter",
									items: { type: "string" },
									type: "array",
								},
								selfmodReactionsMaximum: { description: "Maximum reactions per message", type: "integer" },
								selfmodReactionsAllowed: { description: "Allowed reaction emojis", items: { type: "string" }, type: "array" },
								selfmodReactionsBlocked: { description: "Blocked reaction emojis", items: { type: "string" }, type: "array" },
								selfmodReactionsSoftAction: { description: "Soft action for reactions (bitmask)", type: "integer" },
								selfmodReactionsHardAction: { description: "Hard action for reactions (bitmask)", type: "integer" },
								selfmodReactionsHardActionDuration: { description: "Duration for hard action in ms", type: "integer" },
								selfmodReactionsThresholdMaximum: { description: "Maximum violations before action", type: "integer" },
								selfmodReactionsThresholdDuration: { description: "Time window for threshold in ms", type: "integer" },

								// Self-moderation: Global settings
								selfmodIgnoredChannels: { description: "Channels ignored for all selfmod", items: { type: "string" }, type: "array" },

								// No-mention spam
								noMentionSpamEnabled: { description: "Enable mention spam protection", type: "boolean" },
								noMentionSpamAlerts: { description: "Send alerts for mention spam", type: "boolean" },
								noMentionSpamMentionsAllowed: { description: "Maximum mentions allowed", type: "integer" },
								noMentionSpamTimePeriod: { description: "Time period for mention limit in seconds", type: "integer" },
							},
							type: "object",
						},
					},
				},
				description: "Guild settings retrieved successfully",
			},
			401: { description: "Authentication required" },
			403: { description: "Insufficient permissions to access this guild" },
			404: { description: "Guild not found or bot is not in the guild" },
			429: { description: "Rate limit exceeded" },
			500: { description: "Failed to fetch guild settings" },
		},
		security: [{ discordOAuth: ["identify", "guilds"] }],
		summary: "Get guild settings",
		tags: ["General"],
	},
});

export default defineWrappedResponseHandler(
	async (event) => {
		const log = useLogger(event);

		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const guild = await getGuild(guildId);

		const member = await getCurrentMember(event, guild.id);
		log.set({ member: { id: member.user.id } });
		await canManage(guild, member);

		const settings = await readSettings(guild.id);
		return serializeSettings(settings);
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
