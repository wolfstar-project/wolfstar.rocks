import { manageAbility } from "#shared/utils/abilities";
import { readSettings, serializeSettings } from "~~/server/database";

defineRouteMeta({
  openAPI: {
    tags: ["General"],
    summary: "Get guild settings",
    description: "Retrieves the bot configuration and settings for a specific guild. Requires the user to have management permissions for the guild.",
    operationId: "getGuildSettings",
    parameters: [
      {
        in: "path",
        name: "guild",
        required: true,
        description: "The Discord snowflake ID of the guild",
        schema: { type: "string", example: "123456789012345678" },
      },
      {
        in: "query",
        name: "shouldSerialize",
        required: false,
        description: "Whether to serialize the settings data for API response (default: false)",
        schema: { type: "boolean", default: false },
      },
    ],
    responses: {
      200: {
        description: "Guild settings retrieved successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              description: "Guild model representing the settings and configuration",
              properties: {
                // Base configuration
                id: { type: "string", description: "Guild snowflake ID (primary key)" },
                prefix: { type: "string", description: "Bot command prefix" },
                language: { type: "string", description: "Guild language locale" },
                disableNaturalPrefix: { type: "boolean", description: "Disable natural language prefix" },
                disabledCommands: { type: "array", items: { type: "string" }, description: "List of disabled command names" },

                // Permissions
                permissionsUsers: { type: "array", description: "PermissionNodeEntries - User permission overrides", items: { type: "object" } },
                permissionsRoles: { type: "array", description: "PermissionNodeEntries - Role permission overrides", items: { type: "object" } },

                // Channel configurations
                channelsMediaOnly: { type: "array", items: { type: "string" }, description: "Channels that only allow media" },
                channelsLogsModeration: { type: ["string", "null"], description: "Moderation log channel ID" },
                channelsLogsImage: { type: ["string", "null"], description: "Image log channel ID" },
                channelsLogsMemberAdd: { type: ["string", "null"], description: "Member join log channel ID" },
                channelsLogsMemberRemove: { type: ["string", "null"], description: "Member leave log channel ID" },
                channelsLogsMemberNicknameUpdate: { type: ["string", "null"], description: "Nickname update log channel ID" },
                channelsLogsMemberUsernameUpdate: { type: ["string", "null"], description: "Username update log channel ID" },
                channelsLogsMemberRolesUpdate: { type: ["string", "null"], description: "Role update log channel ID" },
                channelsLogsMessageDelete: { type: ["string", "null"], description: "Message delete log channel ID" },
                channelsLogsMessageDeleteNsfw: { type: ["string", "null"], description: "NSFW message delete log channel ID" },
                channelsLogsMessageUpdate: { type: ["string", "null"], description: "Message edit log channel ID" },
                channelsLogsMessageUpdateNsfw: { type: ["string", "null"], description: "NSFW message edit log channel ID" },
                channelsLogsPrune: { type: ["string", "null"], description: "Prune log channel ID" },
                channelsLogsReaction: { type: ["string", "null"], description: "Reaction log channel ID" },
                channelsLogsRoleCreate: { type: ["string", "null"], description: "Role create log channel ID" },
                channelsLogsRoleUpdate: { type: ["string", "null"], description: "Role update log channel ID" },
                channelsLogsRoleDelete: { type: ["string", "null"], description: "Role delete log channel ID" },
                channelsLogsChannelCreate: { type: ["string", "null"], description: "Channel create log channel ID" },
                channelsLogsChannelUpdate: { type: ["string", "null"], description: "Channel update log channel ID" },
                channelsLogsChannelDelete: { type: ["string", "null"], description: "Channel delete log channel ID" },
                channelsLogsEmojiCreate: { type: ["string", "null"], description: "Emoji create log channel ID" },
                channelsLogsEmojiUpdate: { type: ["string", "null"], description: "Emoji update log channel ID" },
                channelsLogsEmojiDelete: { type: ["string", "null"], description: "Emoji delete log channel ID" },
                channelsLogsServerUpdate: { type: ["string", "null"], description: "Server update log channel ID" },
                channelsLogsVoiceChannel: { type: ["string", "null"], description: "Voice activity log channel ID" },
                channelsIgnoreAll: { type: "array", items: { type: "string" }, description: "Channels ignored for all logging" },
                channelsIgnoreMessageEdit: { type: "array", items: { type: "string" }, description: "Channels ignored for message edit logging" },
                channelsIgnoreMessageDelete: { type: "array", items: { type: "string" }, description: "Channels ignored for message delete logging" },
                channelsIgnoreReactionAdd: { type: "array", items: { type: "string" }, description: "Channels ignored for reaction logging" },
                channelsIgnoreVoiceActivity: { type: "array", items: { type: "string" }, description: "Channels ignored for voice activity logging" },

                // Command settings
                commandAutoDelete: { type: "array", description: "CommandAutoDeleteEntries - Auto-delete command responses", items: { type: "object" } },
                disabledChannels: { type: "array", items: { type: "string" }, description: "Channels where bot is disabled" },
                disabledCommandsChannels: { type: "array", description: "DisabledCommandChannelEntries - Per-channel disabled commands", items: { type: "object" } },

                // Events
                eventsBanAdd: { type: "boolean", description: "Log ban add events" },
                eventsBanRemove: { type: "boolean", description: "Log ban remove events" },
                eventsTwemojiReactions: { type: "boolean", description: "Enable twemoji reactions" },
                eventsUnknownMessages: { type: "boolean", description: "Log unknown message events" },
                eventsIncludeBots: { type: "boolean", description: "Include bots in event logging" },
                eventsTimeout: { type: "boolean", description: "Log timeout events" },

                // Message settings
                messagesIgnoreChannels: { type: "array", items: { type: "string" }, description: "Channels ignored for message logging" },
                messagesModerationDm: { type: "boolean", description: "DM users on moderation action" },
                messagesModerationReasonDisplay: { type: "boolean", description: "Display moderation reason" },
                messagesModerationMessageDisplay: { type: "boolean", description: "Display moderation message" },
                messagesModerationAutoDelete: { type: "boolean", description: "Auto-delete moderation messages" },
                messagesModeratorNameDisplay: { type: "boolean", description: "Display moderator name" },
                messagesAutoDeleteIgnoredAll: { type: "boolean", description: "Ignore all auto-delete" },
                messagesAutoDeleteIgnoredRoles: { type: "array", items: { type: "string" }, description: "Roles ignored for auto-delete" },
                messagesAutoDeleteIgnoredChannels: { type: "array", items: { type: "string" }, description: "Channels ignored for auto-delete" },
                messagesAutoDeleteIgnoredCommands: { type: "array", items: { type: "string" }, description: "Commands ignored for auto-delete" },

                // Roles
                stickyRoles: { type: "array", description: "StickyRoleEntries - Roles that persist after rejoin", items: { type: "object" } },
                reactionRoles: { type: "array", description: "ReactionRoleEntries - Reaction role configurations", items: { type: "object" } },
                rolesAdmin: { type: "array", items: { type: "string" }, description: "Admin role IDs" },
                rolesInitial: { type: "string", description: "Initial role for all members" },
                rolesInitialHumans: { type: "string", description: "Initial role for human members" },
                rolesInitialBots: { type: "string", description: "Initial role for bot members" },
                rolesModerator: { type: "array", items: { type: "string" }, description: "Moderator role IDs" },
                rolesMuted: { type: "string", description: "Muted role ID" },
                rolesRestrictedReaction: { type: "string", description: "Reaction restricted role ID" },
                rolesRestrictedEmbed: { type: "string", description: "Embed restricted role ID" },
                rolesRestrictedEmoji: { type: "string", description: "Emoji restricted role ID" },
                rolesRestrictedAttachment: { type: "string", description: "Attachment restricted role ID" },
                rolesRestrictedVoice: { type: "string", description: "Voice restricted role ID" },
                rolesPublic: { type: "array", items: { type: "string" }, description: "Public self-assignable role IDs" },
                rolesRemoveInitial: { type: "boolean", description: "Remove initial role when other roles are assigned" },
                rolesUniqueRoleSets: { type: "array", description: "UniqueRoleSetEntries - Mutually exclusive role sets", items: { type: "object" } },

                // Self-moderation: Attachments
                selfmodAttachmentsEnabled: { type: "boolean", description: "Enable attachment spam protection" },
                selfmodAttachmentsIgnoredRoles: { type: "array", items: { type: "string" }, description: "Roles ignored for attachment filter" },
                selfmodAttachmentsIgnoredChannels: { type: "array", items: { type: "string" }, description: "Channels ignored for attachment filter" },
                selfmodAttachmentsSoftAction: { type: "integer", description: "Soft action for attachments (bitmask)" },
                selfmodAttachmentsHardAction: { type: "integer", description: "Hard action for attachments (bitmask)" },
                selfmodAttachmentsHardActionDuration: { type: "integer", description: "Duration for hard action in ms" },
                selfmodAttachmentsThresholdMaximum: { type: "integer", description: "Maximum attachments before action" },
                selfmodAttachmentsThresholdDuration: { type: "integer", description: "Time window for threshold in ms" },

                // Self-moderation: Capitals
                selfmodCapitalsEnabled: { type: "boolean", description: "Enable capitals spam protection" },
                selfmodCapitalsIgnoredRoles: { type: "array", items: { type: "string" }, description: "Roles ignored for capitals filter" },
                selfmodCapitalsIgnoredChannels: { type: "array", items: { type: "string" }, description: "Channels ignored for capitals filter" },
                selfmodCapitalsMinimum: { type: "integer", description: "Minimum message length to check" },
                selfmodCapitalsMaximum: { type: "integer", description: "Maximum percentage of capitals allowed" },
                selfmodCapitalsSoftAction: { type: "integer", description: "Soft action for capitals (bitmask)" },
                selfmodCapitalsHardAction: { type: "integer", description: "Hard action for capitals (bitmask)" },
                selfmodCapitalsHardActionDuration: { type: "integer", description: "Duration for hard action in ms" },
                selfmodCapitalsThresholdMaximum: { type: "integer", description: "Maximum violations before action" },
                selfmodCapitalsThresholdDuration: { type: "integer", description: "Time window for threshold in ms" },

                // Self-moderation: Links
                selfmodLinksEnabled: { type: "boolean", description: "Enable link spam protection" },
                selfmodLinksAllowed: { type: "array", items: { type: "string" }, description: "Allowed link domains" },
                selfmodLinksIgnoredRoles: { type: "array", items: { type: "string" }, description: "Roles ignored for link filter" },
                selfmodLinksIgnoredChannels: { type: "array", items: { type: "string" }, description: "Channels ignored for link filter" },
                selfmodLinksSoftAction: { type: "integer", description: "Soft action for links (bitmask)" },
                selfmodLinksHardAction: { type: "integer", description: "Hard action for links (bitmask)" },
                selfmodLinksHardActionDuration: { type: "integer", description: "Duration for hard action in ms" },
                selfmodLinksThresholdMaximum: { type: "integer", description: "Maximum links before action" },
                selfmodLinksThresholdDuration: { type: "integer", description: "Time window for threshold in ms" },

                // Self-moderation: Messages (duplicate detection)
                selfmodMessagesEnabled: { type: "boolean", description: "Enable duplicate message protection" },
                selfmodMessagesIgnoredRoles: { type: "array", items: { type: "string" }, description: "Roles ignored for message filter" },
                selfmodMessagesIgnoredChannels: { type: "array", items: { type: "string" }, description: "Channels ignored for message filter" },
                selfmodMessagesMaximum: { type: "integer", description: "Maximum duplicate messages allowed" },
                selfmodMessagesQueueSize: { type: "integer", description: "Message queue size for comparison" },
                selfmodMessagesSoftAction: { type: "integer", description: "Soft action for duplicates (bitmask)" },
                selfmodMessagesHardAction: { type: "integer", description: "Hard action for duplicates (bitmask)" },
                selfmodMessagesHardActionDuration: { type: "integer", description: "Duration for hard action in ms" },
                selfmodMessagesThresholdMaximum: { type: "integer", description: "Maximum violations before action" },
                selfmodMessagesThresholdDuration: { type: "integer", description: "Time window for threshold in ms" },

                // Self-moderation: Newlines
                selfmodNewlinesEnabled: { type: "boolean", description: "Enable newline spam protection" },
                selfmodNewlinesIgnoredRoles: { type: "array", items: { type: "string" }, description: "Roles ignored for newline filter" },
                selfmodNewlinesIgnoredChannels: { type: "array", items: { type: "string" }, description: "Channels ignored for newline filter" },
                selfmodNewlinesMaximum: { type: "integer", description: "Maximum newlines allowed per message" },
                selfmodNewlinesSoftAction: { type: "integer", description: "Soft action for newlines (bitmask)" },
                selfmodNewlinesHardAction: { type: "integer", description: "Hard action for newlines (bitmask)" },
                selfmodNewlinesHardActionDuration: { type: "integer", description: "Duration for hard action in ms" },
                selfmodNewlinesThresholdMaximum: { type: "integer", description: "Maximum violations before action" },
                selfmodNewlinesThresholdDuration: { type: "integer", description: "Time window for threshold in ms" },

                // Self-moderation: Invites
                selfmodInvitesEnabled: { type: "boolean", description: "Enable invite link protection" },
                selfmodInvitesIgnoredCodes: { type: "array", items: { type: "string" }, description: "Allowed invite codes" },
                selfmodInvitesIgnoredGuilds: { type: "array", items: { type: "string" }, description: "Allowed guild IDs for invites" },
                selfmodInvitesIgnoredRoles: { type: "array", items: { type: "string" }, description: "Roles ignored for invite filter" },
                selfmodInvitesIgnoredChannels: { type: "array", items: { type: "string" }, description: "Channels ignored for invite filter" },
                selfmodInvitesSoftAction: { type: "integer", description: "Soft action for invites (bitmask)" },
                selfmodInvitesHardAction: { type: "integer", description: "Hard action for invites (bitmask)" },
                selfmodInvitesHardActionDuration: { type: "integer", description: "Duration for hard action in ms" },
                selfmodInvitesThresholdMaximum: { type: "integer", description: "Maximum invites before action" },
                selfmodInvitesThresholdDuration: { type: "integer", description: "Time window for threshold in ms" },

                // Self-moderation: Word Filter
                selfmodFilterEnabled: { type: "boolean", description: "Enable word filter protection" },
                selfmodFilterRaw: { type: "array", items: { type: "string" }, description: "Filtered words list" },
                selfmodFilterIgnoredRoles: { type: "array", items: { type: "string" }, description: "Roles ignored for word filter" },
                selfmodFilterIgnoredChannels: { type: "array", items: { type: "string" }, description: "Channels ignored for word filter" },
                selfmodFilterSoftAction: { type: "integer", description: "Soft action for filter (bitmask)" },
                selfmodFilterHardAction: { type: "integer", description: "Hard action for filter (bitmask)" },
                selfmodFilterHardActionDuration: { type: "integer", description: "Duration for hard action in ms" },
                selfmodFilterThresholdMaximum: { type: "integer", description: "Maximum filter hits before action" },
                selfmodFilterThresholdDuration: { type: "integer", description: "Time window for threshold in ms" },

                // Self-moderation: Reactions
                selfmodReactionsEnabled: { type: "boolean", description: "Enable reaction spam protection" },
                selfmodReactionsIgnoredRoles: { type: "array", items: { type: "string" }, description: "Roles ignored for reaction filter" },
                selfmodReactionsIgnoredChannels: { type: "array", items: { type: "string" }, description: "Channels ignored for reaction filter" },
                selfmodReactionsMaximum: { type: "integer", description: "Maximum reactions per message" },
                selfmodReactionsAllowed: { type: "array", items: { type: "string" }, description: "Allowed reaction emojis" },
                selfmodReactionsBlocked: { type: "array", items: { type: "string" }, description: "Blocked reaction emojis" },
                selfmodReactionsSoftAction: { type: "integer", description: "Soft action for reactions (bitmask)" },
                selfmodReactionsHardAction: { type: "integer", description: "Hard action for reactions (bitmask)" },
                selfmodReactionsHardActionDuration: { type: "integer", description: "Duration for hard action in ms" },
                selfmodReactionsThresholdMaximum: { type: "integer", description: "Maximum violations before action" },
                selfmodReactionsThresholdDuration: { type: "integer", description: "Time window for threshold in ms" },

                // Self-moderation: Global settings
                selfmodIgnoredChannels: { type: "array", items: { type: "string" }, description: "Channels ignored for all selfmod" },

                // No-mention spam
                noMentionSpamEnabled: { type: "boolean", description: "Enable mention spam protection" },
                noMentionSpamAlerts: { type: "boolean", description: "Send alerts for mention spam" },
                noMentionSpamMentionsAllowed: { type: "integer", description: "Maximum mentions allowed" },
                noMentionSpamTimePeriod: { type: "integer", description: "Time period for mention limit in seconds" },
              },
            },
            example: {
              id: "1148456012054360168",
              prefix: "!",
              language: "en-US",
              disableNaturalPrefix: false,
              disabledCommands: [],
              permissionsUsers: [],
              permissionsRoles: [],
              channelsLogsModeration: "1148456089539821608",
              channelsLogsMemberAdd: "1148456123727532032",
              eventsBanAdd: true,
              eventsBanRemove: true,
              messagesModerationDm: true,
              messagesModerationReasonDisplay: true,
              rolesAdmin: ["1148456187816517632"],
              rolesModerator: ["1148456234285346816"],
              rolesMuted: "1148456278430363648",
              selfmodLinksEnabled: true,
              selfmodLinksAllowed: ["discord.com", "github.com"],
              selfmodLinksSoftAction: 1,
              selfmodLinksThresholdMaximum: 5,
              selfmodLinksThresholdDuration: 60000,
              noMentionSpamEnabled: true,
              noMentionSpamMentionsAllowed: 10,
              noMentionSpamTimePeriod: 8,
            },
          },
        },
      },
      401: { description: "Authentication required" },
      403: { description: "Insufficient permissions to access this guild" },
      404: { description: "Guild not found or bot is not in the guild" },
      429: { description: "Rate limit exceeded" },
      500: { description: "Failed to fetch guild settings" },
    },
    security: [{ discordOAuth: ["identify", "guilds"] }],
  },
});

export default defineWrappedResponseHandler(
  async (event) => {
    // Get guild ID from params
    const guildId = getGuildParam(event);

    const { user } = await getCurrentUser(event);

    const guild = await getGuild(guildId);

    // Check permissions
    if (await denies(event, manageAbility, guild)) {
      throw createError({
        status: 403,
        message: "Insufficient permissions",
        data: {
          error: "insufficient_permissions",
          message: "Insufficient permissions",
          details: {
            guild: guild.id,
            member: user.id,
          },
        },
      });
    }

    // Read and return settings
    const settings = await readSettings(guild.id);
    return serializeSettings(settings);
  },
  {
    auth: true,
    rateLimit: { enabled: true, window: seconds(5), limit: 2 },
    onSuccess(logger) {
      logger.info(`Successfully retrieved settings`);
    },
    onError(logger, error) {
      logger.error("Failed to retrieve settings:", error);
    },
  },
);
