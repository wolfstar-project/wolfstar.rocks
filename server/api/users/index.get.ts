defineRouteMeta({
  openAPI: {
    tags: ["Discord API"],
    summary: "Get current user and guilds",
    description: "Retrieves the currently authenticated user's profile and a list of guilds they are a member of. Returns TransformedLoginData with user info, raw Discord guilds, and transformed guilds with bot-specific information.",
    operationId: "getCurrentUserAndGuilds",
    responses: {
      200: {
        description: "TransformedLoginData - User profile with guild information",
        content: {
          "application/json": {
            schema: {
              type: "object",
              description: "TransformedLoginData from shared/types/discord.d.ts",
              properties: {
                user: {
                  type: "object",
                  nullable: true,
                  description: "RESTGetAPICurrentUserResult - The authenticated Discord user",
                  properties: {
                    id: { type: "string", description: "User's Discord snowflake ID", example: "123456789012345678" },
                    username: { type: "string", description: "User's username (not nickname)", example: "wolfstar_user" },
                    discriminator: { type: "string", description: "User's 4-digit discriminator (legacy, '0' for new usernames)", example: "0" },
                    global_name: { type: "string", nullable: true, description: "User's display name (global)", example: "WolfStar User" },
                    avatar: { type: "string", nullable: true, description: "User's avatar hash", example: "a_1234567890abcdef1234567890abcdef" },
                    bot: { type: "boolean", description: "Whether the user is a bot account" },
                    system: { type: "boolean", description: "Whether the user is an Official Discord System user" },
                    mfa_enabled: { type: "boolean", description: "Whether the user has two factor enabled" },
                    banner: { type: "string", nullable: true, description: "User's banner hash" },
                    accent_color: { type: "integer", nullable: true, description: "User's banner color as integer" },
                    locale: { type: "string", description: "User's chosen language option", example: "en-US" },
                    verified: { type: "boolean", description: "Whether the email has been verified" },
                    email: { type: "string", nullable: true, description: "User's email (requires email scope)" },
                    flags: { type: "integer", description: "User's account flags" },
                    premium_type: { type: "integer", description: "Type of Nitro subscription" },
                    public_flags: { type: "integer", description: "User's public flags" },
                    avatar_decoration_data: { type: "object", nullable: true, description: "Avatar decoration data" },
                  },
                },
                guilds: {
                  type: "array",
                  nullable: true,
                  description: "RESTGetAPICurrentUserGuildsResult - Raw guilds from Discord API",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", description: "Guild snowflake ID", example: "987654321098765432" },
                      name: { type: "string", description: "Guild name (2-100 characters)", example: "WolfStar Support" },
                      icon: { type: "string", nullable: true, description: "Guild icon hash", example: "a_1234567890abcdef" },
                      owner: { type: "boolean", description: "True if the user is the owner of the guild" },
                      permissions: { type: "string", description: "Total permissions for the user (excludes overwrites)", example: "2199023255551" },
                      features: {
                        type: "array",
                        items: { type: "string" },
                        description: "Enabled guild features",
                        example: ["COMMUNITY", "NEWS", "ANIMATED_ICON"],
                      },
                      approximate_member_count: { type: "integer", description: "Approximate number of members" },
                      approximate_presence_count: { type: "integer", description: "Approximate number of online members" },
                    },
                  },
                },
                connections: {
                  type: "array",
                  nullable: true,
                  description: "RESTGetAPICurrentUserConnectionsResult - User's connections (requires connections scope)",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", description: "Connection account ID" },
                      name: { type: "string", description: "Connection account username" },
                      type: { type: "string", description: "Connection service type", example: "twitch" },
                      verified: { type: "boolean", description: "Whether the connection is verified" },
                      visibility: { type: "integer", description: "Visibility of the connection (0 = None, 1 = Everyone)" },
                    },
                  },
                },
                transformedGuilds: {
                  type: "array",
                  description: "OauthFlattenedGuild[] - Guilds transformed with bot-specific information",
                  items: {
                    type: "object",
                    description: "OauthFlattenedGuild from shared/types/discord.d.ts",
                    properties: {
                      id: { type: "string", description: "Guild snowflake ID", example: "987654321098765432" },
                      name: { type: "string", description: "Guild name", example: "WolfStar Support" },
                      acronym: { type: "string", description: "Guild name acronym for icon fallback", example: "WS" },
                      icon: { type: "string", nullable: true, description: "Guild icon hash" },
                      banner: { type: "string", nullable: true, description: "Guild banner hash" },
                      splash: { type: "string", nullable: true, description: "Guild splash hash" },
                      afkChannelId: { type: "string", nullable: true, description: "AFK channel ID" },
                      afkTimeout: { type: "integer", description: "AFK timeout in seconds", example: 300 },
                      applicationId: { type: "string", nullable: true, description: "Application ID if bot-created" },
                      approximateMemberCount: { type: "integer", description: "Approximate member count", example: 1500 },
                      approximatePresenceCount: { type: "integer", description: "Approximate online count", example: 350 },
                      defaultMessageNotifications: { type: "integer", description: "Default message notification level" },
                      description: { type: "string", nullable: true, description: "Guild description" },
                      widgetEnabled: { type: "boolean", description: "Whether widget is enabled" },
                      explicitContentFilter: { type: "integer", description: "Explicit content filter level" },
                      features: {
                        type: "array",
                        items: { type: "string" },
                        description: "Enabled guild features",
                      },
                      joinedTimestamp: { type: "integer", nullable: true, description: "When bot joined (if applicable)" },
                      mfaLevel: { type: "integer", description: "Required MFA level for moderation" },
                      ownerId: { type: "string", nullable: true, description: "Owner's user snowflake ID" },
                      partnered: { type: "boolean", description: "Whether the guild is partnered" },
                      preferredLocale: { type: "string", description: "Preferred locale", example: "en-US" },
                      premiumSubscriptionCount: { type: "integer", description: "Number of boosts", example: 14 },
                      premiumTier: { type: "integer", description: "Premium tier (0-3)", example: 2 },
                      systemChannelId: { type: "string", nullable: true, description: "System channel ID" },
                      vanityURLCode: { type: "string", nullable: true, description: "Vanity URL code" },
                      verificationLevel: { type: "integer", description: "Verification level required" },
                      verified: { type: "boolean", description: "Whether the guild is verified" },
                      permissions: { type: "integer", description: "User's computed permissions as integer", example: 2199023255551 },
                      manageable: { type: "boolean", description: "Whether the user can manage bot settings (has MANAGE_GUILD)", example: true },
                      wolfstarIsIn: { type: "boolean", description: "Whether WolfStar bot is in this guild", example: true },
                    },
                    required: ["id", "name", "acronym", "permissions", "manageable", "wolfstarIsIn"],
                  },
                },
              },
              required: ["transformedGuilds"],
            },
            example: {
              user: {
                id: "123456789012345678",
                username: "wolfstar_user",
                discriminator: "0",
                global_name: "WolfStar User",
                avatar: "a_1234567890abcdef",
                bot: false,
                verified: true,
                locale: "en-US",
                flags: 0,
                premium_type: 2,
                public_flags: 64,
              },
              guilds: [
                {
                  id: "987654321098765432",
                  name: "WolfStar Support",
                  icon: "a_1234567890abcdef",
                  owner: true,
                  permissions: "2199023255551",
                  features: ["COMMUNITY", "NEWS"],
                },
              ],
              transformedGuilds: [
                {
                  id: "987654321098765432",
                  name: "WolfStar Support",
                  acronym: "WS",
                  icon: "a_1234567890abcdef",
                  banner: null,
                  splash: null,
                  ownerId: "123456789012345678",
                  permissions: 2199023255551,
                  manageable: true,
                  wolfstarIsIn: true,
                  partnered: false,
                  verified: false,
                  premiumTier: 2,
                  premiumSubscriptionCount: 14,
                  approximateMemberCount: 1500,
                  approximatePresenceCount: 350,
                  features: ["COMMUNITY", "NEWS"],
                },
              ],
            },
          },
        },
      },
      401: { description: "Authentication required" },
      429: { description: "Rate limit exceeded" },
      500: { description: "Internal server error - failed to fetch or transform data" },
    },
    security: [{ discordOAuth: ["identify", "guilds"] }],
  },
});

export default defineWrappedResponseHandler(
  async (event) => {
    const { user, guilds } = await getCurrentUser(event);

    // Transform and return data with improved error handling
    const transformedData = await transformOauthGuildsAndUser({
      user,
      guilds,
    }).catch((error) => {
      throw createError({
        status: 500,
        statusText: `Data transformation failed`,
        message: error.message || "Unknown error",
      });
    });

    return { ...transformedData, guilds };
  },
  {
    auth: true,
    rateLimit: { enabled: true, window: seconds(5), limit: 2 },
    onSuccess(logger, { user }) {
      logger.info(`Successfully transformed guilds and user: ${user?.id}`);
    },
    onError(logger, error) {
      logger.error("Failed to transform guilds and user data:", error);
    },
  },
);
