import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import { manageAbility } from "#shared/utils/abilities";
import * as yup from "yup";

const querySchema = yup.object({
  shouldSerialize: yup.boolean().optional(),
});

defineRouteMeta({
  openAPI: {
    tags: ["Discord API"],
    summary: "Get guild by ID",
    description: "Retrieves detailed information about a specific guild, including its settings and configuration. Requires the user to have management permissions for the guild.",
    operationId: "getGuild",
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
        description: "Whether to serialize the guild data for API response",
        schema: { type: "boolean", default: false },
      },
    ],
    responses: {
      200: {
        description: "Guild data retrieved successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string", description: "The guild's snowflake ID", example: "123456789012345678" },
                name: { type: "string", description: "The guild name", example: "My Discord Server" },
                acronym: { type: "string", description: "The guild name acronym", example: "MDS" },
                icon: { type: "string", nullable: true, description: "The guild icon hash" },
                banner: { type: "string", nullable: true, description: "The guild banner hash" },
                ownerId: { type: "string", description: "The owner's user ID" },
                description: { type: "string", nullable: true, description: "The guild description" },
                features: { type: "array", items: { type: "string" }, description: "Enabled guild features" },
                approximateMemberCount: { type: "integer", description: "Approximate number of members" },
                premiumTier: { type: "integer", description: "Server boost level (0-3)" },
                premiumSubscriptionCount: { type: "integer", description: "Number of server boosts" },
                verificationLevel: { type: "integer", description: "Verification level required" },
                channels: { type: "array", description: "List of guild channels" },
                roles: { type: "array", description: "List of guild roles" },
                permissions: { type: "integer", description: "User's permissions in the guild" },
              },
            },
          },
        },
      },
      401: { description: "Authentication required" },
      403: { description: "Insufficient permissions to access this guild" },
      404: { description: "Guild not found or bot is not in the guild" },
      429: { description: "Rate limit exceeded" },
      500: { description: "Failed to fetch guild data from Discord" },
    },
    security: [{ discordOAuth: ["identify", "guilds"] }],
  },
});

export default defineWrappedResponseHandler(
  async (event) => {
    const api = useApi();

    // Get guild ID from params
    const guildId = getGuildParam(event);

    const { shouldSerialize } = await getValidatedQuery(event, (body) =>
      querySchema.validate(body));

    const { user } = await getCurrentUser(event);

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

    const channels = await api.guilds.getChannels(guild.id).catch((error) => {
      throw createApiError({
        statusCode: 500,
        message: "Failed to fetch channels",
        error,
      });
    });

    // Return flattened guild data
    const result = shouldSerialize
      ? await transformGuild(user.id, guild as RESTAPIPartialCurrentUserGuild)
      : flattenGuild({ ...guild, channels });
    return result;
  },
  {
    auth: true,
    rateLimit: { enabled: true, window: seconds(5), limit: 2 },
    onSuccess(logger, data) {
      logger.info(`Successfully retrieved guild data for guild ID: ${data.id}`);
    },
    onError(logger, error) {
      logger.error(`Guilds API error: ${error.message}`);
    },
  },
);
