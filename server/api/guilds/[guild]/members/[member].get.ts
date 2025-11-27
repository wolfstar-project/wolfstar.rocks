import { isNullOrUndefined } from "@sapphire/utilities/isNullish";

defineRouteMeta({
  openAPI: {
    tags: ["Discord API", "Member"],
    summary: "Get member by ID",
    description: "Retrieves detailed information about a specific member within a guild, including their roles and permissions.",
    operationId: "getGuildMember",
    parameters: [
      {
        in: "path",
        name: "guild",
        required: true,
        description: "The Discord snowflake ID of the guild",
        schema: { type: "string", example: "123456789012345678" },
      },
      {
        in: "path",
        name: "member",
        required: true,
        description: "The Discord snowflake ID of the member to retrieve",
        schema: { type: "string", example: "987654321098765432" },
      },
    ],
    responses: {
      200: {
        description: "Member data retrieved successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", description: "The member's user snowflake ID", example: "987654321098765432" },
                guildId: { type: "string", description: "The guild's snowflake ID", example: "123456789012345678" },
                joinedTimestamp: { type: "integer", nullable: true, description: "Unix timestamp when the member joined", example: 1609459200000 },
                premiumSinceTimestamp: { type: "integer", nullable: true, description: "Unix timestamp when the member started boosting" },
                roles: {
                  type: "array",
                  description: "List of roles the member has",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", description: "Role snowflake ID" },
                      name: { type: "string", description: "Role name" },
                      color: { type: "integer", description: "Role color as integer" },
                      position: { type: "integer", description: "Role position" },
                    },
                  },
                },
                user: {
                  type: "object",
                  description: "The user object",
                  properties: {
                    id: { type: "string", description: "User snowflake ID" },
                    username: { type: "string", description: "Username" },
                    discriminator: { type: "string", description: "User discriminator" },
                    globalName: { type: "string", nullable: true, description: "Display name" },
                    avatar: { type: "string", nullable: true, description: "Avatar hash" },
                    bot: { type: "boolean", description: "Whether the user is a bot" },
                  },
                },
              },
            },
          },
        },
      },
      400: { description: "Member ID is required or invalid" },
      401: { description: "Authentication required" },
      404: { description: "Member not found in the guild" },
      429: { description: "Rate limit exceeded" },
      500: { description: "Failed to fetch member data from Discord" },
    },
    security: [{ discordOAuth: ["identify", "guilds"] }],
  },
});

export default defineWrappedResponseHandler(async (event) => {
  // Get guild ID from params
  const guildId = getGuildParam(event);

  const user = await getCurrentUser(event);

  const guild = await getGuild(guildId);

  const memberId = getRouterParam(event, "member");
  if (isNullOrUndefined(memberId)) {
    throw createApiError({
      statusCode: 400,
      message: "Member ID is required",
    });
  }

  // Fetch member data
  const member = await getMember(guild, user);

  return flattenMember(member, guild);
}, {
  rateLimit: { enabled: true, window: seconds(5), limit: 2 },
  auth: true,
  onError: (logger, error) =>
    logger.error(`Members API error:\n${error.message}`),
});
