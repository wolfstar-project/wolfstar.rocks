import type { GuildData } from "~~/server/database";
import { isNullOrUndefined } from "@sapphire/utilities";
import { z } from "zod/v4";
import { readSettings, serializeSettings } from "~~/server/database";
import { manageAbility } from "~~/shared/utils/abilities";

const querySchema = z.object({
  shouldSerialize: z.boolean().optional(),
  userId: z.string().optional(),
});

defineRouteMeta({
  openAPI: {
    tags: ["Discord Api"],
    description: "Get guild settings",
    parameters: [
      {
        in: "path",
        name: "guild",
        required: true,
        description: "The guild ID to fetch settings for",
      },
    ],
  },
});

export default defineWrappedResponseHandler(async (event) => {
  // Get guild ID from params
  const guildId = getRouterParam(event, "guild");
  if (isNullOrUndefined(guildId)) {
    throw createError({
      statusCode: 400,
      message: "No guild id provided",
      data: {
        field: "guildId",
        error: "guild_id_required",
        message: "Guild ID is required",
      },
    });
  }

  // Validate query parameters
  const { shouldSerialize } = await getValidatedQuery(event, querySchema.parse);

  const user = await event.context.$authorization.resolveServerUser();
  if (!user) {
    logger.error("Unauthorized user or missing session");
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
      data: {
        field: "user",
        error: "unauthorized",
        message: "Unauthorized",
      },
    });
  }

  // Fetch guilds with improved error handling
  logger.info(`Fetching guilds for user ${user.id}...`);
  const guild = await getGuild(guildId);

  // Fetch member data
  const member = await getMember(guild, user);

  // Check permissions
  if (await denies(event, manageAbility, guild, member)) {
    throw createError({
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

  // Read and return settings
  const settings = await readSettings(guild.id);
  return shouldSerialize ? serializeSettings(settings) : (settings as unknown as GuildData);
}, {
  auth: true,
  onError: (err) => {
    logger.error("Settings API error:", {
      message: err.message,
      statusCode: err.statusCode,
      data: err.data,
    });
  },
});
