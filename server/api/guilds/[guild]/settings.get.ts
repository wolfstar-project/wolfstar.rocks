import type { GuildData } from "~~/server/database";
import { isNullOrUndefined } from "@sapphire/utilities";
import * as yup from "yup";
import { readSettings, serializeSettings } from "~~/server/database";
import { manageAbility } from "~~/shared/utils/abilities";

const querySchema = yup.object({
  shouldSerialize: yup.boolean().optional().default(false),
  userId: yup.string().optional(),
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
  const { shouldSerialize } = await getValidatedQuery(event, querySchema.validate);

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
  const guild = await getGuild(event, guildId);

  // Fetch member data
  const member = await getMember(event, guild, user as any);

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
  rateLimit: { enabled: true, window: seconds(5), limit: 2 },
  onError: (logger, err) => {
    logger.error("Settings API error:", {
      message: err.message,
      statusCode: err.statusCode,
      data: err.data,
    });
  },
});
