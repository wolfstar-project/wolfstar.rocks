import { manageAbility } from "#shared/utils/abilities";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";

defineRouteMeta({
  openAPI: {
    tags: ["Discord API"],
    summary: "Get role by ID",
    description: "Retrieves detailed information about a specific role within a guild, including its permissions and color. Requires the user to have management permissions for the guild.",
    operationId: "getGuildRole",
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
        name: "role",
        required: true,
        description: "The Discord snowflake ID of the role to retrieve",
        schema: { type: "string", example: "987654321098765432" },
      },
    ],
    responses: {
      200: {
        description: "Role data retrieved successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", description: "The role's snowflake ID", example: "987654321098765432" },
                guildId: { type: "string", description: "The guild's snowflake ID", example: "123456789012345678" },
                name: { type: "string", description: "The role name", example: "Moderator" },
                color: { type: "integer", description: "The role color as an integer", example: 3447003 },
                hoist: { type: "boolean", description: "Whether the role is displayed separately", example: true },
                icon: { type: "string", nullable: true, description: "The role icon hash" },
                managed: { type: "boolean", description: "Whether the role is managed by an integration", example: false },
                mentionable: { type: "boolean", description: "Whether the role can be mentioned", example: true },
                permissions: { type: "string", description: "The role permissions as a bitfield string", example: "1071698660929" },
                rawPosition: { type: "integer", description: "The role's position in the role list", example: 5 },
              },
            },
          },
        },
      },
      400: { description: "Role ID is required or invalid" },
      401: { description: "Authentication required" },
      403: { description: "Insufficient permissions to access this guild" },
      404: { description: "Role not found in the guild" },
      429: { description: "Rate limit exceeded" },
      500: { description: "Failed to fetch role data from Discord" },
    },
    security: [{ discordOAuth: ["identify", "guilds"] }],
  },
});

export default defineWrappedResponseHandler(async (event) => {
  const api = useApi();

  // Get guild ID from params
  const guildId = getGuildParam(event);

  const user = await getCurrentUser(event);

  const guild = await getGuild(guildId);

  // Fetch member data
  const member = await getMember(guild, user);

  // Check permissions
  if (await denies(event, manageAbility, guild, member)) {
    throw createApiError({
      statusCode: 403,
      message: "Insufficient permissions",
      data: {
        error: "insufficient_permissions",
        message: "Insufficient permissions",
        details: {
          guild: guild.id,
          member: member.user.id,
        },
      },
    });
  }

  const roleId = getRouterParam(event, "role");
  if (isNullOrUndefined(roleId)) {
    throw createApiError({
      statusCode: 400,
      message: "No role id provided",
      data: {
        field: "roleId",
        error: "role_id_required",
        message: "Role ID is required",
      },
    });
  }

  const role = await api.guilds.getRole(guild.id, roleId).catch((error) => {
    throw createApiError({
      statusCode: 500,
      message: "Failed to fetch role",
      error,
      data: {
        error: "role_fetch_failed",
        message: error.message || "Unknown error",
        details: error,
      },
    });
  });

  // Return flattened guild data
  return flattenRole(guild.id, role);
}, {
  auth: true,
  rateLimit: { enabled: true, window: seconds(5), limit: 2 },
  onSuccess(logger, data) {
    logger.info(`Successfully retrieved role data for role ID: ${data.id} in guild ID: ${data.guildId}`);
  },
  onError(logger, error) {
    logger.error("Roles API error:", error);
  },
});
