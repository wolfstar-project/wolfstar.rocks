defineRouteMeta({
  openAPI: {
    tags: ["Guild Members"],
    summary: "List all members",
    description: "Retrieves a list of all members within a guild. Requires the user to have management permissions for the guild.",
    operationId: "listGuildMembers",
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
        description: "Whether to serialize the member data for API response",
        schema: { type: "boolean" },
      },
    ],
    responses: {
      200: {
        description: "List of members retrieved successfully",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", description: "The member's user snowflake ID" },
                  guildId: { type: "string", description: "The guild's snowflake ID" },
                  joinedTimestamp: { type: "integer", nullable: true, description: "Unix timestamp when the member joined" },
                  premiumSinceTimestamp: { type: "integer", nullable: true, description: "Unix timestamp when the member started boosting" },
                  roles: { type: "array", description: "List of roles the member has" },
                  user: { type: "object", description: "The user object" },
                },
              },
            },
          },
        },
      },
      401: { description: "Authentication required" },
      403: { description: "Insufficient permissions to access this guild" },
      429: { description: "Rate limit exceeded" },
      500: { description: "Failed to fetch members from Discord" },
    },
    security: [{ discordOAuth: ["identify", "guilds"] }],
  },
});

export default defineWrappedResponseHandler(async (event) => {
  const api = useApi();

  const guildId = getGuildParam(event);

  const guild = await getGuild(guildId);

  const member = await getCurrentMember(event, guild.id);
  // Check permissions
  await canManage(guild, member);

  const members = await api.guilds.getMembers(guildId).catch((error) => {
    throw createError({
      status: 500,
      statusText: "Failed to fetch members",
      data: {
        error: "members_fetch_failed",
        message: error.message || "Unknown error",
        details: error,
      },
    });
  });

  return members.map((member) => flattenMember(member, guild));
}, {
  auth: true,
  rateLimit: { enabled: true, window: seconds(5), limit: 2 },
  onSuccess(logger, data) {
    const count = Array.isArray(data) ? data.length : 0;
    const guildId = Array.isArray(data) && data.length > 0 && typeof (data)[0]?.guildId === "string"
      ? (data)[0].guildId
      : "unknown";
    logger.info(`Successfully retrieved ${count} members for guild ID: ${guildId}`);
  },
  onError(logger, error) {
    logger.error("Failed to retrieve members:", error);
  },
});
