import { manageAbility } from "#shared/utils/abilities";
import {
  isNullOrUndefined,
  isNullOrUndefinedOrZero,
} from "@sapphire/utilities";
import { createError } from "h3";
import * as yup from "yup";
import {
  serializeSettings,
  writeSettingsTransaction,
} from "~~/server/database";

const settingsUpdateSchema = yup.object({
  data: yup
    .array()
    .of(yup.tuple([yup.string().required(), yup.mixed().required()])),
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

export default defineWrappedResponseHandler(
  async (event) => {
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
    const body = await readValidatedBody(event, (body) =>
      settingsUpdateSchema.validate(body));

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

    if (isNullOrUndefinedOrZero(data)) {
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
    const trx = await writeSettingsTransaction(guild.id);
    await trx
      .write(
        Object.fromEntries(
          data.filter((entry): entry is [string, any] => entry !== undefined),
        ),
      )
      .submit();
    return serializeSettings(trx.settings);
  },
  {
    auth: true,
    rateLimit: { enabled: true, window: seconds(1), limit: 2 },
    onError: (logger, err) => logger.error(`Settings API error:${err.message}`),
  },
);
