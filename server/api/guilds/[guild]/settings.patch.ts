import { Result } from "@sapphire/result";
import { isNullOrUndefined } from "@sapphire/utilities";
import { createError } from "h3";
import { z } from "zod/v4";
import { serializeSettings, writeSettingsTransaction } from "~~/server/database";
import { manageAbility } from "~~/shared/utils/abilities";

const settingsUpdateSchema = z.object({
  data: z.array(z.tuple([z.string(), z.unknown()])),
});

defineRouteMeta({
  openAPI: {
    tags: ["Discord Api"],
    description: "Update guild settings",
    parameters: [
      {
        in: "path",
        name: "guild",
        required: true,
        description: "The guild ID to update settings for",
      },
    ],
  },
});

export default defineWrappedResponseHandler(async (event) => {
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

  // Get and validate body data
  const body = await readValidatedBody(event, settingsUpdateSchema.parse);

  if (isNullOrUndefined(body)) {
    throw createError({
      statusCode: 400,
      message: "Invalid request body",
      data: {
        field: "body",
        error: "invalid_request_body",
        message: "Invalid request body",
      },
    });
  }

  const { data } = body;

  if (data.length === 0) {
    throw createError({
      statusCode: 400,
      message: "No settings provided",
      data: {
        field: "data",
        error: "no_settings_provided",
        message: "No settings provided",
      },
    });
  }

  const user = await event.context.$authorization.resolveServerUser();
  if (!user) {
    logger.error("Unauthorized user or missing session");
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
      data: {
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

  // Update settings
  const updateResult = await Result.fromAsync(async () => {
    const trx = await writeSettingsTransaction(guild.id);
    await trx.write(Object.fromEntries(data)).submit();
    return serializeSettings(trx.settings);
  });

  return updateResult.unwrapOrElse((error) => {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update settings",
      data: {
        error: "settings_update_failed",
        message: Array.isArray(error) ? error.join("\n") : String(error),
        details: error,
      },
    });
  });
}, {
  auth: true,
  rateLimit: { enabled: true, window: seconds(1), limit: 2 },
  onError: (logger, err) => {
    logger.error("Settings API error:", {
      message: err.message,
      statusCode: err.statusCode,
      data: err.data,
    });
  },
});
